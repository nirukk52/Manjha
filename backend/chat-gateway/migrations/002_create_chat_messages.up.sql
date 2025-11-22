-- Create chat_messages table
-- Stores all chat messages with agent metadata

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('USER', 'AGENT')),
  content TEXT NOT NULL,
  agent_type TEXT CHECK (agent_type IN ('FINANCE', 'GENERAL')),
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'STREAMING', 'COMPLETE', 'ERROR')) DEFAULT 'PENDING',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  latency_ms INTEGER,
  error_details TEXT,
  
  -- Ensure agent_type is set for AGENT messages
  CONSTRAINT check_agent_type_for_agent CHECK (
    sender != 'AGENT' OR agent_type IS NOT NULL
  )
);

-- Index for retrieving messages by session
CREATE INDEX idx_messages_session_timestamp ON chat_messages(session_id, timestamp);

-- Index for agent performance queries
CREATE INDEX idx_messages_agent_type_timestamp ON chat_messages(agent_type, timestamp) WHERE sender = 'AGENT';



