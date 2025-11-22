/**
 * Secret key constants for Encore secret management.
 * 
 * Why this exists: Centralize secret key names to avoid hardcoding strings
 * and enable easy secret key rotation/updates across the codebase.
 */

export const SecretKeys = {
  /** OpenAI API Key for all AI agents */
  OPENAI_API_KEY: 'OpenAIApiKey2',
} as const;

/**
 * Type-safe secret key type
 */
export type SecretKey = typeof SecretKeys[keyof typeof SecretKeys];

