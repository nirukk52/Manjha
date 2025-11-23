/**
 * Secret key documentation for Encore secret management.
 * 
 * NOTE: Encore's secret() function requires string literals at compile time,
 * so these cannot be used as constants. This file serves as documentation.
 * 
 * Why this exists: Document all secret keys used in the application
 * in a centralized location for easy reference.
 * 
 * Active Secrets:
 * - "OpenAIApiKey2": OpenAI API Key for all AI agents
 *   Used in: finance-agent, general-agent, message-classifier, agent-orchestrator
 * 
 * - "ZerodhaApiKey": Zerodha Kite Connect API Key
 *   Used in: zerodha-auth
 *   Get from: https://developers.kite.trade/
 * 
 * - "ZerodhaApiSecret": Zerodha Kite Connect API Secret
 *   Used in: zerodha-auth
 *   Get from: https://developers.kite.trade/
 * 
 * - "ZerodhaRedirectUrl": OAuth redirect URL for Zerodha authentication
 *   Used in: zerodha-auth
 *   Must match URL configured in Kite Connect app settings
 * 
 * - "FrontendUrl": Frontend application URL for post-OAuth redirects
 *   Used in: zerodha-auth
 *   Example: http://localhost:3001 (dev), https://your-app.vercel.app (prod)
 * 
 * - "EncryptionKey": AES-256-GCM encryption key for token storage
 *   Used in: zerodha-auth
 *   Must be 64-character hex string (32 bytes)
 * 
 * To rotate a secret:
 * 1. Set new secret in Encore: encore secret set --env <env> <SecretName>
 * 2. Find and replace the old secret name in all agent files
 */

