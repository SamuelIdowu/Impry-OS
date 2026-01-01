-- Add last_contact_date column to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMPTZ;
