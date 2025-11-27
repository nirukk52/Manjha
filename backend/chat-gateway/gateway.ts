/**
 * Chat Gateway API endpoints for message submission and streaming responses.
 * 
 * This module provides the main API surface for the frontend:
 * 1. POST /chat/send - Submit a message and get routing info
 * 2. GET /chat/stream/:sessionId/:messageId - Stream agent response via SSE
 */

import { api } from "encore.dev/api";
import { APIError, ErrCode } from "encore.dev/api";
import { 
  ChatMessageRequest, 
  ChatMessageResponse, 
  MessageStatus,
  AgentType,
  StreamChunk,
  ErrorCode,
  Connector,
  AuthRequiredResponse,
  AuthRequiredReason,
} from "../contracts/api.types.js";
import { db } from "./db.js";
import { classify } from "../message-classifier/classifier.js";
import { respond as respondGeneral } from "../general-agent/agent.js";
import { analyzeStreaming } from "../finance-agent/agent.js";
import { logApiCall, logStreamingEvent, logError } from "../common/logging/logger.js";
import { randomUUID } from "crypto";

/**
 * Submits a chat message and initiates agent processing.
 * 
 * Flow:
 * 1. Validate and store user message
 * 2. Classify message (finance vs general)
 * 3. Return streaming URL for frontend
 * 
 * @param req - Chat message request
 * @returns Response with message ID and streaming URL
 */
export const send = api(
  { method: "POST", expose: true, path: "/chat/send" },
  async (req: ChatMessageRequest): Promise<ChatMessageResponse | AuthRequiredResponse> => {
    const startTime = performance.now();
    
    try {
      // Validate sessionId format (must be UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!req.sessionId || !uuidRegex.test(req.sessionId)) {
        throw APIError.invalidArgument(
          "sessionId must be a valid UUID (e.g., '550e8400-e29b-41d4-a716-446655440000'). " +
          "Generate one using: crypto.randomUUID() or https://www.uuidgenerator.net/"
        );
      }
      
      // Validate input
      if (!req.content || req.content.trim().length === 0) {
        throw APIError.invalidArgument("Message content cannot be empty");
      }
      
      if (req.content.length > 5000) {
        throw APIError.invalidArgument("Message too long (max 5000 characters)");
      }
      
      const userId = req.userId ?? 'anonymous';
      const messageId = randomUUID();
      
      // Progressive auth gate: anonymous users get 1 free message
      if (userId === 'anonymous') {
        const messageCount = await db.queryRow<{ count: number }>`
          SELECT COUNT(*)::int as count FROM chat_messages 
          WHERE session_id = ${req.sessionId} AND sender = 'USER'
        `;
        
        if (messageCount && messageCount.count >= 1) {
          return {
            type: 'AUTH_REQUIRED',
            reason: AuthRequiredReason.SECOND_MESSAGE,
            provider: 'google',
          };
        }
      }
      
      // Ensure session exists or create new one
      let session = await db.queryRow<{ id: string; user_id: string }>`
        SELECT id, user_id FROM chat_sessions 
        WHERE id = ${req.sessionId}
      `;
      
      if (!session) {
        // Create new session
        await db.exec`
          INSERT INTO chat_sessions (id, user_id, status)
          VALUES (${req.sessionId}, ${userId}, 'ACTIVE')
        `;
      } else {
        // If session exists but user_id is 'anonymous' and we now have a real userId, link it
        if (session.user_id === 'anonymous' && userId !== 'anonymous') {
          await db.exec`
            UPDATE chat_sessions
            SET user_id = ${userId}, last_activity_at = CURRENT_TIMESTAMP
            WHERE id = ${req.sessionId}
          `;
        } else {
          // Update last activity
          await db.exec`
            UPDATE chat_sessions
            SET last_activity_at = CURRENT_TIMESTAMP
            WHERE id = ${req.sessionId}
          `;
        }
      }
      
      // Store user message
      await db.exec`
        INSERT INTO chat_messages (id, session_id, sender, content, status, timestamp)
        VALUES (${messageId}, ${req.sessionId}, 'USER', ${req.content}, 'COMPLETE', CURRENT_TIMESTAMP)
      `;
      
      // Classify message
      const classification = await classify({ content: req.content });
      
      const latencyMs = Math.round(performance.now() - startTime);
      logApiCall('/chat/send', 'POST', 200, latencyMs, {
        session_id: req.sessionId,
        agent_type: classification.agentType,
        classification_confidence: classification.confidence,
      });
      
      // Check if Zerodha connector is attached
      const hasZerodha = req.selectedConnectors?.includes(Connector.ZERODHA) ?? false;
      const deviceId = req.deviceId ?? '';
      
      return {
        messageId,
        status: MessageStatus.PENDING,
        agentType: classification.agentType,
        streamUrl: `/chat/stream/${req.sessionId}/${messageId}?agentType=${classification.agentType}&query=${encodeURIComponent(req.content)}&deviceId=${deviceId}&hasZerodha=${hasZerodha}`,
      };
      
    } catch (error) {
      const latencyMs = Math.round(performance.now() - startTime);
      logApiCall('/chat/send', 'POST', 500, latencyMs, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      if (error instanceof APIError) {
        throw error;
      }
      
      throw APIError.internal("Failed to process message");
    }
  }
);

/**
 * Streams agent response via Server-Sent Events (SSE).
 * 
 * The frontend connects to this endpoint and receives real-time response chunks
 * as the agent processes the query.
 * 
 * @param sessionId - Chat session ID
 * @param messageId - Message being responded to
 * @param agentType - Which agent to use (from classification)
 * @param query - The user's question
 */
export const stream = api.raw(
  { expose: true, path: "/chat/stream/:sessionId/:messageId", method: "GET" },
  async (req, res) => {
    // Extract params from URL path
    const urlParts = req.url?.split('/') ?? [];
    const sessionId = urlParts[urlParts.length - 2] ?? '';
    const messageId = urlParts[urlParts.length - 1]?.split('?')[0] ?? '';
    const url = new URL(req.url ?? '', `http://${req.headers.host}`);
    const agentType = url.searchParams.get('agentType') as AgentType;
    const query = url.searchParams.get('query') ?? '';
    const deviceId = url.searchParams.get('deviceId') ?? '';
    const hasZerodha = url.searchParams.get('hasZerodha') === 'true';
    
    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    });
    
    const startTime = performance.now();
    const agentMessageId = randomUUID();
    
    try {
      logStreamingEvent('start', sessionId, { 
        message_id: messageId,
        agent_type: agentType,
      });
      
      // Create agent message record
      await db.exec`
        INSERT INTO chat_messages (id, session_id, sender, content, agent_type, status, timestamp)
        VALUES (${agentMessageId}, ${sessionId}, 'AGENT', '', ${agentType}, 'STREAMING', CURRENT_TIMESTAMP)
      `;
      
      let fullResponse = '';
      
      if (agentType === AgentType.FINANCE) {
        // Stream finance agent response (pass Zerodha context if connector attached)
        for await (const chunk of analyzeStreaming({ question: query, userId: 'anonymous', deviceId, hasZerodha })) {
          fullResponse += chunk;
          
          const streamChunk: StreamChunk = {
            type: 'DELTA',
            content: chunk,
          };
          
          res.write(`data: ${JSON.stringify(streamChunk)}\n\n`);
          
          logStreamingEvent('chunk', sessionId, { 
            chunk_length: chunk.length,
            total_length: fullResponse.length,
          });
        }
      } else {
        // General agent (non-streaming for simplicity in MVP)
        const response = await respondGeneral({ 
          question: query, 
          maxTokens: 100 
        });
        
        fullResponse = response.answer;
        
        const streamChunk: StreamChunk = {
          type: 'DELTA',
          content: response.answer,
        };
        
        res.write(`data: ${JSON.stringify(streamChunk)}\n\n`);
      }
      
      // Send completion signal
      const completeChunk: StreamChunk = {
        type: 'COMPLETE',
      };
      res.write(`data: ${JSON.stringify(completeChunk)}\n\n`);
      
      const processingTimeMs = Math.round(performance.now() - startTime);
      
      // Update agent message with final content
      await db.exec`
        UPDATE chat_messages
        SET content = ${fullResponse}, 
            status = 'COMPLETE',
            latency_ms = ${processingTimeMs}
        WHERE id = ${agentMessageId}
      `;
      
      // Log metrics
      await db.exec`
        INSERT INTO agent_metrics (agent_type, latency_ms, success, user_id)
        VALUES (${agentType}, ${processingTimeMs}, true, 'anonymous')
      `;
      
      logStreamingEvent('complete', sessionId, {
        processing_time_ms: processingTimeMs,
        response_length: fullResponse.length,
      });
      
      res.end();
      
    } catch (error) {
      const processingTimeMs = Math.round(performance.now() - startTime);
      
      logError('STREAMING_ERROR', 'Stream failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        session_id: sessionId,
        message_id: messageId,
      });
      
      // Send error chunk
      const errorChunk: StreamChunk = {
        type: 'ERROR',
        error: {
          code: ErrorCode.AGENT_ERROR,
          message: 'Failed to generate response',
          retryable: true,
        },
      };
      res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
      
      // Update message as error
      await db.exec`
        UPDATE chat_messages
        SET status = 'ERROR',
            error_details = ${error instanceof Error ? error.message : 'Unknown error'},
            latency_ms = ${processingTimeMs}
        WHERE id = ${agentMessageId}
      `;
      
      // Log failed metrics
      await db.exec`
        INSERT INTO agent_metrics (agent_type, latency_ms, success, error_code, user_id)
        VALUES (${agentType}, ${processingTimeMs}, false, 'AGENT_ERROR', 'anonymous')
      `;
      
      logStreamingEvent('error', sessionId, {
        error: error instanceof Error ? error.message : 'Unknown',
      });
      
      res.end();
    }
  }
);
