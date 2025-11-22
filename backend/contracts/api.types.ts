/**
 * API contracts shared between frontend and backend for the Finance Chat Agent feature.
 * 
 * These types define the communication protocol for chat messages, agent responses,
 * and streaming interactions. All types are strongly-typed with zero `any` usage.
 */

/**
 * Enum representing the type of agent handling a user query.
 * 
 * - FINANCE: Specialized financial research agent for portfolio, risk, P&L questions
 * - GENERAL: Lightweight agent for non-finance queries (greetings, help, etc.)
 * 
 * Why this exists: Enables intelligent routing based on query classification
 */
export enum AgentType {
  FINANCE = 'FINANCE',
  GENERAL = 'GENERAL',
}

/**
 * Enum representing the current status of a chat message.
 * 
 * Why this exists: Tracks message lifecycle for UI state management
 */
export enum MessageStatus {
  PENDING = 'PENDING',
  STREAMING = 'STREAMING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

/**
 * Request payload for sending a chat message.
 * 
 * Why this exists: Type-safe contract for user message submission
 */
export interface ChatMessageRequest {
  /** Unique session identifier for conversation continuity */
  sessionId: string;
  /** The user's message content */
  content: string;
  /** User ID for authentication and logging (stubbed for MVP) */
  userId?: string;
}

/**
 * Response payload after submitting a chat message.
 * 
 * Why this exists: Provides client with streaming URL and metadata
 */
export interface ChatMessageResponse {
  /** Unique identifier for this message */
  messageId: string;
  /** Current processing status */
  status: MessageStatus;
  /** Which agent is handling this query */
  agentType: AgentType;
  /** SSE endpoint URL for streaming the response */
  streamUrl: string;
}

/**
 * A single chunk of streaming data from the agent.
 * 
 * Why this exists: Enables real-time progressive response rendering
 */
export interface StreamChunk {
  /** Type of chunk: incremental text, completion signal, or error */
  type: 'DELTA' | 'COMPLETE' | 'ERROR';
  /** Partial response text (only present for DELTA type) */
  content?: string;
  /** Error details (only present for ERROR type) */
  error?: ApiError;
}

/**
 * Standardized error response structure.
 * 
 * Why this exists: Consistent error handling across all API endpoints
 */
export interface ApiError {
  /** Error code for programmatic handling */
  code: ErrorCode;
  /** Human-readable error message */
  message: string;
  /** Whether the request can be safely retried */
  retryable: boolean;
}

/**
 * Enum of all possible error codes in the system.
 * 
 * Why this exists: Type-safe error handling and monitoring
 */
export enum ErrorCode {
  CLASSIFICATION_FAILED = 'CLASSIFICATION_FAILED',
  AGENT_TIMEOUT = 'AGENT_TIMEOUT',
  AGENT_ERROR = 'AGENT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_REQUEST = 'INVALID_REQUEST',
}

/**
 * Request payload for message classification.
 * 
 * Why this exists: Determines which agent should handle the query
 */
export interface ClassificationRequest {
  /** The user's message to classify */
  content: string;
  /** Optional conversation history for context-aware classification */
  conversationHistory?: ChatMessage[];
}

/**
 * Result of message classification.
 * 
 * Why this exists: Provides routing decision with confidence and debugging info
 */
export interface ClassificationResult {
  /** Which agent should handle this message */
  agentType: AgentType;
  /** Confidence score (0.0 - 1.0) for this classification */
  confidence: number;
  /** Explanation of why this classification was chosen (for logging) */
  reasoning: string;
  /** Time taken to classify in milliseconds */
  latencyMs: number;
}

/**
 * Request payload for finance agent analysis.
 * 
 * Why this exists: Type-safe contract for financial research queries
 */
export interface FinanceQuery {
  /** The financial question or analysis request */
  question: string;
  /** User identifier for personalization and logging */
  userId: string;
}

/**
 * Response from finance agent analysis.
 * 
 * Why this exists: Structured output from financial research
 */
export interface FinanceResponse {
  /** The detailed financial analysis answer */
  answer: string;
  /** Confidence in the analysis (0.0 - 1.0) */
  confidence: number;
  /** Sources used for the analysis */
  sources: string[];
  /** Processing time in milliseconds */
  processingTimeMs: number;
}

/**
 * Request payload for general agent response.
 * 
 * Why this exists: Type-safe contract for general queries
 */
export interface GeneralQuery {
  /** The general question */
  question: string;
  /** Maximum tokens to keep responses concise */
  maxTokens: number;
}

/**
 * Response from general agent.
 * 
 * Why this exists: Lightweight response for non-finance queries
 */
export interface GeneralResponse {
  /** The short answer */
  answer: string;
  /** Processing time in milliseconds */
  processingTimeMs: number;
}

/**
 * Represents a single message in the chat conversation.
 * 
 * Why this exists: Core data model for chat history and UI rendering
 */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Which session this message belongs to */
  sessionId: string;
  /** Who sent the message */
  sender: 'USER' | 'AGENT';
  /** The message text */
  content: string;
  /** Which agent type was used (if sender is AGENT) */
  agentType?: AgentType;
  /** Current status of the message */
  status: MessageStatus;
  /** When the message was created */
  timestamp: Date;
  /** How long the agent took to respond (if applicable) */
  latencyMs?: number;
  /** Error details if status is ERROR */
  errorDetails?: string;
}



