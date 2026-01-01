-- =====================================================
-- Sprint 8 FIX: Add missing columns to reminders table
-- =====================================================

-- 1. Add status column with check constraint
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
CHECK (status IN ('pending', 'completed', 'snoozed'));

-- 2. Add snoozed_until column
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMPTZ;

-- 3. Add completed_at column
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 4. Re-apply the index that failed
CREATE INDEX IF NOT EXISTS idx_reminders_inbox 
ON public.reminders(user_id, status, reminder_date);

-- 5. Add index for snoozed items
CREATE INDEX IF NOT EXISTS idx_reminders_snoozed 
ON public.reminders(user_id, snoozed_until)
WHERE status = 'snoozed';
