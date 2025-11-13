-- ============================================
-- SCHEMA UPDATES FOR ENHANCED FEATURES
-- ============================================
-- Run this in Supabase SQL Editor after the main schema

-- Update tickets table: Add more status options
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check CHECK (
  status IN ('open', 'pending', 'in_progress', 'resolved', 'closed')
);

-- Update default status
ALTER TABLE tickets ALTER COLUMN status SET DEFAULT 'open';

-- ============================================
-- TICKET HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  
  -- What changed
  action TEXT NOT NULL CHECK (
    action IN ('created', 'status_changed', 'title_updated', 'message_added', 'deleted')
  ),
  
  -- Change details
  old_value TEXT,                    -- Previous value (e.g., old status)
  new_value TEXT,                    -- New value (e.g., new status)
  changed_by TEXT,                   -- User who made the change (optional)
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB                      -- Additional context (e.g., reason for change)
);

-- Indexes for history
CREATE INDEX idx_ticket_history_ticket_id ON ticket_history(ticket_id);
CREATE INDEX idx_ticket_history_created_at ON ticket_history(created_at DESC);
CREATE INDEX idx_ticket_history_action ON ticket_history(action);

-- Function to auto-log status changes
CREATE OR REPLACE FUNCTION log_ticket_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO ticket_history (
      ticket_id,
      action,
      old_value,
      new_value,
      changed_by,
      metadata
    ) VALUES (
      NEW.id,
      'status_changed',
      OLD.status,
      NEW.status,
      current_setting('app.user_id', true),
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'timestamp', NOW()
      )
    );
  END IF;
  
  IF OLD.title IS DISTINCT FROM NEW.title THEN
    INSERT INTO ticket_history (
      ticket_id,
      action,
      old_value,
      new_value,
      changed_by,
      metadata
    ) VALUES (
      NEW.id,
      'title_updated',
      OLD.title,
      NEW.title,
      current_setting('app.user_id', true),
      jsonb_build_object('timestamp', NOW())
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log changes
DROP TRIGGER IF EXISTS trigger_log_ticket_changes ON tickets;
CREATE TRIGGER trigger_log_ticket_changes
  AFTER UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION log_ticket_status_change();

-- Function to log ticket creation
CREATE OR REPLACE FUNCTION log_ticket_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ticket_history (
    ticket_id,
    action,
    new_value,
    metadata
  ) VALUES (
    NEW.id,
    'created',
    NEW.status,
    jsonb_build_object(
      'category', NEW.category,
      'title', NEW.title,
      'timestamp', NOW()
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log creation
DROP TRIGGER IF EXISTS trigger_log_ticket_creation ON tickets;
CREATE TRIGGER trigger_log_ticket_creation
  AFTER INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION log_ticket_creation();

-- Function to log message additions
CREATE OR REPLACE FUNCTION log_message_addition()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ticket_history (
    ticket_id,
    action,
    new_value,
    changed_by,
    metadata
  ) VALUES (
    NEW.ticket_id,
    'message_added',
    NEW.user_name,
    NEW.user_id,
    jsonb_build_object(
      'message_id', NEW.id,
      'message_preview', LEFT(NEW.text, 100),
      'timestamp', NOW()
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log message additions
DROP TRIGGER IF EXISTS trigger_log_message_addition ON messages;
CREATE TRIGGER trigger_log_message_addition
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION log_message_addition();

-- Enable realtime for history
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_history;

-- RLS for history
ALTER TABLE ticket_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for development" ON ticket_history FOR ALL USING (true);

