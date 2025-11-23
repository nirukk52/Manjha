-- Add unique constraint on user_id for ON CONFLICT support
ALTER TABLE zerodha_connections ADD CONSTRAINT zerodha_connections_user_id_key UNIQUE (user_id);

