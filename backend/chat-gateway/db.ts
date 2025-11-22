/**
 * Database connection for chat-gateway service.
 * 
 * This module initializes the PostgreSQL database connection for storing
 * chat sessions, messages, and agent metrics.
 * 
 * Why this exists: Provides type-safe database access using Encore's SQLDatabase
 */

import { SQLDatabase } from "encore.dev/storage/sqldb";

/**
 * The main database for the chat gateway service.
 * 
 * Encore automatically provisions and manages this database across
 * all environments (local, staging, production).
 */
export const db = new SQLDatabase("chat", {
  migrations: "./migrations",
});



