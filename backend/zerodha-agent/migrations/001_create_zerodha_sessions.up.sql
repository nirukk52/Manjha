-- Zerodha OAuth sessions
CREATE TABLE zerodha_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  access_token TEXT,
  user_id TEXT,
  user_name TEXT,
  email TEXT,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACTIVE', 'EXPIRED')) DEFAULT 'PENDING',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_zerodha_sessions_device ON zerodha_sessions(device_id);
