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
 *   Used in: finance-agent, general-agent, message-classifier
 * 
 * To rotate a secret:
 * 1. Set new secret in Encore: encore secret set --env <env> <SecretName>
 * 2. Find and replace the old secret name in all agent files
 */

