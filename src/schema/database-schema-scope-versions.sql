-- =====================================================
-- Sprint 5: Scope Management - Scope Versions Table
-- =====================================================
-- Run this script in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run
-- =====================================================

-- =====================================================
-- SCOPE VERSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.scope_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  deliverables TEXT,
  out_of_scope TEXT,
  assumptions TEXT,
  share_token UUID UNIQUE DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure version numbers are unique per project
  UNIQUE(project_id, version_number)
);

-- Enable RLS
ALTER TABLE public.scope_versions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR SCOPE VERSIONS
-- =====================================================

-- Users can view their own scope versions
CREATE POLICY "Users can view own scope versions"
  ON public.scope_versions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own scope versions
CREATE POLICY "Users can insert own scope versions"
  ON public.scope_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own scope versions
CREATE POLICY "Users can update own scope versions"
  ON public.scope_versions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own scope versions
CREATE POLICY "Users can delete own scope versions"
  ON public.scope_versions FOR DELETE
  USING (auth.uid() = user_id);

-- Public policy: Anyone can view scope versions by share_token (for public links)
CREATE POLICY "Anyone can view scope versions by share token"
  ON public.scope_versions FOR SELECT
  USING (share_token IS NOT NULL);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_scope_versions_project_id 
  ON public.scope_versions(project_id);

CREATE INDEX IF NOT EXISTS idx_scope_versions_user_id 
  ON public.scope_versions(user_id);

CREATE INDEX IF NOT EXISTS idx_scope_versions_share_token 
  ON public.scope_versions(share_token);

CREATE INDEX IF NOT EXISTS idx_scope_versions_created_at 
  ON public.scope_versions(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Apply updated_at trigger
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.scope_versions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- HELPER FUNCTION: Get next version number
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_next_scope_version_number(p_project_id UUID)
RETURNS INTEGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM public.scope_versions
  WHERE project_id = p_project_id;
  
  RETURN next_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Verify table created in Supabase Table Editor
-- 2. Check RLS enabled (🔒 icon visible)
-- 3. Test the get_next_scope_version_number function
-- =====================================================
