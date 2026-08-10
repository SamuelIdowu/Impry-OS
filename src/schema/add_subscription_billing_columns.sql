-- Add subscription & billing columns to workspaces table
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'free';
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active';
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS payment_provider text DEFAULT 'none';
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS subscription_id text;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS customer_id text;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS current_period_end timestamp with time zone;

-- Create billing_webhook_events table for idempotency
CREATE TABLE IF NOT EXISTS billing_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  status text DEFAULT 'processed',
  payload jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_webhook_events_event_id ON billing_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_subscription_id ON workspaces(subscription_id);
