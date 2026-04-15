-- ============================================================================
-- 011: Approval requests — staff approval workflow
-- Used for team joins, tournament publishing, and talent applications.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_type TEXT CHECK (approval_type IN ('team_join','tournament_publish','talent_application')) NOT NULL,
  requester_id UUID REFERENCES auth.users NOT NULL,
  requester_name TEXT,
  requester_email TEXT,
  reference_id TEXT NOT NULL,
  reference_name TEXT,
  details JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
