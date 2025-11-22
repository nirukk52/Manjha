/**
 * Finance agent implementation using OpenAI GPT-4 for detailed financial analysis.
 * 
 * This is a simplified version for MVP - focused on direct question answering.
 * Full multi-agent orchestration will be added in Phase 6 (LangGraph).
 */

import { api } from "encore.dev/api";
import OpenAI from "openai";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { secret } from "encore.dev/config";
import { FinanceQuery, FinanceResponse, AgentType } from "../contracts/api.types.js";
import { AGENT_CONFIG, TIMEOUTS } from "../common/config/constants.js";
import { logAgentCall, logError } from "../common/logging/logger.js";

// OpenAI API key from Encore secrets
const openAIKey = secret("OpenAIApiKey");

/**
 * Creates a LangChain ChatOpenAI client with LangSmith tracing enabled.
 * 
 * Why this exists: Enables LangSmith observability for agent debugging and analysis.
 * Set LANGSMITH_API_KEY and LANGCHAIN_TRACING_V2=true environment variables to enable.
 */
function createLangChainClient() {
  return new ChatOpenAI({
    modelName: AGENT_CONFIG.FINANCE_MODEL,
    openAIApiKey: openAIKey(),
    temperature: AGENT_CONFIG.TEMPERATURE,
    maxTokens: AGENT_CONFIG.FINANCE_MAX_TOKENS,
    streaming: true,
    // LangSmith automatically enabled via environment variables:
    // LANGCHAIN_TRACING_V2=true
    // LANGSMITH_API_KEY=your-key
    // LANGCHAIN_PROJECT=manjha-finance-agent
  });
}

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
    // Try LangChain first (for LangSmith tracing), fallback to native OpenAI
    const useLangChain = process.env.LANGCHAIN_TRACING_V2 === 'true';
    
    if (useLangChain) {
      try {
        const llm = createLangChainClient();
        const systemPrompt = `You are a senior financial analyst with expertise in portfolio analysis, 
risk management, and financial markets. Provide detailed, accurate financial analysis.`;

        const messages = [
          new SystemMessage(systemPrompt),
          new HumanMessage(req.question),
        ];
        
        const stream = await llm.stream(messages);
        
        for await (const chunk of stream) {
          const content = chunk.content;
          if (content && typeof content === 'string') {
            yield content;
          }
        }
        
        const processingTimeMs = Math.round(performance.now() - startTime);
        logAgentCall(AgentType.FINANCE, req.question, processingTimeMs, true);
        return;
      } catch (langchainError) {
        logError('AGENT_ERROR', 'LangChain streaming failed, falling back to OpenAI', {
          error: langchainError instanceof Error ? langchainError.message : 'Unknown',
        });
        // Fall through to native OpenAI
      }
    }
    
    // Fallback: Native OpenAI streaming (always works)
    const apiKey = openAIKey();
    if (!apiKey) {
      throw new Error("OpenAI API key is not set. Set it with: encore secret set --type local OpenAIApiKey");
    }
    
    const openai = new OpenAI({ apiKey });
    
    const systemPrompt = `You are a senior financial analyst with expertise in portfolio analysis, 
risk management, and financial markets. Provide detailed, accurate financial analysis.`;

    logError('AGENT_DEBUG', 'Starting OpenAI streaming', {
      model: AGENT_CONFIG.FINANCE_MODEL,
      question_preview: req.question.slice(0, 50),
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
    logAgentCall(AgentType.FINANCE, req.question, processingTimeMs, true);
    
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

