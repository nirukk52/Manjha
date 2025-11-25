/**
 * React hook for consuming Server-Sent Events (SSE) streams from the backend.
 * 
 * Why this exists: Provides a clean, React-friendly interface for real-time
 * streaming responses from the Encore.ts backend chat agents.
 * 
 * Production-ready features:
 * - Automatic reconnection on failure
 * - Proper error handling with detailed messages
 * - Memory cleanup on unmount
 * - Debug logging support
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getStreamingUrl, StreamChunk, ApiError, getApiConfig } from '@/lib/api-client';

/**
 * State of the streaming connection
 */
export type StreamState = 'idle' | 'connecting' | 'streaming' | 'complete' | 'error';

/**
 * Hook configuration options
 */
export interface UseChatStreamOptions {
  /** Enable automatic retry on connection failure (default: true) */
  autoRetry?: boolean;
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Delay between retries in milliseconds (default: 1000) */
  retryDelay?: number;
}

/**
 * Hook return type
 */
export interface UseChatStreamResult {
  /** Current accumulated response text */
  content: string;
  /** Current state of the stream */
  state: StreamState;
  /** Error if stream failed */
  error: ApiError | null;
  /** Start streaming from the given URL */
  startStream: (streamUrl: string) => void;
  /** Stop the current stream */
  stopStream: () => void;
  /** Reset state for a new message */
  reset: () => void;
  /** Current retry attempt number (0 if not retrying) */
  retryCount: number;
}

/**
 * Hook for consuming SSE streams from chat agents.
 * 
 * Usage:
 * ```tsx
 * const { content, state, startStream, reset } = useChatStream({
 *   autoRetry: true,
 *   maxRetries: 3,
 * });
 * 
 * // After sending message:
 * startStream(response.streamUrl);
 * 
 * // Display content in real-time:
 * <p>{content}</p>
 * ```
 * 
 * @param options - Configuration options for the stream
 * @returns Stream state and control functions
 */
export function useChatStream(options: UseChatStreamOptions = {}): UseChatStreamResult {
  const {
    autoRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const [content, setContent] = useState('');
  const [state, setState] = useState<StreamState>('idle');
  const [error, setError] = useState<ApiError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const currentStreamUrlRef = useRef<string | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const config = getApiConfig();

  /**
   * Attempt to retry the stream connection
   */
  const attemptRetry = useCallback(() => {
    if (!currentStreamUrlRef.current || retryCount >= maxRetries || !autoRetry) {
      return;
    }

    if (config.debug) {
      console.log(`[Chat Stream] Retrying connection (attempt ${retryCount + 1}/${maxRetries})...`);
    }

    retryTimeoutRef.current = setTimeout(() => {
      setRetryCount((prev) => prev + 1);
      startStreamInternal(currentStreamUrlRef.current!);
    }, retryDelay);
  }, [retryCount, maxRetries, autoRetry, retryDelay, config.debug]);

  /**
   * Internal stream starter (supports retry)
   */
  const startStreamInternal = useCallback((streamUrl: string) => {
    // Clean up any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    setState('connecting');

    try {
      // Create EventSource connection
      const fullUrl = getStreamingUrl(streamUrl);
      
      if (config.debug) {
        console.log('[Chat Stream] Connecting to:', fullUrl);
      }

      const eventSource = new EventSource(fullUrl);
      eventSourceRef.current = eventSource;

      // Handle incoming messages
      eventSource.onmessage = (event) => {
        try {
          const chunk: StreamChunk = JSON.parse(event.data);

          if (config.debug) {
            console.log('[Chat Stream] Received chunk:', chunk.type, chunk.content?.length || 0);
          }

          if (chunk.type === 'DELTA' && chunk.content) {
            // Append new content
            setContent((prev) => prev + chunk.content);
            setState('streaming');
            // Reset retry count on successful message
            setRetryCount(0);
          } else if (chunk.type === 'COMPLETE') {
            // Stream finished successfully
            if (config.debug) {
              console.log('[Chat Stream] Stream completed successfully');
            }
            setState('complete');
            eventSource.close();
            setRetryCount(0);
          } else if (chunk.type === 'ERROR' && chunk.error) {
            // Stream encountered an error
            if (config.debug) {
              console.error('[Chat Stream] Server error:', chunk.error);
            }
            setError(chunk.error);
            setState('error');
            eventSource.close();
          }
        } catch (parseError) {
          console.error('[Chat Stream] Failed to parse chunk:', parseError);
          setError({
            code: 'PARSE_ERROR',
            message: 'Failed to parse server response. Please try again.',
            retryable: false,
          });
          setState('error');
          eventSource.close();
        }
      };

      // Handle connection errors
      eventSource.onerror = (errorEvent) => {
        if (config.debug) {
          console.error('[Chat Stream] Connection error:', errorEvent);
        }

        // Check if we should retry
        if (autoRetry && retryCount < maxRetries) {
          setError({
            code: 'CONNECTION_ERROR',
            message: `Connection lost. Retrying (${retryCount + 1}/${maxRetries})...`,
            retryable: true,
          });
          setState('error');
          eventSource.close();
          attemptRetry();
        } else {
          setError({
            code: 'CONNECTION_ERROR',
            message: retryCount >= maxRetries 
              ? `Failed to connect after ${maxRetries} attempts. Please check your connection and try again.`
              : 'Lost connection to server. Please try again.',
            retryable: true,
          });
          setState('error');
          eventSource.close();
        }
      };

      // Handle successful connection
      eventSource.onopen = () => {
        if (config.debug) {
          console.log('[Chat Stream] Connection opened');
        }
        setState('streaming');
        setError(null);
      };
    } catch (err) {
      console.error('[Chat Stream] Failed to start stream:', err);
      setError({
        code: 'STREAM_INIT_ERROR',
        message: err instanceof Error ? err.message : 'Failed to initialize stream. Please try again.',
        retryable: true,
      });
      setState('error');
      
      // Attempt retry on initialization failure
      if (autoRetry && retryCount < maxRetries) {
        attemptRetry();
      }
    }
  }, [config.debug, autoRetry, retryCount, maxRetries, attemptRetry]);

  /**
   * Start streaming from the given URL (public API)
   */
  const startStream = useCallback((streamUrl: string) => {
    // Store URL for potential retries
    currentStreamUrlRef.current = streamUrl;
    
    // Reset state for new stream
    setContent('');
    setError(null);
    setRetryCount(0);
    
    // Start streaming
    startStreamInternal(streamUrl);
  }, [startStreamInternal]);

  /**
   * Stop the current stream
   */
  const stopStream = useCallback(() => {
    if (config.debug) {
      console.log('[Chat Stream] Stopping stream');
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    currentStreamUrlRef.current = null;
    setState('idle');
    setRetryCount(0);
  }, [config.debug]);

  /**
   * Reset state for a new message
   */
  const reset = useCallback(() => {
    stopStream();
    setContent('');
    setError(null);
    setState('idle');
    setRetryCount(0);
  }, [stopStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    content,
    state,
    error,
    startStream,
    stopStream,
    reset,
    retryCount,
  };
}
