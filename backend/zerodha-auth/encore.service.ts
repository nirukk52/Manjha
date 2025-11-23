/**
 * Zerodha Authentication Service
 * 
 * Why this exists: Handles OAuth authentication flow with Zerodha Kite Connect API,
 * manages user connection tokens, and provides account balance information.
 * 
 * Responsibilities:
 * - OAuth 2.0 flow (initiate, callback, token exchange)
 * - Secure token storage and encryption
 * - Connection status management
 * - Account balance fetching
 * - Session expiry detection and notification
 */

import { Service } from "encore.dev/service";

export default new Service("zerodha-auth");

