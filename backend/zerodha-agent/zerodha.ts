/**
 * Zerodha Agent - Handles OAuth and Kite API calls.
 * 
 * Flow:
 * 1. User clicks Connect → /zerodha/oauth/initiate → returns login URL
 * 2. User authenticates on Zerodha
 * 3. Zerodha redirects to /zerodha/oauth/callback with request_token
 * 4. We exchange request_token for access_token
 * 5. User can now use Kite APIs
 */

import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { db } from "./db.js";
import { createHash } from "crypto";

// Encore secrets
const apiKey = secret("ZerodhaApiKey");
const apiSecret = secret("ZerodhaApiSecret");
const frontendUrl = secret("FrontendUrl");

// Kite URLs
const KITE_LOGIN_URL = "https://kite.zerodha.com/connect/login";
const KITE_API_URL = "https://api.kite.trade";

// Session valid for 6 hours
const SESSION_HOURS = 6;

// ============================================================================
// Types
// ============================================================================

interface InitiateRequest {
  deviceId: string;
}

interface InitiateResponse {
  loginUrl: string;
}

interface StatusRequest {
  deviceId: string;
}

interface StatusResponse {
  isConnected: boolean;
  userName?: string;
  expiresAt?: string;
}

// ============================================================================
// OAuth Endpoints
// ============================================================================

/**
 * Start OAuth - returns Zerodha login URL
 */
export const initiate = api(
  { method: "POST", expose: true, path: "/zerodha/oauth/initiate" },
  async (req: InitiateRequest): Promise<InitiateResponse> => {
    const deviceId = req.deviceId?.trim();
    if (!deviceId) throw new Error("deviceId required");

    // Create/update pending session
    await db.exec`
      INSERT INTO zerodha_sessions (device_id, status)
      VALUES (${deviceId}, 'PENDING')
      ON CONFLICT (device_id) DO UPDATE SET
        status = 'PENDING',
        updated_at = CURRENT_TIMESTAMP
    `;

    // Build login URL with deviceId in state param
    const loginUrl = `${KITE_LOGIN_URL}?v=3&api_key=${apiKey()}&redirect_params=state%3D${encodeURIComponent(deviceId)}`;

    return { loginUrl };
  }
);

/**
 * OAuth callback - Zerodha redirects here after authentication
 */
export const callback = api.raw(
  { expose: true, path: "/zerodha/oauth/callback", method: "GET" },
  async (req, res) => {
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);
    const requestToken = url.searchParams.get("request_token");
    const status = url.searchParams.get("status");
    const state = url.searchParams.get("state"); // deviceId

    const frontend = frontendUrl();

    // Check for errors
    if (status !== "success" || !requestToken || !state) {
      console.error("[Zerodha] OAuth failed", { status, hasToken: !!requestToken, hasState: !!state });
      res.writeHead(302, { Location: `${frontend}/chat?error=oauth_failed` });
      res.end();
      return;
    }

    const deviceId = state;

    try {
      // Generate checksum: SHA256(api_key + request_token + api_secret)
      const checksum = createHash("sha256")
        .update(apiKey() + requestToken + apiSecret())
        .digest("hex");

      // Exchange request_token for access_token
      const tokenRes = await fetch(`${KITE_API_URL}/session/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Kite-Version": "3",
        },
        body: new URLSearchParams({
          api_key: apiKey(),
          request_token: requestToken,
          checksum: checksum,
        }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        console.error("[Zerodha] Token exchange failed", err);
        res.writeHead(302, { Location: `${frontend}/chat?error=token_failed` });
        res.end();
        return;
      }

      const tokenData = await tokenRes.json();
      const { access_token, user_id, user_name, email } = tokenData.data;

      // Set expiry
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + SESSION_HOURS);

      // Save session
      await db.exec`
        UPDATE zerodha_sessions SET
          access_token = ${access_token},
          user_id = ${user_id},
          user_name = ${user_name},
          email = ${email || null},
          status = 'ACTIVE',
          expires_at = ${expiresAt},
          updated_at = CURRENT_TIMESTAMP
        WHERE device_id = ${deviceId}
      `;

      console.log("[Zerodha] OAuth success", { deviceId, userId: user_id });

      // Redirect to frontend
      res.writeHead(302, { Location: `${frontend}/chat?connected=true` });
      res.end();

    } catch (error) {
      console.error("[Zerodha] Callback error", error);
      res.writeHead(302, { Location: `${frontend}/chat?error=callback_error` });
      res.end();
    }
  }
);

/**
 * Check if user is connected
 */
export const status = api(
  { method: "POST", expose: true, path: "/zerodha/status" },
  async (req: StatusRequest): Promise<StatusResponse> => {
    if (!req.deviceId?.trim()) return { isConnected: false };

    const session = await db.queryRow<{
      status: string;
      user_name: string | null;
      expires_at: Date | null;
    }>`
      SELECT status, user_name, expires_at
      FROM zerodha_sessions
      WHERE device_id = ${req.deviceId}
    `;

    if (!session || session.status !== "ACTIVE") {
      return { isConnected: false };
    }

    // Check expiry
    if (session.expires_at && new Date() > session.expires_at) {
      await db.exec`UPDATE zerodha_sessions SET status = 'EXPIRED' WHERE device_id = ${req.deviceId}`;
      return { isConnected: false };
    }

    return {
      isConnected: true,
      userName: session.user_name ?? undefined,
      expiresAt: session.expires_at?.toISOString(),
    };
  }
);

// ============================================================================
// Kite API Helpers
// ============================================================================

async function getAccessToken(deviceId: string): Promise<string | null> {
  const session = await db.queryRow<{ access_token: string; status: string; expires_at: Date | null }>`
    SELECT access_token, status, expires_at FROM zerodha_sessions WHERE device_id = ${deviceId}
  `;

  if (!session || session.status !== "ACTIVE") return null;
  if (session.expires_at && new Date() > session.expires_at) return null;

  return session.access_token;
}

async function kiteGet(deviceId: string, endpoint: string): Promise<unknown> {
  const token = await getAccessToken(deviceId);
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${KITE_API_URL}${endpoint}`, {
    headers: {
      "X-Kite-Version": "3",
      "Authorization": `token ${apiKey()}:${token}`,
    },
  });

  if (!res.ok) throw new Error(`Kite API error: ${await res.text()}`);
  
  const json = await res.json();
  return json.data;
}

// ============================================================================
// Kite API Endpoints
// ============================================================================

interface ApiRequest {
  deviceId: string;
}

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export const getProfile = api(
  { method: "POST", expose: true, path: "/zerodha/profile" },
  async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      return { success: true, data: await kiteGet(req.deviceId, "/user/profile") };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
    }
  }
);

export const getHoldings = api(
  { method: "POST", expose: true, path: "/zerodha/holdings" },
  async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      return { success: true, data: await kiteGet(req.deviceId, "/portfolio/holdings") };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
    }
  }
);

export const getPositions = api(
  { method: "POST", expose: true, path: "/zerodha/positions" },
  async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      return { success: true, data: await kiteGet(req.deviceId, "/portfolio/positions") };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
    }
  }
);

export const getMargins = api(
  { method: "POST", expose: true, path: "/zerodha/margins" },
  async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      return { success: true, data: await kiteGet(req.deviceId, "/user/margins") };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
    }
  }
);

export const getOrders = api(
  { method: "POST", expose: true, path: "/zerodha/orders" },
  async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      return { success: true, data: await kiteGet(req.deviceId, "/orders") };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
    }
  }
);
