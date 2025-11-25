/**
 * Frontend types and re-exports from backend contracts.
 * 
 * Why this exists: Single source of truth for shared types between frontend/backend
 */

/**
 * Available data connectors for chat context
 */
export enum Connector {
  // Trading platforms
  ZERODHA = 'Zerodha',
  ROBINHOOD = 'Robinhood',
  INTERACTIVE_BROKERS = 'Interactive Brokers',
  TD_AMERITRADE = 'TD Ameritrade',
  
  // Twitter accounts  
  TRUMP = '@realDonaldTrump',
  ELON_MUSK = '@elonmusk',
  CHAMATH = '@chamath',
  CATHIE_WOOD = '@cathiedwood',
}

