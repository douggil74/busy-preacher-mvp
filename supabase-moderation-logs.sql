-- Moderation Logs Table
-- Tracks all moderation events for admin review

CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  moderation_type TEXT NOT NULL, -- 'abusive', 'spam', 'off-topic', 'testing'
  user_question TEXT NOT NULL,
  user_ip TEXT,
  user_agent TEXT,
  response_sent TEXT NOT NULL
);

-- Index for faster querying by date and type
CREATE INDEX idx_moderation_logs_created_at ON moderation_logs(created_at DESC);
CREATE INDEX idx_moderation_logs_type ON moderation_logs(moderation_type);

-- Enable Row Level Security
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert (backend only)
CREATE POLICY "Service role can insert logs" ON moderation_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Only service role can read logs (admin only)
CREATE POLICY "Service role can read logs" ON moderation_logs
  FOR SELECT
  USING (auth.role() = 'service_role');
