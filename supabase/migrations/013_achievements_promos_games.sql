-- ============================================================================
-- 013: Achievements, promo codes, and games tables
-- ============================================================================

-- achievements — staff-defined achievement templates
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  icon TEXT,
  category TEXT CHECK (category IN ('tournament','team','social','milestone')) DEFAULT 'milestone',
  criteria JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- gamer_achievements — earned achievements per gamer
CREATE TABLE IF NOT EXISTS public.gamer_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  achievement_id UUID REFERENCES public.achievements ON DELETE CASCADE,
  tournament_id UUID REFERENCES public.tournaments,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- promo_codes — discount codes for marketplace cart
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent NUMERIC NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  description TEXT,
  gamer_id UUID REFERENCES auth.users,
  is_active BOOLEAN DEFAULT TRUE,
  max_uses INTEGER,
  use_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- games — game catalog for selection dropdowns
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT,
  image TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
