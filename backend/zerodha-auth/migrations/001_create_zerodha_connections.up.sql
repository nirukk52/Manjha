-- Migration: Create zerodha_connections table
-- Purpose: Store Zerodha OAuth connection tokens and status for users
-- Author: Manjha Backend Team
-- Date: 2025-11-22

CREATE TABLE IF NOT EXISTS zerodha_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    zerodha_user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,  -- Encrypted access token
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, EXPIRED, REVOKED, ERROR, NOT_CONNECTED
    last_balance_fetch TIMESTAMP WITH TIME ZONE,
    error_details TEXT,
    
    -- Constraints
    CONSTRAINT check_status CHECK (status IN ('ACTIVE', 'EXPIRED', 'REVOKED', 'ERROR', 'NOT_CONNECTED'))
);

-- Indexes for performance
CREATE INDEX idx_zerodha_connections_user_id ON zerodha_connections(user_id);
CREATE INDEX idx_zerodha_connections_status ON zerodha_connections(status);
CREATE INDEX idx_zerodha_connections_expires_at ON zerodha_connections(expires_at);

-- Comments for documentation
COMMENT ON TABLE zerodha_connections IS 'Stores Zerodha OAuth connection tokens and status for users';
COMMENT ON COLUMN zerodha_connections.access_token IS 'Encrypted Zerodha access token (expires ~6 hours)';
COMMENT ON COLUMN zerodha_connections.expires_at IS 'Token expiration time (6 AM next day IST)';
COMMENT ON COLUMN zerodha_connections.status IS 'Connection status: ACTIVE, EXPIRED, REVOKED, ERROR, NOT_CONNECTED';

