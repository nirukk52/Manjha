/**
 * Configuration constants for the Finance Chat Agent feature.
 * 
 * These constants define timeouts, limits, and other configuration values
 * used throughout the application. All values are strongly-typed and immutable.
 * 
 * Why this exists: Centralized configuration management with type safety
 */

/**
 * Timeout and latency configuration.
 * 
 * Why this exists: Enforce performance targets from spec (< 500ms classification, < 3s finance, < 2s general)
 */
export const TIMEOUTS = {
  /** Maximum time for message classification in milliseconds */
  CLASSIFICATION_MS: 500,
  /** Maximum time for finance agent response in milliseconds */
  FINANCE_AGENT_MS: 10000,
  /** Maximum time for general agent response in milliseconds */
  GENERAL_AGENT_MS: 2000,
  /** SSE connection keep-alive interval in milliseconds */
  SSE_KEEPALIVE_MS: 15000,
} as const;

/**
 * Rate limiting configuration.
 * 
 * Why this exists: Prevent abuse and manage API costs
 */
export const RATE_LIMITS = {
  /** Maximum messages per user per minute */
  MESSAGES_PER_MINUTE: 20,
  /** Maximum concurrent sessions per user */
  MAX_SESSIONS_PER_USER: 5,
} as const;

/**
 * Agent configuration.
 * 
 * Why this exists: Configure OpenAI model settings and behavior
 */
export const AGENT_CONFIG = {
  /** Finance agent model (OpenAI) */
  FINANCE_MODEL: 'gpt-4-turbo',
  /** General agent model (cheaper/faster) */
  GENERAL_MODEL: 'gpt-3.5-turbo',
  /** Maximum tokens for general agent responses */
  GENERAL_MAX_TOKENS: 100,
  /** Maximum tokens for finance agent responses */
  FINANCE_MAX_TOKENS: 2000,
  /** Temperature for agent responses (0.0 - 1.0) */
  TEMPERATURE: 0.7,
} as const;

/**
 * Classification configuration.
 * 
 * Why this exists: Tune classification accuracy and behavior
 */
export const CLASSIFICATION_CONFIG = {
  /** Minimum confidence score to trust classification (0.0 - 1.0) */
  MIN_CONFIDENCE: 0.7,
  /** Default to general agent if confidence is below threshold */
  DEFAULT_TO_GENERAL: true,
  /** Finance keywords for heuristic classification */
  FINANCE_KEYWORDS: [
    'portfolio',
    'p&l',
    'profit',
    'loss',
    'risk',
    'exposure',
    'holdings',
    'stocks',
    'bonds',
    'sectors',
    'returns',
    'performance',
    'volatility',
    'sharpe',
    'drawdown',
    'allocation',
    'diversification',
    'investing',
    'investment',
    'trading',
    'market',
    'equity',
    'dividend',
  ] as const,
} as const;

/**
 * Database configuration.
 * 
 * Why this exists: Define session cleanup and retention policies
 */
export const DATABASE_CONFIG = {
  /** Mark session as IDLE after N minutes of inactivity */
  SESSION_IDLE_MINUTES: 30,
  /** Archive sessions older than N days */
  SESSION_ARCHIVE_DAYS: 90,
  /** Batch size for metrics aggregation */
  METRICS_BATCH_SIZE: 100,
} as const;

/**
 * Streaming configuration.
 * 
 * Why this exists: Tune SSE streaming behavior for performance
 */
export const STREAMING_CONFIG = {
  /** Send chunk every N tokens */
  CHUNK_SIZE_TOKENS: 10,
  /** Maximum time between chunks in milliseconds */
  MAX_CHUNK_DELAY_MS: 500,
} as const;

/**
 * Observability configuration.
 * 
 * Why this exists: Configure logging and monitoring behavior
 */
export const OBSERVABILITY_CONFIG = {
  /** Log query preview length (truncate for PII safety) */
  QUERY_PREVIEW_LENGTH: 100,
  /** Sample rate for detailed tracing (0.0 - 1.0) */
  TRACE_SAMPLE_RATE: 0.1,
} as const;

