-- ============================================================================
-- 007: Billing — bills and billing_snapshots
-- Bills are generated when tournaments are published or co-organizers commit.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number TEXT UNIQUE NOT NULL,
  bill_type TEXT CHECK (bill_type IN ('gamer','organizer','co_organizer')) NOT NULL,
  tournament_id TEXT,
  tournament_name TEXT,
  tournament_order_id TEXT,
  payer_id TEXT NOT NULL,
  payer_type TEXT,
  payer_name TEXT,
  payer_email TEXT,
  gamer_name TEXT,
  organizer_name TEXT,
  order_id TEXT,
  items JSONB DEFAULT '[]',
  subtotal NUMERIC DEFAULT 0,
  platform_fee NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  grand_total NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('unpaid','partial','paid','overdue')) DEFAULT 'unpaid',
  due_date DATE,
  paid_date DATE,
  payment_method TEXT,
  paymob_order_id TEXT,
  paymob_transaction_id TEXT,
  notes TEXT,
  shared_tournament BOOLEAN DEFAULT FALSE,
  shared_bill_ref TEXT,
  total_tournament_cost NUMERIC,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- billing_snapshots — point-in-time record of each party's commitment
CREATE TABLE IF NOT EXISTS public.billing_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments,
  tournament_name TEXT,
  tournament_type TEXT,
  organizer_id TEXT,
  organizer_brand_name TEXT,
  organizer_brand_logo TEXT,
  billing_type TEXT CHECK (billing_type IN ('main_organizer','shared_co')),
  commitment_percent NUMERIC,
  amount_due NUMERIC NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('unpaid','paid','partial')) DEFAULT 'unpaid',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
