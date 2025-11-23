/**
 * Balance fetching and caching logic for Zerodha accounts.
 * 
 * Why this exists: Retrieves account balance from Zerodha API,
 * implements caching strategy, and stores historical data.
 */

import { api, APIError } from "encore.dev/api";
import type {
  RefreshBalanceRequest,
  RefreshBalanceResponse,
  ZerodhaBalance,
} from "../contracts/api.types.js";
import { createKiteClient } from "./kite-client.js";
import { decrypt } from "./crypto.js";
import { db } from "./db.js";
import log from "encore.dev/log";

/**
 * Cache TTL for balance data (5 minutes).
 * 
 * Why this exists: Reduces API calls to Zerodha while keeping data reasonably fresh
 */
const BALANCE_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Fetches account balance from Zerodha API.
 * 
 * @param userId - User ID to fetch balance for
 * @param force - Force fetch even if cache is fresh
 * @returns Balance data or null if connection not found
 * 
 * Why this exists: Core balance fetching logic with caching
 */
export async function fetchBalance(userId: string, force: boolean = false): Promise<ZerodhaBalance | null> {
  log.info("Fetching balance", { userId, force });

  try {
    // Get active connection
    const connection = await db.queryRow<{
      id: string;
      access_token: string;
      last_balance_fetch: Date | null;
      status: string;
    }>`
      SELECT id, access_token, last_balance_fetch, status
      FROM zerodha_connections
      WHERE user_id = ${userId} AND status = 'ACTIVE'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!connection) {
      log.warn("No active connection found", { userId });
      return null;
    }

    // Check cache unless force fetch
    if (!force && connection.last_balance_fetch) {
      const cacheAge = Date.now() - connection.last_balance_fetch.getTime();
      if (cacheAge < BALANCE_CACHE_TTL_MS) {
        log.info("Returning cached balance", { userId, cacheAgeMs: cacheAge });
        
        // Fetch latest balance from history
        const cachedBalance = await db.queryRow<{
          available_balance: number;
          used_margin: number;
          total_balance: number;
          currency: string;
          timestamp: Date;
        }>`
          SELECT available_balance, used_margin, total_balance, currency, timestamp
          FROM zerodha_balance_history
          WHERE connection_id = ${connection.id}
          ORDER BY timestamp DESC
          LIMIT 1
        `;

        if (cachedBalance) {
          return {
            available: Number(cachedBalance.available_balance),
            usedMargin: Number(cachedBalance.used_margin),
            total: Number(cachedBalance.total_balance),
            currency: cachedBalance.currency,
            lastUpdated: cachedBalance.timestamp,
          };
        }
      }
    }

    // Fetch fresh balance from Zerodha API
    const startTime = Date.now();
    const decryptedToken = decrypt(connection.access_token);
    const kc = createKiteClient({ accessToken: decryptedToken });

    log.info("Calling Zerodha margins API", { userId });
    const margins = await kc.getMargins();
    const latency = Date.now() - startTime;

    // Extract equity margins (default segment)
    const equityMargin = margins.equity;
    if (!equityMargin || !equityMargin.available || !equityMargin.utilised) {
      log.error("Invalid margin data in response", { margins });
      throw new Error("Invalid margin data available");
    }

    const balance: ZerodhaBalance = {
      available: equityMargin.available?.live_balance ?? equityMargin.available?.cash ?? 0,
      usedMargin: equityMargin.utilised?.debits ?? 0,
      total: equityMargin.net ?? 0,
      currency: "INR",
      lastUpdated: new Date(),
    };

    // Store in balance history
    await db.exec`
      INSERT INTO zerodha_balance_history (
        connection_id, available_balance, used_margin, total_balance,
        currency, timestamp, fetch_latency_ms
      ) VALUES (
        ${connection.id},
        ${balance.available},
        ${balance.usedMargin},
        ${balance.total},
        ${balance.currency},
        NOW(),
        ${latency}
      )
    `;

    // Update last balance fetch timestamp
    await db.exec`
      UPDATE zerodha_connections
      SET last_balance_fetch = NOW()
      WHERE id = ${connection.id}
    `;

    log.info("Balance fetched and cached successfully", {
      userId,
      latencyMs: latency,
      available: balance.available,
    });

    return balance;
  } catch (error) {
    log.error("Failed to fetch balance", { error, userId });
    
    // Update connection status to ERROR
    try {
      await db.exec`
        UPDATE zerodha_connections
        SET status = 'ERROR', error_details = ${String(error)}
        WHERE user_id = ${userId} AND status = 'ACTIVE'
      `;
    } catch (updateError) {
      log.error("Failed to update connection error status", { updateError, userId });
    }

    return null;
  }
}

/**
 * Manually refreshes balance data.
 * 
 * POST /zerodha/balance/refresh
 * 
 * Why this exists: Allows users to manually refresh their balance
 */
export const refreshBalance = api(
  { method: "POST", path: "/zerodha/balance/refresh", expose: true, auth: false },
  async (req: RefreshBalanceRequest): Promise<RefreshBalanceResponse> => {
    log.info("Manual balance refresh requested", { userId: req.userId, force: req.force });

    try {
      const balance = await fetchBalance(req.userId, req.force ?? false);

      if (!balance) {
        return {
          success: false,
          error: "No active connection found or balance fetch failed",
          fromCache: false,
        };
      }

      // Check if this was from cache
      const cacheAge = Date.now() - balance.lastUpdated.getTime();
      const fromCache = !req.force && cacheAge < BALANCE_CACHE_TTL_MS;

      return {
        success: true,
        balance,
        fromCache,
      };
    } catch (error) {
      log.error("Failed to refresh balance", { error, userId: req.userId });
      return {
        success: false,
        error: "Failed to refresh balance",
        fromCache: false,
      };
    }
  }
);

