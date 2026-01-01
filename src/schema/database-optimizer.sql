-- =====================================================
-- Sprint 9: Performance Optimization
-- Additional Indexes for Frequent Queries
-- =====================================================

-- 1. Reminders: Follow-Up Inbox Query
-- Query: WHERE user_id = ? AND status = 'pending' ORDER BY reminder_date ASC
CREATE INDEX IF NOT EXISTS idx_reminders_inbox 
ON public.reminders(user_id, status, reminder_date);

-- 2. Timeline: Project Feed
-- Query: WHERE project_id = ? ORDER BY event_date DESC
CREATE INDEX IF NOT EXISTS idx_timeline_project_feed
ON public.timeline_events(project_id, event_date DESC);

-- 3. Projects: At-Risk Query (Dashboard)
-- Query: WHERE user_id = ? AND status != 'completed' ...
CREATE INDEX IF NOT EXISTS idx_projects_status_deadline
ON public.projects(user_id, status, deadline);

-- 4. Payments: Dashboard Metrics
-- Query: WHERE user_id = ? AND status = 'pending' ...
CREATE INDEX IF NOT EXISTS idx_payments_metrics
ON public.payments(user_id, status, due_date);

-- 5. Clients: List sorting
CREATE INDEX IF NOT EXISTS idx_clients_name_search
ON public.clients(user_id, name);
