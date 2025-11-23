-- Migration: Create zerodha_balance_history table
-- Purpose: Track historical balance data for analytics and caching
-- Author: Manjha Backend Team
-- Date: 2025-11-22

CREATE TABLE IF NOT EXISTS zerodha_balance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES zerodha_connections(id) ON DELETE CASCADE,
    available_balance NUMERIC(15, 2) NOT NULL,
    used_margin NUMERIC(15, 2) NOT NULL,
    total_balance NUMERIC(15, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    fetch_latency_ms INTEGER NOT NULL,
    
    -- Constraints
    CONSTRAINT check_positive_balance CHECK (available_balance >= 0),
    CONSTRAINT check_positive_margin CHECK (used_margin >= 0),
    CONSTRAINT check_positive_total CHECK (total_balance >= 0),
    CONSTRAINT check_positive_latency CHECK (fetch_latency_ms > 0)
);

-- Indexes for performance
CREATE INDEX idx_zerodha_balance_connection_id ON zerodha_balance_history(connection_id);
CREATE INDEX idx_zerodha_balance_timestamp ON zerodha_balance_history(timestamp DESC);

-- Comments for documentation
COMMENT ON TABLE zerodha_balance_history IS 'Historical balance data for analytics and caching';
COMMENT ON COLUMN zerodha_balance_history.available_balance IS 'Available cash balance in account';
COMMENT ON COLUMN zerodha_balance_history.used_margin IS 'Margin currently in use';
COMMENT ON COLUMN zerodha_balance_history.fetch_latency_ms IS 'API call latency for monitoring';

