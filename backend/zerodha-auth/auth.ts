/**
 * Zerodha OAuth - Dead simple implementation.
 */

import { api, APIError } from "encore.dev/api";
import {
  type InitiateOAuthRequest,
  type InitiateOAuthResponse,
  type GetConnectionStatusRequest,
  type GetConnectionStatusResponse,
  type DisconnectAccountRequest,
  type DisconnectAccountResponse,
  ConnectionStatus,
} from "../contracts/api.types.js";
import { createKiteClient, getApiKey, getApiSecret, getFrontendUrl } from "./kite-client.js";
import { encrypt } from "./crypto.js";
import { db } from "./db.js";
import log from "encore.dev/log";
import { fetchBalance } from "./balance.js";

/** POST /zerodha/oauth/initiate - Returns Zerodha login URL */
export const initiateOAuth = api(
  { method: "POST", path: "/zerodha/oauth/initiate", expose: true, auth: false },
  async (req: InitiateOAuthRequest): Promise<InitiateOAuthResponse> => {
    const apiKey = getApiKey();
    const oauthUrl = `https://kite.zerodha.com/connect/login?api_key=${apiKey}&v=3&redirect_params=user_id%3D${encodeURIComponent(req.userId)}`;
    
    return { oauthUrl, state: "" };
  }
);

/** GET /zerodha/oauth/callback - Handles Zerodha redirect */
export const handleOAuthCallback = api.raw(
  { method: "GET", path: "/zerodha/oauth/callback", expose: true },
  async (req, resp) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const requestToken = url.searchParams.get("request_token") ?? "";
    const userId = url.searchParams.get("user_id") ?? "";

    if (!requestToken || !userId) {
      resp.writeHead(400, { "Content-Type": "text/html" });
      resp.end("<h1>Missing parameters</h1>");
      return;
    }

    // Exchange request_token for access_token
    const kc = createKiteClient();
    const sessionResponse = await (kc as any).generateSession(requestToken, getApiSecret());
    const authenticatedKc = createKiteClient({ accessToken: sessionResponse.access_token });
    const profile = await (authenticatedKc as any).getProfile();

    // Calculate token expiry (6 AM next day IST)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 6);

    // Store connection
    await db.exec`
      INSERT INTO zerodha_connections (
        user_id, zerodha_user_id, access_token, created_at, expires_at, status
      ) VALUES (
        ${userId}, ${profile.user_id}, ${encrypt(sessionResponse.access_token)},
        NOW(), ${expiresAt}, 'ACTIVE'
      )
      ON CONFLICT (user_id) DO UPDATE SET
        zerodha_user_id = ${profile.user_id},
        access_token = ${encrypt(sessionResponse.access_token)},
        expires_at = ${expiresAt},
        status = 'ACTIVE',
        created_at = NOW()
    `;

    // Redirect to frontend
    resp.writeHead(302, { Location: `${getFrontendUrl()}/dashboard?connected=true` });
    resp.end();
  }
);

/** POST /zerodha/connection/status - Get connection status */
export const getConnectionStatus = api(
  { method: "POST", path: "/zerodha/connection/status", expose: true, auth: false },
  async (req: GetConnectionStatusRequest): Promise<GetConnectionStatusResponse> => {
    const connection = await db.queryRow`
      SELECT status, zerodha_user_id, expires_at
      FROM zerodha_connections
      WHERE user_id = ${req.userId}
    `;

    if (!connection) {
      return { status: ConnectionStatus.NOT_CONNECTED, isConnected: false };
    }

    // Check expiry
    if (new Date() > new Date(connection.expires_at)) {
      await db.exec`UPDATE zerodha_connections SET status = 'EXPIRED' WHERE user_id = ${req.userId}`;
      return { status: ConnectionStatus.EXPIRED, isConnected: false };
    }

    // Fetch balance if connected
    const balance = await fetchBalance(req.userId, false);

    return {
      status: connection.status,
      isConnected: true,
      zerodhaUserId: connection.zerodha_user_id,
      expiresAt: connection.expires_at,
      balance: balance || undefined,
    };
  }
);

/** POST /zerodha/connection/disconnect - Disconnect account */
export const disconnectAccount = api(
  { method: "POST", path: "/zerodha/connection/disconnect", expose: true, auth: false },
  async (req: DisconnectAccountRequest): Promise<DisconnectAccountResponse> => {
    await db.exec`DELETE FROM zerodha_connections WHERE user_id = ${req.userId}`;
    return { success: true };
  }
);

