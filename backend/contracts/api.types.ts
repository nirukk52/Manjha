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

// ============================================================================
// ZERODHA ACCOUNT CONNECTION TYPES
// ============================================================================

/**
 * Enum representing the connection status to Zerodha.
 * 
 * Why this exists: Type-safe status tracking and UI state management
 */
export enum ConnectionStatus {
  /** Connection is active and token is valid */
  ACTIVE = 'ACTIVE',
  /** Token has expired (after ~6 hours) */
  EXPIRED = 'EXPIRED',
  /** User or Zerodha revoked access */
  REVOKED = 'REVOKED',
  /** Error occurred during API calls */
  ERROR = 'ERROR',
  /** No connection established yet */
  NOT_CONNECTED = 'NOT_CONNECTED',
}

/**
 * Request to initiate Zerodha OAuth flow.
 * 
 * Why this exists: Type-safe contract for starting OAuth
 */
export interface InitiateOAuthRequest {
  /** User initiating the connection */
  userId: string;
  /** Frontend callback URL after OAuth completes */
  redirectUrl: string;
}

/**
 * Response with OAuth URL for redirect.
 * 
 * Why this exists: Provides frontend with Zerodha login URL
 */
export interface InitiateOAuthResponse {
  /** Zerodha OAuth URL to redirect user to */
  oauthUrl: string;
  /** State parameter for CSRF protection */
  state: string;
}

/**
 * OAuth callback parameters from Zerodha.
 * 
 * Why this exists: Type-safe parsing of OAuth redirect
 */
export interface OAuthCallbackParams {
  /** OAuth request token from Zerodha */
  requestToken: string;
  /** State parameter for verification */
  state: string;
  /** Status of OAuth attempt */
  status: 'success' | 'error';
  /** Error message if status is error */
  error?: string;
}

/**
 * Response after OAuth callback processing.
 * 
 * Why this exists: Confirms connection establishment
 */
export interface OAuthCallbackResponse {
  /** Whether connection was successful */
  success: boolean;
  /** Connection ID if successful */
  connectionId?: string;
  /** Error details if unsuccessful */
  error?: string;
  /** Redirect URL for frontend */
  redirectUrl: string;
}

/**
 * Request to get current connection status.
 * 
 * Why this exists: Allows frontend to check connection state
 */
export interface GetConnectionStatusRequest {
  /** User to check connection for */
  userId: string;
}

/**
 * Response with connection status and balance.
 * 
 * Why this exists: Provides complete connection state to UI
 */
export interface GetConnectionStatusResponse {
  /** Current connection status */
  status: ConnectionStatus;
  /** Whether user has active connection */
  isConnected: boolean;
  /** Zerodha user ID if connected */
  zerodhaUserId?: string;
  /** Account balance if connected */
  balance?: ZerodhaBalance;
  /** When connection expires (if active) */
  expiresAt?: Date;
  /** Time until expiry in minutes (if active) */
  minutesUntilExpiry?: number;
  /** Error details if status is ERROR */
  errorDetails?: string;
}

/**
 * Zerodha account balance information.
 * 
 * Why this exists: Type-safe representation of balance data
 */
export interface ZerodhaBalance {
  /** Available cash balance */
  available: number;
  /** Margin currently in use */
  usedMargin: number;
  /** Total account value */
  total: number;
  /** Currency (typically INR) */
  currency: string;
  /** When balance was last fetched */
  lastUpdated: Date;
}

/**
 * Request to disconnect Zerodha account.
 * 
 * Why this exists: Allows users to revoke connection
 */
export interface DisconnectAccountRequest {
  /** User requesting disconnection */
  userId: string;
}

/**
 * Response after disconnection.
 * 
 * Why this exists: Confirms disconnection success
 */
export interface DisconnectAccountResponse {
  /** Whether disconnection was successful */
  success: boolean;
  /** Error message if unsuccessful */
  error?: string;
}

/**
 * Request to refresh balance data.
 * 
 * Why this exists: Manual balance refresh trigger
 */
export interface RefreshBalanceRequest {
  /** User requesting balance refresh */
  userId: string;
  /** Force fetch even if cached data is fresh */
  force?: boolean;
}

/**
 * Response with refreshed balance.
 * 
 * Why this exists: Provides updated balance data
 */
export interface RefreshBalanceResponse {
  /** Whether refresh was successful */
  success: boolean;
  /** Updated balance data if successful */
  balance?: ZerodhaBalance;
  /** Error details if unsuccessful */
  error?: string;
  /** Whether data was from cache */
  fromCache: boolean;
}

/**
 * Error codes specific to Zerodha integration.
 * 
 * Why this exists: Type-safe error handling
 */
export enum ZerodhaErrorCode {
  /** OAuth state parameter invalid or expired */
  INVALID_STATE = 'INVALID_STATE',
  /** OAuth request token invalid */
  INVALID_TOKEN = 'INVALID_TOKEN',
  /** API rate limit exceeded */
  RATE_LIMIT = 'RATE_LIMIT',
  /** Zerodha API error */
  API_ERROR = 'API_ERROR',
  /** Token expired */
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  /** Connection not found */
  NOT_CONNECTED = 'NOT_CONNECTED',
  /** Network error */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Invalid configuration */
  CONFIG_ERROR = 'CONFIG_ERROR',
}

