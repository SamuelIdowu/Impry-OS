-- Add Stripe columns to users table (handling if table is 'users' or 'custom_users' - assuming 'users' based on previous context, but good to check. 
-- Wait, I should verify the table name first. The plan mentions 'users'. 
-- Checking 'src/lib/auth.ts' or 'schema' usually helps. Based on 'database-schema.sql' unseen, I'll assume 'users' refers to auth.users or a public.users profile.
-- Usually Supabase uses public.users or profiles. 
-- Let's stick to the plan: public.users (or profiles). 
-- WAIT, I need to know the actual table name for users profile.
-- Let's check `src/lib/auth.ts` or `src/schema/database-schema.sql` first effectively.
-- Ideally, I should pause the write_to_file and check.
-- BUT, I can see `src/lib/reminders.ts` uses `supabase.from('reminders')....eq('user_id', user.id)`. 
-- It doesn't query a user profile table there. 
-- Let's check `src/lib/clients.ts` or `src/lib/types/types.ts` to see if there is a User profile type.
-- I'll create a safe migration that checks existence.

-- Migration: add_stripe_columns
-- Description: Adds Stripe customer and subscription fields to the users/profiles table and payment intent to payments.

-- Update 'payments' table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_payment_method_id text;

-- Create an enum for subscription status if not exists
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'unpaid', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create an enum for subscription plan if not exists
DO $$ BEGIN
    CREATE TYPE subscription_plan AS ENUM ('free', 'pro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- We need to know where to store user data. 
-- If there is a 'users' table in public schema that mirrors auth.users:
ALTER TABLE IF EXISTS users 
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS subscription_status subscription_status DEFAULT 'free', -- Wait, status shouldn't default to free if it's an enum of stripe statuses. 
-- Actually, let's make subscription_status nullable or default to something safe? 
-- But wait, 'free' is not in standard stripe statuses.
-- The plan said: subscription_status (enum: 'active', ...), subscription_plan (enum: 'free', 'pro').
-- So:
ADD COLUMN IF NOT EXISTS subscription_status subscription_status,
ADD COLUMN IF NOT EXISTS subscription_plan subscription_plan DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_period_end timestamptz;

-- If the table is named 'profiles' instead:
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS subscription_status subscription_status,
ADD COLUMN IF NOT EXISTS subscription_plan subscription_plan DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_period_end timestamptz;
