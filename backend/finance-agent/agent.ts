/**
 * Finance Agent - Handles financial analysis queries using OpenAI GPT-4.
 * 
 * Integrates with Zerodha connector for real portfolio data when attached.
 */

import { api } from "encore.dev/api";
import OpenAI from "openai";
import { secret } from "encore.dev/config";
import { FinanceQuery, FinanceResponse, AgentType } from "../contracts/api.types.js";
import { AGENT_CONFIG, TIMEOUTS } from "../common/config/constants.js";
import { logAgentCall, logError } from "../common/logging/logger.js";
import { getHoldings, status as zerodhaStatus } from "../zerodha-agent/zerodha.js";

/**
 * Zerodha tool descriptions - used in system prompt so agent knows what data is available
 */
const ZERODHA_TOOLS_DESCRIPTION = `
## Available Zerodha Tools

When the user has connected their Zerodha account, you have access to their REAL trading data:

### 1. Holdings (Long-term Investments)
- Shows all stocks in user's DEMAT account
- Includes: Symbol, Exchange, Quantity, Average Buy Price, Current Price, P&L, Day Change
- Use for: "show my holdings", "what stocks do I own", "my portfolio", "my investments"

### 2. Positions (Intraday/Short-term)  
- Shows current day's trades and open positions
- Includes: Symbol, Quantity, Buy/Sell prices, P&L, Product type (MIS/NRML/CNC)
- Use for: "my positions", "today's trades", "open positions", "intraday positions"

### 3. Margins (Account Balance)
- Shows available cash, used margin, collateral
- Use for: "my balance", "available margin", "how much can I trade", "account balance"

IMPORTANT: When user asks about their portfolio, holdings, positions, balance, or anything about "my" investments - ALWAYS use the real data provided. Never make up data.
`;

/**
 * Kite Holdings response structure (from https://kite.trade/docs/connect/v3/portfolio/)
 */
interface KiteHolding {
  tradingsymbol: string;
  exchange: string;
  quantity: number;
  average_price: number;
  last_price: number;
  close_price: number;
  pnl: number;
  day_change: number;
  day_change_percentage: number;
  product: string;
}

/**
 * Fetches Zerodha portfolio data if user is connected
 */
async function fetchZerodhaContext(deviceId: string): Promise<string | null> {
  try {
    // Check if connected
    const statusResult = await zerodhaStatus({ deviceId });
    if (!statusResult.isConnected) {
      return null;
    }

    // Fetch holdings
    const holdingsResult = await getHoldings({ deviceId });
    if (!holdingsResult.success) {
      return `Zerodha connected as ${statusResult.userName}, but couldn't fetch holdings: ${holdingsResult.error}`;
    }

    const holdings = holdingsResult.data as KiteHolding[];

    if (!holdings || holdings.length === 0) {
      return `Zerodha connected as ${statusResult.userName}. No holdings found in the account.`;
    }

    // Format holdings for context
    let context = `## Zerodha Portfolio Data (${statusResult.userName})\n\n`;
    context += `### Holdings (${holdings.length} stocks)\n\n`;
    context += `| Symbol | Exchange | Qty | Avg Price | LTP | Day Change | P&L |\n`;
    context += `|--------|----------|-----|-----------|-----|------------|-----|\n`;
    
    let totalValue = 0;
    let totalPnl = 0;
    
    for (const h of holdings) {
      const currentValue = h.quantity * h.last_price;
      totalValue += currentValue;
      totalPnl += h.pnl;
      const dayChangeStr = h.day_change >= 0 ? `+${h.day_change.toFixed(2)}` : h.day_change.toFixed(2);
      const pnlStr = h.pnl >= 0 ? `+₹${h.pnl.toFixed(2)}` : `-₹${Math.abs(h.pnl).toFixed(2)}`;
      context += `| ${h.tradingsymbol} | ${h.exchange} | ${h.quantity} | ₹${h.average_price.toFixed(2)} | ₹${h.last_price.toFixed(2)} | ${dayChangeStr} (${h.day_change_percentage.toFixed(2)}%) | ${pnlStr} |\n`;
    }
    
    context += `\n**Total Portfolio Value:** ₹${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
    context += `**Total P&L:** ${totalPnl >= 0 ? '+' : ''}₹${totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;

    return context;
  } catch (error) {
    logError('ZERODHA_CONTEXT', 'Failed to fetch Zerodha context', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
    return null;
  }
}

// OpenAI API key from Encore secrets
const openAIKey = secret("OpenAIApiKey2");

/**
 * Provides detailed financial analysis for a given query.
 * 
 * @param req - Finance query request
 * @returns Detailed analysis with sources and confidence
 * 
 * Why this endpoint exists: Core value proposition - intelligent financial research
 */
export const analyze = api(
  { method: "POST", expose: false },
  async (req: FinanceQuery): Promise<FinanceResponse> => {
    const startTime = performance.now();
    
    try {
      const openai = new OpenAI({ apiKey: openAIKey() });
      
      const systemPrompt = `You are a senior financial analyst with expertise in portfolio analysis, 
risk management, and financial markets. 

Your role:
- Provide detailed, accurate financial analysis
- Explain concepts clearly for retail investors
- Reference specific metrics when relevant
- Acknowledge uncertainty when data is unavailable
- Suggest follow-up analyses when appropriate

For MVP: Provide thoughtful analysis based on general financial knowledge. 
Note when you would need specific portfolio data to give more precise answers.`;

      const response = await openai.chat.completions.create({
        model: AGENT_CONFIG.FINANCE_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: req.question },
        ],
        max_tokens: AGENT_CONFIG.FINANCE_MAX_TOKENS,
        temperature: AGENT_CONFIG.TEMPERATURE,
      }, {
        timeout: TIMEOUTS.FINANCE_AGENT_MS,
      });
      
      const answer = response.choices[0]?.message?.content ?? "I'm unable to analyze this query at the moment.";
      const processingTimeMs = Math.round(performance.now() - startTime);
      
      logAgentCall(
        AgentType.FINANCE,
        req.question,
        processingTimeMs,
        true,
        { 
          tokens_used: response.usage?.total_tokens,
          model: AGENT_CONFIG.FINANCE_MODEL,
        }
      );
      
      return {
        answer,
        confidence: 0.85, // TODO: Implement confidence scoring in Phase 6
        sources: ["General financial knowledge"], // TODO: Add real sources in Phase 6
        processingTimeMs,
      };
      
    } catch (error) {
      const processingTimeMs = Math.round(performance.now() - startTime);
      
      logError('AGENT_ERROR', 'Finance agent failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query_preview: req.question.slice(0, 100),
      });
      
      logAgentCall(
        AgentType.FINANCE,
        req.question,
        processingTimeMs,
        false,
        { error: error instanceof Error ? error.message : 'Unknown' }
      );
      
      throw new Error('Finance agent unavailable');
    }
  }
);

/**
 * Streaming version of the finance agent for real-time response delivery.
 * 
 * @param req - Finance query request
 * @returns Async generator yielding response chunks
 * 
 * Why this exists: Enables progressive rendering for better UX (< 3s first token target)
 */
export async function* analyzeStreaming(
  req: FinanceQuery
): AsyncGenerator<string, void, unknown> {
  const startTime = performance.now();
  
  try {
    // HARD CHECK: Only fetch Zerodha data if connector is explicitly attached
    let zerodhaContext: string | null = null;
    const zerodhaAttached = req.hasZerodha === true && !!req.deviceId;
    
    if (zerodhaAttached) {
      logError('AGENT_DEBUG', 'Zerodha connector ATTACHED - fetching portfolio data', {
        deviceId: req.deviceId,
        hasZerodha: req.hasZerodha,
      });
      zerodhaContext = await fetchZerodhaContext(req.deviceId!);
      
      if (!zerodhaContext) {
        logError('AGENT_WARN', 'Zerodha attached but not connected - user needs to authenticate', {
          deviceId: req.deviceId,
        });
      }
    }

    // Build system prompt
    let systemPrompt = `You are a senior financial analyst with expertise in portfolio analysis, 
risk management, and financial markets. Provide detailed, accurate financial analysis.`;

    if (zerodhaAttached && zerodhaContext) {
      // Add tool descriptions so agent knows what's available
      systemPrompt += `\n\n${ZERODHA_TOOLS_DESCRIPTION}`;
      
      // Add actual portfolio data
      systemPrompt += `\n\n--- USER'S REAL PORTFOLIO DATA ---\n${zerodhaContext}\n--- END PORTFOLIO DATA ---`;
      
      // Strong instruction to use real data
      systemPrompt += `\n\n⚠️ CRITICAL: The user has connected their Zerodha account. You MUST use their REAL portfolio data shown above when answering questions about their holdings, positions, investments, or account. NEVER make up fictional data. If asked about their portfolio, analyze the ACTUAL data provided.`;
    } else if (zerodhaAttached && !zerodhaContext) {
      // Zerodha attached but not authenticated
      systemPrompt += `\n\n⚠️ NOTE: The user has attached their Zerodha connector but is NOT authenticated. If they ask about their portfolio, tell them to click the Connect button to authenticate with Zerodha first.`;
    }

    // Fallback: Native OpenAI streaming (always works)
    const apiKey = openAIKey() || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key is not set. Set it with: encore secret set --type local OpenAIApiKey or OPENAI_API_KEY env var");
    }
    
    const openai = new OpenAI({ apiKey });

    logError('AGENT_DEBUG', 'Starting OpenAI streaming', {
      model: AGENT_CONFIG.FINANCE_MODEL,
      question_preview: req.question.slice(0, 50),
      has_zerodha_context: !!zerodhaContext,
    });

    const stream = await openai.chat.completions.create({
      model: AGENT_CONFIG.FINANCE_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: req.question },
      ],
      max_tokens: AGENT_CONFIG.FINANCE_MAX_TOKENS,
      temperature: AGENT_CONFIG.TEMPERATURE,
      stream: true,
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
    
    const processingTimeMs = Math.round(performance.now() - startTime);
    logAgentCall(AgentType.FINANCE, req.question, processingTimeMs, true, {
      has_zerodha_context: !!zerodhaContext,
    });
    
  } catch (error) {
    const processingTimeMs = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logError('AGENT_ERROR', 'Finance agent streaming failed', {
      error: errorMessage,
      query_preview: req.question.slice(0, 100),
      error_stack: errorStack,
    });
    logAgentCall(AgentType.FINANCE, req.question, processingTimeMs, false, {
      error: errorMessage,
    });
    throw error;
  }
}

