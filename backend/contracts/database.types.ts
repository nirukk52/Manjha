/**
 * Database schema types for the Finance Chat Agent feature.
 * 
 * These types define the PostgreSQL table structures for storing chat sessions,
 * messages, and agent metrics. All types match the migration schemas exactly.
 */

import { AgentType, MessageStatus } from './api.types.js';

/**
 * Represents a chat session in the database.
 * 
 * Why this exists: Groups related messages together and tracks session lifecycle
 */
export interface ChatSession {
  /** Primary key: UUID */
  id: string;
  /** User who owns this session */
  userId: string;
  /** When the session was created */
  createdAt: Date;
  /** Last activity timestamp for session cleanup */
  lastActivityAt: Date;
  /** Current session status */
  status: 'ACTIVE' | 'IDLE' | 'ARCHIVED';
}

/**
 * Represents a single message in a chat conversation.
 * 
 * Why this exists: Persists chat history for audit, debugging, and future context
 */
export interface ChatMessage {
  /** Primary key: UUID */
  id: string;
  /** Foreign key to ChatSession */
  sessionId: string;
  /** Who sent the message */
  sender: 'USER' | 'AGENT';
  /** The message content */
  content: string;
  /** Which agent handled this (if sender is AGENT) */
  agentType?: AgentType;
  /** Current message status */
  status: MessageStatus;
  /** When the message was created */
  timestamp: Date;
  /** Agent response latency in milliseconds */
  latencyMs?: number;
  /** Error details if status is ERROR */
  errorDetails?: string;
}

/**
 * Metrics for agent performance monitoring.
 * 
 * Why this exists: Track agent latency, success rates, and errors for observability
 */
export interface AgentMetrics {
  /** Primary key: UUID */
  id: string;
  /** Which agent this metric is for */
  agentType: AgentType;
  /** When this metric was recorded */
  timestamp: Date;
  /** Processing latency in milliseconds */
  latencyMs: number;
  /** Whether the agent call succeeded */
  success: boolean;
  /** Error code if success is false */
  errorCode?: string;
  /** User who triggered this agent call */
  userId: string;
}

/**
 * Database row type for chat sessions query results.
 * 
 * Why this exists: Matches PostgreSQL BIGSERIAL and TIMESTAMP types
 */
export interface ChatSessionRow {
  id: string;
  user_id: string;
  created_at: Date;
  last_activity_at: Date;
  status: string;
}

/**
 * Database row type for chat messages query results.
 * 
 * Why this exists: Matches PostgreSQL column names (snake_case) to TypeScript (camelCase)
 */
export interface ChatMessageRow {
  id: string;
  session_id: string;
  sender: string;
  content: string;
  agent_type: string | null;
  status: string;
  timestamp: Date;
  latency_ms: number | null;
  error_details: string | null;
}

/**
 * Database row type for agent metrics query results.
 * 
 * Why this exists: Type-safe querying of metrics table
 */
export interface AgentMetricsRow {
  id: string;
  agent_type: string;
  timestamp: Date;
  latency_ms: number;
  success: boolean;
  error_code: string | null;
  user_id: string;
}



