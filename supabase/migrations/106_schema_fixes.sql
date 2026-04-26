-- Fix participant_type check constraint to include all valid values
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_participant_type_check;
ALTER TABLE tournaments ADD CONSTRAINT tournaments_participant_type_check
  CHECK (participant_type IN ('team','solo','duo','individual'));

-- Add missing columns if they don't exist
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS rules TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS entry_fee NUMERIC(10,2) DEFAULT 0;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS skill_level TEXT DEFAULT 'open';
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS venue_name TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS venue_address TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS venue_google_maps TEXT;

-- Fix skill_level constraint if exists
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_skill_level_check;
ALTER TABLE tournaments ADD CONSTRAINT tournaments_skill_level_check
  CHECK (skill_level IN ('open','beginner','intermediate','advanced','pro'));

-- Fix subscription plan constraint in subscriptions table
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free','community','premium','starter','growth','pro','enterprise'));
