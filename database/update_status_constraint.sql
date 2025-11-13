-- ============================================
-- UPDATE TICKET STATUS CONSTRAINT
-- ============================================
-- Run this in Supabase SQL Editor to enable new status values

-- Drop the old constraint
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;

-- Add new constraint with all status options
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check CHECK (
  status IN ('open', 'pending', 'in_progress', 'resolved', 'closed')
);

-- Verify the update
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'tickets'::regclass
  AND conname = 'tickets_status_check';

