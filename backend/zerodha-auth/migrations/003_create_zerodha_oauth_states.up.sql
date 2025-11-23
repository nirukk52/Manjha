-- Migration: Create zerodha_oauth_states table
-- Purpose: Temporary storage for OAuth state parameter (CSRF protection)
-- Author: Manjha Backend Team
-- Date: 2025-11-22

CREATE TABLE IF NOT EXISTS zerodha_oauth_states (
    state TEXT PRIMARY KEY,  -- Cryptographically random state parameter
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    used BOOLEAN NOT NULL DEFAULT FALSE
);

-- Index for cleanup of expired states
CREATE INDEX idx_zerodha_oauth_states_created_at ON zerodha_oauth_states(created_at);

-- Comments for documentation
COMMENT ON TABLE zerodha_oauth_states IS 'Temporary storage for OAuth state parameter (CSRF protection)';
COMMENT ON COLUMN zerodha_oauth_states.state IS 'Cryptographically random state parameter (32+ bytes)';
COMMENT ON COLUMN zerodha_oauth_states.created_at IS 'State creation time (auto-cleanup after 15 minutes)';
COMMENT ON COLUMN zerodha_oauth_states.used IS 'Whether state has been consumed in OAuth callback';

