/**
 * BetterAuth React client for Manjha.
 * 
 * Why this exists: Provides React hooks and methods for authentication.
 * - useSession() for reactive session state
 * - signIn.social() for Google OAuth
 * - signOut() for logging out
 */
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

