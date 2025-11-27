/**
 * BetterAuth server instance for Manjha.
 * 
 * Why this exists: Provides Google OAuth authentication for progressive auth flow.
 * Anonymous users get 1 free message, then must sign in to continue.
 */
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
});

