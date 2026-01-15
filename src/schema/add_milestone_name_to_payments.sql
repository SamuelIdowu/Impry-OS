-- Add milestone_name column to payments table if it doesn't exist
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS milestone_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.payments.milestone_name IS 'Name of the payment milestone (e.g., Deposit, Final Payment)';
