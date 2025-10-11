-- Store email subscribers
CREATE TABLE IF NOT EXISTS email_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source VARCHAR(50) DEFAULT 'post-study',
  is_active BOOLEAN DEFAULT true,
  unsubscribe_token VARCHAR(255) UNIQUE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_token ON email_subscribers(unsubscribe_token);