-- Add progress column to projects table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'progress') THEN
        ALTER TABLE public.projects ADD COLUMN progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);
    END IF;
END $$;
