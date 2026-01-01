-- =====================================================
-- Sprint 7: Timeline Schema Update
-- =====================================================
-- Run this script in Supabase SQL Editor
-- =====================================================

-- 1. Update event_type Check Constraint
-- We need to add 'scope_update' and 'reminder' to the allowed types
-- Postgres doesn't allow easily altering a check constraint, so we drop and add it back

ALTER TABLE public.timeline_events
DROP CONSTRAINT IF EXISTS timeline_events_event_type_check;

ALTER TABLE public.timeline_events
ADD CONSTRAINT timeline_events_event_type_check 
CHECK (event_type IN (
  'note', 
  'email', 
  'call', 
  'meeting', 
  'milestone', 
  'status_change', 
  'payment', 
  'scope_update', 
  'reminder',
  'other'
));

-- 2. Add indexes for new query patterns if they don't exist
-- We will search by project_id and order by event_date desc
CREATE INDEX IF NOT EXISTS idx_timeline_events_project_date 
ON public.timeline_events(project_id, event_date DESC);
