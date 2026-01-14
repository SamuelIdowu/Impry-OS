-- =====================================================
-- Missing Columns Migration
-- =====================================================
-- This migration adds columns that are used by the application
-- but were missing from the initial schema.
-- Run this in Supabase SQL Editor if you get PGRST204 errors.
-- =====================================================

-- Add branding columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#18181b';

-- Add tax and discount columns to payments table
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_rate DECIMAL(5, 2) DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN public.users.logo_url IS 'URL to the user branding logo';
COMMENT ON COLUMN public.users.brand_color IS 'Hex code for the user primary brand color (e.g., #18181b)';
COMMENT ON COLUMN public.payments.tax_rate IS 'Tax rate as a percentage (e.g., 20 for 20%)';
COMMENT ON COLUMN public.payments.discount_rate IS 'Discount rate as a percentage (e.g., 10 for 10% discount)';
