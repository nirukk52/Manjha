/**
 * Centralized logging utilities for the Finance Chat Agent feature.
 * 
 * This module wraps Encore's native log module with helper functions for
 * structured, type-safe logging. All logs go through Encore's built-in system,
 * which provides automatic correlation IDs, timestamps, and log aggregation.
 * 
 * Why this exists: Enforces consistent logging patterns and provides ONE place
 * for all application logs (per Constitution).
 */

import log from "encore.dev/log";
import { AgentType } from "../../contracts/api.types.js";
import { ClassificationResult } from "../../contracts/api.types.js";

/**
 * Logs an agent call with latency and success metrics.
 * 
 * @param agentType - Which agent was called
 * @param query - The user's query (truncated for logging)
 * @param latencyMs - How long the agent took to respond
 * @param success - Whether the agent call succeeded
 * @param metadata - Additional context (error codes, sources, etc.)
 * 
 * Why this exists: Standardized agent performance logging for observability
 */
export function logAgentCall(
  agentType: AgentType,
  query: string,
  latencyMs: number,
  success: boolean,
  metadata?: Record<string, unknown>
): void {
  log.info("agent_call", {
    agent_type: agentType,
    latency_ms: latencyMs,
    success,
    query_length: query.length,
    query_preview: query.slice(0, 100), // First 100 chars for debugging
    ...metadata,
  });
}

/**
 * Logs a classification decision with confidence and reasoning.
 * 
 * @param result - The classification result
 * @param metadata - Additional context (user ID, session ID, etc.)
 * 
 * Why this exists: Track classification accuracy and debug routing decisions
 */
export function logClassification(
  result: ClassificationResult,
  metadata?: Record<string, unknown>
): void {
  log.info("classification", {
    agent_type: result.agentType,
    confidence: result.confidence,
    latency_ms: result.latencyMs,
    reasoning: result.reasoning,
    ...metadata,
  });
}

/**
 * Logs a streaming event (start, chunk, complete, error).
 * 
 * @param event - The streaming event type
 * @param sessionId - Which chat session
 * @param metadata - Additional context (chunk size, total chunks, etc.)
 * 
 * Why this exists: Monitor streaming performance and debug delivery issues
 */
export function logStreamingEvent(
  event: 'start' | 'chunk' | 'complete' | 'error',
  sessionId: string,
  metadata?: Record<string, unknown>
): void {
  log.info("streaming_event", {
    event,
    session_id: sessionId,
    ...metadata,
  });
}

/**
 * Logs an error with full context for debugging.
 * 
 * @param errorCode - Standardized error code
 * @param message - Human-readable error message
 * @param metadata - Stack traces, request details, etc.
 * 
 * Why this exists: Centralized error logging with structured data
 */
export function logError(
  errorCode: string,
  message: string,
  metadata?: Record<string, unknown>
): void {
  log.error("application_error", {
    error_code: errorCode,
    message,
    ...metadata,
  });
}

/**
 * Logs API request/response metrics.
 * 
 * @param endpoint - Which API endpoint was called
 * @param method - HTTP method
 * @param statusCode - Response status code
 * @param latencyMs - Request duration
 * @param metadata - Additional context
 * 
 * Why this exists: Track API performance and usage patterns
 */
export function logApiCall(
  endpoint: string,
  method: string,
  statusCode: number,
  latencyMs: number,
  metadata?: Record<string, unknown>
): void {
  log.info("api_call", {
    endpoint,
    method,
    status_code: statusCode,
    latency_ms: latencyMs,
    ...metadata,
  });
}



