-- Create chat_sessions table
-- Stores chat session metadata and lifecycle state

CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'IDLE', 'ARCHIVED')) DEFAULT 'ACTIVE',
  
  -- Indexes for common queries
  CONSTRAINT idx_user_id_created_at UNIQUE (user_id, created_at)
);

-- Index for finding active sessions by user
CREATE INDEX idx_sessions_user_status ON chat_sessions(user_id, status);

-- Index for session cleanup queries
CREATE INDEX idx_sessions_last_activity ON chat_sessions(last_activity_at);



