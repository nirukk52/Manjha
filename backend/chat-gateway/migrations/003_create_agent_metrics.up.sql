-- Create agent_metrics table
-- Stores performance metrics for agent calls

CREATE TABLE agent_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL CHECK (agent_type IN ('FINANCE', 'GENERAL')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  latency_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  error_code TEXT,
  user_id TEXT NOT NULL
);

-- Index for time-series queries
CREATE INDEX idx_metrics_agent_timestamp ON agent_metrics(agent_type, timestamp);

-- Index for success rate calculations
CREATE INDEX idx_metrics_success ON agent_metrics(agent_type, success, timestamp);

-- Index for error analysis
CREATE INDEX idx_metrics_errors ON agent_metrics(error_code) WHERE error_code IS NOT NULL;



