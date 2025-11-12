-- Pastoral Messages System
-- Enables two-way messaging between pastor and users while maintaining privacy options

-- Conversations table - tracks each user's conversation session
CREATE TABLE IF NOT EXISTS pastoral_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL, -- Browser-generated session ID
  first_name TEXT NOT NULL,
  contact_email TEXT, -- Optional - only if user provides it
  contact_phone TEXT, -- Optional - only if user provides it
  contact_provided_at TIMESTAMPTZ, -- When they shared contact info
  has_unread_from_pastor BOOLEAN DEFAULT FALSE,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table - stores all messages in the conversation
CREATE TABLE IF NOT EXISTS pastoral_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id UUID REFERENCES pastoral_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'user' or 'pastor'
  message TEXT NOT NULL,
  is_ai_response BOOLEAN DEFAULT FALSE, -- Track which messages are AI vs. human pastor
  flagged_serious BOOLEAN DEFAULT FALSE, -- Was this flagged as serious/crisis?
  read_by_user BOOLEAN DEFAULT FALSE,
  read_by_pastor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pastoral_conversations_session ON pastoral_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_pastoral_conversations_unread ON pastoral_conversations(has_unread_from_pastor) WHERE has_unread_from_pastor = TRUE;
CREATE INDEX IF NOT EXISTS idx_pastoral_messages_conversation ON pastoral_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_pastoral_messages_flagged ON pastoral_messages(flagged_serious) WHERE flagged_serious = TRUE;
CREATE INDEX IF NOT EXISTS idx_pastoral_messages_unread_user ON pastoral_messages(read_by_user) WHERE sender = 'pastor' AND read_by_user = FALSE;

-- Enable Row Level Security
ALTER TABLE pastoral_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastoral_messages ENABLE ROW LEVEL SECURITY;

-- Service role can manage everything
CREATE POLICY "Service role can manage conversations" ON pastoral_conversations
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage messages" ON pastoral_messages
  FOR ALL
  USING (auth.role() = 'service_role');

-- Helper function to update last activity
CREATE OR REPLACE FUNCTION update_conversation_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pastoral_conversations
  SET last_activity = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_activity_trigger
  AFTER INSERT ON pastoral_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_activity();

-- Helper function to mark conversation as having unread messages from pastor
CREATE OR REPLACE FUNCTION mark_unread_from_pastor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sender = 'pastor' THEN
    UPDATE pastoral_conversations
    SET has_unread_from_pastor = TRUE
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mark_unread_from_pastor_trigger
  AFTER INSERT ON pastoral_messages
  FOR EACH ROW
  EXECUTE FUNCTION mark_unread_from_pastor();
