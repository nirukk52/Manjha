/**
 * BetterAuth API route handler.
 * 
 * Why this exists: Handles all auth endpoints (/api/auth/*) including
 * OAuth callbacks, session management, and sign-out.
 */
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);

