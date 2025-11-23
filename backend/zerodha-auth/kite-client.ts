/**
 * KiteConnect client factory for Zerodha API integration.
 * 
 * Why this exists: Creates and configures KiteConnect SDK instances
 * with proper API keys and access tokens.
 */

import { KiteConnect } from "kiteconnect";
import { secret } from "encore.dev/config";

/**
 * Zerodha API Key from environment.
 * 
 * Why this exists: Required for OAuth flow and API authentication
 */
const ZERODHA_API_KEY = secret("ZerodhaApiKey");

/**
 * Zerodha API Secret from environment.
 * 
 * Why this exists: Required for OAuth token exchange
 */
const ZERODHA_API_SECRET = secret("ZerodhaApiSecret");

/**
 * Zerodha OAuth redirect URL from environment.
 * 
 * Why this exists: OAuth callback URL that must match Kite Connect app settings
 */
const ZERODHA_REDIRECT_URL = secret("ZerodhaRedirectUrl");

/**
 * Frontend application URL from environment.
 * 
 * Why this exists: Used to redirect users back to frontend after OAuth completion
 */
const FRONTEND_URL = secret("FrontendUrl");

/**
 * Configuration for KiteConnect client.
 * 
 * Why this exists: Typed configuration object for SDK initialization
 */
interface KiteClientConfig {
  apiKey: string;
  accessToken?: string;
  debug?: boolean;
}

/**
 * Creates a new KiteConnect client instance.
 * 
 * @param config - Configuration options for the client
 * @returns Configured KiteConnect instance
 * 
 * Why this exists: Factory function for creating properly configured Kite clients
 */
export function createKiteClient(config?: { accessToken?: string; debug?: boolean }): KiteConnect {
  const clientConfig: KiteClientConfig = {
    apiKey: ZERODHA_API_KEY(),
    accessToken: config?.accessToken,
    debug: config?.debug ?? false,
  };

  return new KiteConnect({
    api_key: clientConfig.apiKey,
    access_token: clientConfig.accessToken,
    debug: clientConfig.debug,
  });
}

/**
 * Gets the Zerodha API key.
 * 
 * @returns API key from environment
 * 
 * Why this exists: Exposes API key for OAuth URL construction
 */
export function getApiKey(): string {
  try {
    const key = ZERODHA_API_KEY();
    if (!key || key.trim() === '') {
      throw new Error("ZerodhaApiKey secret is empty or not set");
    }
    return key;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read ZerodhaApiKey secret: ${errorMsg}`);
  }
}

/**
 * Gets the Zerodha API secret.
 * 
 * @returns API secret from environment
 * 
 * Why this exists: Exposes API secret for token exchange
 */
export function getApiSecret(): string {
  return ZERODHA_API_SECRET();
}

/**
 * Gets the OAuth redirect URL.
 * 
 * @returns Redirect URL from environment
 * 
 * Why this exists: Exposes redirect URL for OAuth flow
 */
export function getRedirectUrl(): string {
  return ZERODHA_REDIRECT_URL();
}

/**
 * Gets the frontend application URL.
 * 
 * @returns Frontend URL from environment
 * 
 * Why this exists: Used to redirect users back to frontend after OAuth completion
 */
export function getFrontendUrl(): string {
  try {
    const url = FRONTEND_URL();
    if (!url || url.trim() === '') {
      throw new Error("FrontendUrl secret is empty or not set");
    }
    return url;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read FrontendUrl secret: ${errorMsg}`);
  }
}

