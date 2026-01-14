-- Add branding columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#18181b'; -- Default to zinc-900

-- Comment on columns
COMMENT ON COLUMN public.users.logo_url IS 'URL to the user branding logo';
COMMENT ON COLUMN public.users.brand_color IS 'Hex code for the user primary brand color';
