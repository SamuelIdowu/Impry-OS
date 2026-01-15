-- Add description column to payments table if it doesn't exist
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Verify the column was added (optional, for confirmation)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments' AND column_name = 'description';
