-- ============================================
-- NIXO FDE SLACKBOT - DATABASE SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;        -- pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS pg_trgm;       -- Trigram similarity (optional)

-- ============================================
-- TICKETS TABLE
-- ============================================
CREATE TABLE tickets (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ticket metadata
  title TEXT NOT NULL,                        -- First message preview (max 150 chars)
  category TEXT NOT NULL CHECK (
    category IN ('support', 'bug', 'feature', 'question')
  ),
  status TEXT DEFAULT 'open' CHECK (
    status IN ('open', 'closed', 'in_progress')
  ),
  
  -- Slack context
  channel_id TEXT NOT NULL,                   -- Slack channel ID (C01ABC123)
  channel_name TEXT,                          -- Human-readable (#customer-acme)
  first_message_ts TEXT NOT NULL,             -- Thread root or first message timestamp
  
  -- AI/ML
  embedding vector(1536),                     -- OpenAI ada-002 embedding
  
  -- Metadata
  message_count INTEGER DEFAULT 1,            -- Number of messages in ticket
  last_user_id TEXT,                          -- Last user who added message
  last_user_name TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT unique_thread_per_channel UNIQUE (channel_id, first_message_ts)
);

-- Performance indexes
CREATE INDEX idx_tickets_updated_at ON tickets(updated_at DESC);
CREATE INDEX idx_tickets_channel ON tickets(channel_id);
CREATE INDEX idx_tickets_category ON tickets(category);
CREATE INDEX idx_tickets_status ON tickets(status);

-- Vector similarity index (IVFFlat algorithm)
CREATE INDEX idx_tickets_embedding ON tickets 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to ticket
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  
  -- Slack unique identifier (for de-duplication)
  slack_message_id TEXT UNIQUE NOT NULL,      -- Format: "{channel_id}:{ts}"
  
  -- Message content
  text TEXT NOT NULL,
  
  -- User info
  user_id TEXT NOT NULL,                      -- Slack user ID (U01ABC123)
  user_name TEXT NOT NULL,                    -- Display name
  
  -- Slack context
  channel_id TEXT NOT NULL,
  thread_ts TEXT,                             -- NULL if not in thread
  message_ts TEXT NOT NULL,                   -- Original Slack timestamp
  
  -- Metadata
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_messages_ticket_id ON messages(ticket_id);
CREATE INDEX idx_messages_slack_id ON messages(slack_message_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_channel ON messages(channel_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at on ticket changes
CREATE OR REPLACE FUNCTION update_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ticket_timestamp
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_updated_at();

-- Auto-increment message_count when message added
CREATE OR REPLACE FUNCTION increment_ticket_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tickets 
  SET 
    message_count = message_count + 1,
    updated_at = NOW(),
    last_user_id = NEW.user_id,
    last_user_name = NEW.user_name
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_message_count
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_ticket_message_count();

-- ============================================
-- VECTOR SIMILARITY SEARCH FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION find_similar_tickets(
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.82,
  time_window_minutes int DEFAULT 30,
  channel_filter text DEFAULT NULL,
  max_results int DEFAULT 5
)
RETURNS TABLE (
  ticket_id uuid,
  title text,
  category text,
  channel_id text,
  similarity float,
  created_at timestamptz
)
LANGUAGE sql STABLE
AS $$
  SELECT
    t.id AS ticket_id,
    t.title,
    t.category,
    t.channel_id,
    1 - (t.embedding <=> query_embedding) AS similarity,
    t.created_at
  FROM tickets t
  WHERE 
    t.created_at > NOW() - (time_window_minutes || ' minutes')::interval
    AND t.status = 'open'
    AND (channel_filter IS NULL OR t.channel_id = channel_filter)
    AND 1 - (t.embedding <=> query_embedding) > similarity_threshold
  ORDER BY t.embedding <=> query_embedding
  LIMIT max_results;
$$;

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================
-- ROW LEVEL SECURITY (Optional - disable for now)
-- ============================================
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for development" ON tickets FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON messages FOR ALL USING (true);

