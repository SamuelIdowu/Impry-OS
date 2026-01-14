-- Add tax_rate and discount_rate columns to payments table
-- These columns are used for invoice calculations

-- Add tax_rate column (percentage, e.g., 20 for 20%)
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 0;

-- Add discount_rate column (percentage, e.g., 10 for 10%)
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS discount_rate DECIMAL(5, 2) DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN public.payments.tax_rate IS 'Tax rate as a percentage (e.g., 20 for 20%)';
COMMENT ON COLUMN public.payments.discount_rate IS 'Discount rate as a percentage (e.g., 10 for 10% discount)';
