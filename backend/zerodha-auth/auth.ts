/**
 * OAuth authentication handlers for Zerodha Kite Connect.
 * 
 * Why this exists: Implements complete OAuth 2.0 flow including
 * initiation, callback handling, token exchange, and connection status.
 */

import { api, APIError, ErrCode } from "encore.dev/api";
import {
  type InitiateOAuthRequest,
  type InitiateOAuthResponse,
  type OAuthCallbackResponse,
  type GetConnectionStatusRequest,
  type GetConnectionStatusResponse,
  type DisconnectAccountRequest,
  type DisconnectAccountResponse,
  ConnectionStatus,
} from "../contracts/api.types.js";
import { createKiteClient, getApiKey, getApiSecret, getFrontendUrl } from "./kite-client.js";
import { encrypt, decrypt, generateRandomState } from "./crypto.js";
import { db } from "./db.js";
import log from "encore.dev/log";
import { fetchBalance } from "./balance.js";
import { URL } from "url";

/**
 * Initiates OAuth flow and returns Zerodha login URL.
 * 
 * POST /zerodha/oauth/initiate
 * 
 * Why this exists: Starts OAuth flow by generating state and constructing redirect URL
 */
export const initiateOAuth = api(
  { method: "POST", path: "/zerodha/oauth/initiate", expose: true, auth: false },
  async (req: InitiateOAuthRequest): Promise<InitiateOAuthResponse> => {
    log.info("Initiating Zerodha OAuth flow", { userId: req.userId });

    try {
      // Generate cryptographically secure state parameter for CSRF protection
      const state = generateRandomState(32);

      // Store state in database with 15-minute expiry
      await db.exec`
        INSERT INTO zerodha_oauth_states (state, user_id, created_at, used)
        VALUES (${state}, ${req.userId}, NOW(), false)
      `;

      // Construct Zerodha OAuth URL
      log.info("Attempting to read API key", { userId: req.userId });
      const apiKey = getApiKey();
      log.info("API key retrieved successfully", { 
        userId: req.userId, 
        apiKeyLength: apiKey.length 
      });
      
      const oauthUrl = `https://kite.zerodha.com/connect/login?api_key=${apiKey}&v=3`;

      log.info("OAuth flow initiated successfully", {
        userId: req.userId,
        state,
        oauthUrl: oauthUrl.substring(0, 50) + "...",
      });

      return {
        oauthUrl,
        state,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      log.error("Failed to initiate OAuth flow", { 
        error: errorMsg,
        errorType: typeof error,
        errorStack,
        userId: req.userId 
      });
      throw APIError.internal(`Failed to initiate OAuth flow: ${errorMsg}`);
    }
  }
);

/**
 * Handles OAuth callback from Zerodha.
 * 
 * GET /zerodha/oauth/callback
 * 
 * Why this exists: Processes OAuth redirect, exchanges tokens, stores connection
 */
export const handleOAuthCallback = api.raw(
  { method: "GET", path: "/zerodha/oauth/callback", expose: true },
  async (req, resp) => {
    // Parse query parameters from URL
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const requestToken = url.searchParams.get("request_token") ?? "";
    const status = url.searchParams.get("status") ?? "";
    const state = url.searchParams.get("state") ?? "";

    log.info("Received OAuth callback", { requestToken, status, state });

    try {
      // Validate state parameter
      const stateRow = await db.queryRow<{ user_id: string; used: boolean; created_at: Date }>`
        SELECT user_id, used, created_at
        FROM zerodha_oauth_states
        WHERE state = ${state}
      `;

      if (!stateRow) {
        log.error("Invalid OAuth state", { state });
        resp.writeHead(400, { "Content-Type": "text/html" });
        resp.end("<h1>Invalid OAuth state. Please try connecting again.</h1>");
        return;
      }

      if (stateRow.used) {
        log.error("OAuth state already used", { state });
        resp.writeHead(400, { "Content-Type": "text/html" });
        resp.end("<h1>OAuth state already used. Please try connecting again.</h1>");
        return;
      }

      // Check if state is expired (15 minutes)
      const stateAge = Date.now() - stateRow.created_at.getTime();
      if (stateAge > 15 * 60 * 1000) {
        log.error("OAuth state expired", { state, ageMs: stateAge });
        resp.writeHead(400, { "Content-Type": "text/html" });
        resp.end("<h1>OAuth state expired. Please try connecting again.</h1>");
        return;
      }

      // Mark state as used
      await db.exec`
        UPDATE zerodha_oauth_states
        SET used = true
        WHERE state = ${state}
      `;

      // Check OAuth status
      if (status !== "success" || !requestToken) {
        log.error("OAuth authorization failed", { status });
        resp.writeHead(400, { "Content-Type": "text/html" });
        resp.end("<h1>Authorization failed or cancelled. Please try again.</h1>");
        return;
      }

      // Exchange request token for access token
      const kc = createKiteClient();
      const apiSecret = getApiSecret();
      
      log.info("Exchanging request token for access token", { requestToken });
      
      // Use the correct method name from kiteconnect SDK
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessionResponse = await (kc as any).generateSession(requestToken, apiSecret);
      
      log.info("Session generated successfully", {
        userId: stateRow.user_id,
        accessToken: sessionResponse.access_token ? "present" : "missing",
      });

      // Create new client with access token
      const authenticatedKc = createKiteClient({ accessToken: sessionResponse.access_token });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profile = await (authenticatedKc as any).getProfile();

      log.info("User profile fetched", {
        zerodhaUserId: profile.user_id,
        userName: profile.user_name,
      });

      // Calculate token expiry (6 AM next day IST)
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setHours(expiresAt.getHours() + 6); // Simple approximation for now

      // Encrypt access token before storage
      const encryptedToken = encrypt(sessionResponse.access_token);

      // Store connection in database
      await db.exec`
        INSERT INTO zerodha_connections (
          user_id, zerodha_user_id, access_token, created_at, expires_at, status
        ) VALUES (
          ${stateRow.user_id},
          ${profile.user_id},
          ${encryptedToken},
          NOW(),
          ${expiresAt},
          'ACTIVE'
        )
      `;

      log.info("Connection stored successfully", {
        userId: stateRow.user_id,
        zerodhaUserId: profile.user_id,
      });

      // Redirect to frontend dashboard
      const frontendUrl = getFrontendUrl();
      const redirectUrl = `${frontendUrl}/dashboard?connected=true`;
      
      log.info("Redirecting user to frontend", {
        userId: stateRow.user_id,
        redirectUrl,
      });

      resp.writeHead(302, {
        Location: redirectUrl,
      });
      resp.end();
    } catch (error) {
      log.error("OAuth callback failed", { error });
      resp.writeHead(500, { "Content-Type": "text/html" });
      resp.end("<h1>Connection failed. Please try again later.</h1>");
    }
  }
);

/**
 * Returns current connection status and balance.
 * 
 * GET /zerodha/connection/status
 * 
 * Why this exists: Allows frontend to check if user has active Zerodha connection
 */
export const getConnectionStatus = api(
  { method: "GET", path: "/zerodha/connection/status", expose: true, auth: false },
  async (req: GetConnectionStatusRequest): Promise<GetConnectionStatusResponse> => {
    log.info("Checking connection status", { userId: req.userId });

    try {
      // Query latest connection for user
      const connection = await db.queryRow<{
        id: string;
        zerodha_user_id: string;
        status: string;
        expires_at: Date;
        error_details: string | null;
      }>`
        SELECT id, zerodha_user_id, status, expires_at, error_details
        FROM zerodha_connections
        WHERE user_id = ${req.userId}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (!connection) {
        return {
          status: ConnectionStatus.NOT_CONNECTED,
          isConnected: false,
        };
      }

      // Check if token is expired
      const now = new Date();
      const isExpired = now > connection.expires_at;

      if (isExpired && connection.status === "ACTIVE") {
        // Update status to EXPIRED
        await db.exec`
          UPDATE zerodha_connections
          SET status = 'EXPIRED'
          WHERE id = ${connection.id}
        `;

        return {
          status: ConnectionStatus.EXPIRED,
          isConnected: false,
          zerodhaUserId: connection.zerodha_user_id,
        };
      }

      // Calculate minutes until expiry
      const minutesUntilExpiry = Math.floor(
        (connection.expires_at.getTime() - now.getTime()) / (1000 * 60)
      );

      // Fetch balance if connection is active
      let balance = undefined;
      if (connection.status === "ACTIVE") {
        try {
          balance = await fetchBalance(req.userId) ?? undefined;
        } catch (error) {
          log.warn("Failed to fetch balance for status check", { error, userId: req.userId });
          // Don't fail the status check if balance fetch fails
        }
      }

      return {
        status: connection.status as ConnectionStatus,
        isConnected: connection.status === "ACTIVE",
        zerodhaUserId: connection.zerodha_user_id,
        balance,
        expiresAt: connection.expires_at,
        minutesUntilExpiry: minutesUntilExpiry > 0 ? minutesUntilExpiry : 0,
        errorDetails: connection.error_details ?? undefined,
      };
    } catch (error) {
      log.error("Failed to check connection status", { error, userId: req.userId });
      throw APIError.internal("Failed to check connection status");
    }
  }
);

/**
 * Disconnects Zerodha account.
 * 
 * POST /zerodha/connection/disconnect
 * 
 * Why this exists: Allows users to revoke their Zerodha connection
 */
export const disconnectAccount = api(
  { method: "POST", path: "/zerodha/connection/disconnect", expose: true, auth: false },
  async (req: DisconnectAccountRequest): Promise<DisconnectAccountResponse> => {
    log.info("Disconnecting Zerodha account", { userId: req.userId });

    try {
      // Update all active connections to REVOKED
      await db.exec`
        UPDATE zerodha_connections
        SET status = 'REVOKED'
        WHERE user_id = ${req.userId} AND status = 'ACTIVE'
      `;

      log.info("Account disconnected successfully", { userId: req.userId });

      return {
        success: true,
      };
    } catch (error) {
      log.error("Failed to disconnect account", { error, userId: req.userId });
      return {
        success: false,
        error: "Failed to disconnect account",
      };
    }
  }
);

