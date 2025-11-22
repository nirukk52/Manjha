/**
 * Message classification logic for routing to appropriate agents.
 * 
 * Uses a two-tier approach:
 * 1. Fast heuristics (keyword matching) for obvious cases (< 50ms)
 * 2. LLM classification for ambiguous messages (fallback only)
 * 
 * Target: < 500ms classification latency (per spec)
 */

import { api } from "encore.dev/api";
import OpenAI from "openai";
import { secret } from "encore.dev/config";
import { 
  AgentType, 
  ClassificationRequest, 
  ClassificationResult 
} from "../contracts/api.types.js";
import { CLASSIFICATION_CONFIG, TIMEOUTS } from "../common/config/constants.js";
import { logClassification, logError } from "../common/logging/logger.js";

// OpenAI API key from Encore secrets
const openAIKey = secret("OpenAIApiKey");

/**
 * Classifies a user message to determine which agent should handle it.
 * 
 * @param req - Classification request with message content
 * @returns Classification result with agent type and confidence
 * 
 * Why this endpoint exists: Core routing logic for the entire chat system
 */
export const classify = api(
  { method: "POST", expose: false },
  async (req: ClassificationRequest): Promise<ClassificationResult> => {
    const startTime = performance.now();
    
    try {
      // Step 1: Try fast heuristic classification first
      const heuristicResult = classifyByHeuristics(req.content);
      
      if (heuristicResult) {
        const latencyMs = Math.round(performance.now() - startTime);
        const result: ClassificationResult = {
          agentType: heuristicResult.agentType,
          confidence: heuristicResult.confidence,
          reasoning: `Heuristic match: ${heuristicResult.reasoning}`,
          latencyMs,
        };
        
        logClassification(result, { method: 'heuristic' });
        return result;
      }
      
      // Step 2: Fallback to LLM classification for ambiguous cases
      const llmResult = await classifyByLLM(req.content);
      const latencyMs = Math.round(performance.now() - startTime);
      
      const result: ClassificationResult = {
        ...llmResult,
        latencyMs,
      };
      
      logClassification(result, { method: 'llm' });
      return result;
      
    } catch (error) {
      const latencyMs = Math.round(performance.now() - startTime);
      logError('CLASSIFICATION_FAILED', 'Classification error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        latencyMs 
      });
      
      // Fallback to general agent on classification failure
      return {
        agentType: AgentType.GENERAL,
        confidence: 0.5,
        reasoning: 'Classification failed, defaulting to general agent',
        latencyMs,
      };
    }
  }
);

/**
 * Fast heuristic classification based on keyword matching.
 * 
 * @param content - User message content
 * @returns Classification result or null if ambiguous
 * 
 * Why this exists: Provides < 50ms classification for obvious finance queries
 */
function classifyByHeuristics(
  content: string
): { agentType: AgentType; confidence: number; reasoning: string } | null {
  const lowerContent = content.toLowerCase();
  const words = lowerContent.split(/\s+/);
  
  // Check for finance keywords
  const financeKeywordMatches = CLASSIFICATION_CONFIG.FINANCE_KEYWORDS.filter(
    keyword => lowerContent.includes(keyword)
  );
  
  if (financeKeywordMatches.length >= 2) {
    return {
      agentType: AgentType.FINANCE,
      confidence: 0.95,
      reasoning: `Multiple finance keywords: ${financeKeywordMatches.join(', ')}`,
    };
  }
  
  if (financeKeywordMatches.length === 1 && words.length < 10) {
    return {
      agentType: AgentType.FINANCE,
      confidence: 0.85,
      reasoning: `Single finance keyword in short query: ${financeKeywordMatches[0]}`,
    };
  }
  
  // Check for obvious general queries (greetings, help)
  const generalPatterns = [
    /^(hi|hello|hey|greetings)/i,
    /^(help|how do i|what is|tell me about)/i,
    /^(thanks|thank you)/i,
  ];
  
  if (generalPatterns.some(pattern => pattern.test(content))) {
    return {
      agentType: AgentType.GENERAL,
      confidence: 0.9,
      reasoning: 'General greeting or help request',
    };
  }
  
  // Ambiguous - need LLM classification
  return null;
}

/**
 * LLM-based classification for ambiguous messages.
 * 
 * @param content - User message content
 * @returns Classification result with reasoning
 * 
 * Why this exists: Handles edge cases where heuristics are insufficient
 */
async function classifyByLLM(content: string): Promise<{
  agentType: AgentType;
  confidence: number;
  reasoning: string;
}> {
  const openai = new OpenAI({ apiKey: openAIKey() || process.env.OPENAI_API_KEY });
  
  const systemPrompt = `You are a message classifier for a financial chat application. 
Your job is to determine if a user message is:
1. FINANCE - Questions about portfolio, P&L, risk, stocks, investments, trading, financial analysis
2. GENERAL - Greetings, help requests, general conversation, non-finance topics

Respond in JSON format: {"type": "FINANCE" | "GENERAL", "confidence": 0.0-1.0, "reasoning": "brief explanation"}`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Classify this message: "${content}"` },
    ],
    temperature: 0.3,
    max_tokens: 100,
    response_format: { type: "json_object" },
  });
  
  const result = JSON.parse(response.choices[0]?.message?.content ?? '{}') as {
    type?: string;
    confidence?: number;
    reasoning?: string;
  };
  
  return {
    agentType: result.type === 'FINANCE' ? AgentType.FINANCE : AgentType.GENERAL,
    confidence: result.confidence ?? 0.7,
    reasoning: result.reasoning ?? 'LLM classification',
  };
}



