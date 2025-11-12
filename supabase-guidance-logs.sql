-- Create guidance_logs table for tracking pastoral guidance questions
-- This helps improve the AI and understand user needs
-- Only stores first name to protect privacy

CREATE TABLE IF NOT EXISTS guidance_logs (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_guidance_logs_created_at ON guidance_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guidance_logs_flagged ON guidance_logs(flagged);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE guidance_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to read/write
CREATE POLICY "Service role can manage guidance logs" ON guidance_logs
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE guidance_logs IS 'Logs pastoral guidance questions for learning and improvement. Only stores first name for privacy.';
