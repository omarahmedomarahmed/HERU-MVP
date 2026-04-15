-- ============================================================================
-- 005: Marketplace items and gamer orders
-- ============================================================================

-- marketplace_items — items available in the tournament builder and gamer shop
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('game_setup','teams','live_talent','production','branding','venue','prizepool')),
  type TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  image TEXT,
  talent_user_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  stock INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- orders — gamer marketplace orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gamer_id UUID REFERENCES auth.users,
  organizer_id UUID REFERENCES auth.users,
  order_type TEXT CHECK (order_type IN ('marketplace','tournament')) DEFAULT 'marketplace',
  tournament_id UUID REFERENCES public.tournaments,
  tournament_name TEXT,
  tournament_type TEXT,
  items JSONB DEFAULT '[]',
  total NUMERIC DEFAULT 0,
  status TEXT CHECK (status IN ('pending','processing','completed','cancelled')) DEFAULT 'pending',
  shipping_address JSONB,
  support_chat JSONB DEFAULT '[]',
  promo_code_used TEXT,
  discount_applied NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
