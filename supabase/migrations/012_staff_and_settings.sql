-- ============================================================================
-- 012: Staff access keys, staff sessions, and app settings
-- ============================================================================

-- staff_access_keys — pre-shared keys for staff login
CREATE TABLE IF NOT EXISTS public.staff_access_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_key TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  staff_email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- staff_sessions — active staff login sessions (24h expiry)
CREATE TABLE IF NOT EXISTS public.staff_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  staff_email TEXT NOT NULL,
  staff_name TEXT,
  access_key_id UUID REFERENCES public.staff_access_keys,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- app_settings — platform-wide key-value settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
