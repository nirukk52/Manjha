/**
 * General agent implementation using OpenAI GPT-3.5-turbo for fast, concise responses.
 */

import { api } from "encore.dev/api";
import OpenAI from "openai";
import { secret } from "encore.dev/config";
import { GeneralQuery, GeneralResponse, AgentType } from "../contracts/api.types.js";
import { AGENT_CONFIG, TIMEOUTS } from "../common/config/constants.js";
import { SecretKeys } from "../common/config/secrets.js";
import { logAgentCall, logError } from "../common/logging/logger.js";

// OpenAI API key from Encore secrets
const openAIKey = secret(SecretKeys.OPENAI_API_KEY);

/**
 * Generates a concise response to a general (non-finance) query.
 * 
 * @param req - General query request
 * @returns Short answer with processing time
 * 
 * Why this endpoint exists: Fast, cost-effective responses for non-finance queries
 */
export const respond = api(
  { method: "POST", expose: false },
  async (req: GeneralQuery): Promise<GeneralResponse> => {
    const startTime = performance.now();
    
    try {
      const openai = new OpenAI({ apiKey: openAIKey() || process.env.OPENAI_API_KEY });
      
      const systemPrompt = `You are a helpful assistant for a financial application. 
You provide brief, friendly responses to general questions, greetings, and help requests.
Keep responses under 50 words. For finance-specific questions, politely redirect 
users to ask their financial questions in the chat.`;

      const response = await openai.chat.completions.create({
        model: AGENT_CONFIG.GENERAL_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: req.question },
        ],
        max_tokens: req.maxTokens,
        temperature: AGENT_CONFIG.TEMPERATURE,
      }, {
        timeout: TIMEOUTS.GENERAL_AGENT_MS,
      });
      
      const answer = response.choices[0]?.message?.content ?? "I'm here to help! How can I assist you?";
      const processingTimeMs = Math.round(performance.now() - startTime);
      
      logAgentCall(
        AgentType.GENERAL,
        req.question,
        processingTimeMs,
        true,
        { tokens_used: response.usage?.total_tokens }
      );
      
      return {
        answer,
        processingTimeMs,
      };
      
    } catch (error) {
      const processingTimeMs = Math.round(performance.now() - startTime);
      
      logError('AGENT_ERROR', 'General agent failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query_preview: req.question.slice(0, 100),
      });
      
      logAgentCall(
        AgentType.GENERAL,
        req.question,
        processingTimeMs,
        false,
        { error: error instanceof Error ? error.message : 'Unknown' }
      );
      
      // Fallback response
      return {
        answer: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        processingTimeMs,
      };
    }
  }
);

