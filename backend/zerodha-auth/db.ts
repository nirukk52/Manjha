/**
 * Database connection for Zerodha authentication service.
 * 
 * Why this exists: Provides PostgreSQL database access for storing
 * connection tokens, balance history, and OAuth states.
 */

import { SQLDatabase } from "encore.dev/storage/sqldb";

/**
 * Zerodha authentication database instance.
 * 
 * Why this exists: Centralized database connection for all Zerodha auth operations
 */
export const db = new SQLDatabase("zerodha_auth", {
  migrations: "./migrations",
});

