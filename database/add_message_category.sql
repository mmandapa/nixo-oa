-- ============================================
-- ADD CATEGORY FIELD TO MESSAGES TABLE
-- ============================================
-- This migration adds category tracking at the message level
-- Run this in Supabase SQL Editor

-- Add category column to messages table (nullable initially)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS category TEXT CHECK (
  category IN ('support', 'bug', 'feature', 'question')
);

-- Create index for category queries
CREATE INDEX IF NOT EXISTS idx_messages_category ON messages(category);

-- Update existing messages to have a category (use ticket category as default)
UPDATE messages 
SET category = (
  SELECT tickets.category 
  FROM tickets 
  WHERE tickets.id = messages.ticket_id
)
WHERE category IS NULL;

-- Set default for any remaining NULL values
UPDATE messages 
SET category = 'question'
WHERE category IS NULL;

-- Make category NOT NULL after backfilling
ALTER TABLE messages 
ALTER COLUMN category SET NOT NULL;

