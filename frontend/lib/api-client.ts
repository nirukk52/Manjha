/**
 * API Client for communicating with Encore.ts backend.
 * 
 * Why this exists: Centralized, type-safe communication layer between
 * frontend and backend following the contracts defined in backend/contracts/api.types.ts
 */

// Import shared types from backend contracts
type AgentType = 'FINANCE' | 'GENERAL';
type MessageStatus = 'PENDING' | 'STREAMING' | 'COMPLETE' | 'ERROR';

import { Connector } from './types';

/**
 * Request payload for sending a chat message
 */
export interface ChatMessageRequest {
  sessionId: string;
  content: string;
  userId?: string;
  /** Device ID for connector session lookup */
  deviceId?: string;
  /** Selected connectors (e.g., Zerodha) - enables connector-specific tools */
  selectedConnectors?: Connector[];
}

/**
 * Response from sending a chat message
 */
export interface ChatMessageResponse {
  messageId: string;
  status: MessageStatus;
  agentType: AgentType;
  streamUrl: string;
}

/**
 * A single streaming chunk from the SSE endpoint
 */
export interface StreamChunk {
  type: 'DELTA' | 'COMPLETE' | 'ERROR';
  content?: string;
  error?: ApiError;
}

/**
 * Standardized error response
 */
export interface ApiError {
  code: string;
  message: string;
  retryable: boolean;
}

/**
 * Configuration for API client
 * All values come from environment variables for production deployment
 */
const API_CONFIG = {
  // Backend URL - MUST be set via NEXT_PUBLIC_API_URL environment variable
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  // Request timeout in milliseconds
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  // Enable debug logging
  debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
} as const;

/**
 * Validate API configuration on module load
 * Why this exists: Fail fast if required environment variables are missing
 */
function validateConfig(): void {
  if (!API_CONFIG.baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_API_URL environment variable is required. ' +
      'Please set it in your .env.local file for development or deployment environment.'
    );
  }

  if (API_CONFIG.debug) {
    console.log('[API Client] Configuration:', {
      baseUrl: API_CONFIG.baseUrl,
      timeout: API_CONFIG.timeout,
    });
  }
}

// Validate on module load
validateConfig();

/**
 * Send a chat message to the backend.
 * 
 * Why this exists: Initiates conversation with backend and gets streaming URL
 * 
 * @param request - Chat message request
 * @returns Response with streaming URL and metadata
 * @throws Error with descriptive message if request fails
 */
export async function sendChatMessage(
  request: ChatMessageRequest
): Promise<ChatMessageResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    if (API_CONFIG.debug) {
      console.log('[API Client] Sending message:', {
        sessionId: request.sessionId,
        contentLength: request.content.length,
      });
    }

    const response = await fetch(`${API_CONFIG.baseUrl}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));

      if (API_CONFIG.debug) {
        console.error('[API Client] Request failed:', errorData);
      }

      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (API_CONFIG.debug) {
      console.log('[API Client] Message sent successfully:', {
        messageId: data.messageId,
        agentType: data.agentType,
        status: data.status,
      });
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort/timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new Error(
        `Request timed out after ${API_CONFIG.timeout}ms. Please check your connection and try again.`
      );
      console.error('[API Client] Request timeout:', timeoutError);
      throw timeoutError;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error(
        `Cannot connect to backend at ${API_CONFIG.baseUrl}. Please ensure the backend is running.`
      );
      console.error('[API Client] Network error:', networkError);
      throw networkError;
    }

    console.error('[API Client] Unexpected error:', error);
    throw error;
  }
}

/**
 * Generate a session ID for a new chat session.
 * 
 * Why this exists: Backend requires UUID format for sessionId
 * 
 * @returns UUID v4 string
 */
export function generateSessionId(): string {
  // Simple UUID v4 generator (browser-compatible)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Helper to get the full streaming URL.
 * 
 * Why this exists: Converts relative streamUrl to absolute URL for EventSource
 * 
 * @param streamUrl - Relative stream URL from backend response
 * @returns Absolute URL for SSE connection
 */
export function getStreamingUrl(streamUrl: string): string {
  // If streamUrl is already absolute, return as-is
  if (streamUrl.startsWith('http://') || streamUrl.startsWith('https://')) {
    return streamUrl;
  }
  
  // Otherwise, prepend base URL
  const cleanStreamUrl = streamUrl.startsWith('/') ? streamUrl : `/${streamUrl}`;
  return `${API_CONFIG.baseUrl}${cleanStreamUrl}`;
}

/**
 * Health check - verify backend is reachable.
 * 
 * Why this exists: Allows frontend to gracefully handle backend unavailability
 * 
 * @returns Promise that resolves to true if backend is healthy, false otherwise
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout for health check

    // Try to connect to the backend root endpoint
    const response = await fetch(API_CONFIG.baseUrl, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Any response (even 404) means backend is reachable
    return response.ok || response.status === 404 || response.status === 405;
  } catch (error) {
    if (API_CONFIG.debug) {
      console.warn('[API Client] Health check failed:', error);
    }
    return false;
  }
}

/**
 * Get API configuration (for debugging)
 * 
 * Why this exists: Allows components to inspect current configuration
 */
export function getApiConfig() {
  return {
    baseUrl: API_CONFIG.baseUrl,
    timeout: API_CONFIG.timeout,
    debug: API_CONFIG.debug,
  };
}
