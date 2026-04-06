-- Migration 006: Security fixes for RLS policies
-- Applied: 2026-04-04

-- Fix teams UPDATE policy: only team leader should be able to update
DROP POLICY IF EXISTS "Authenticated can update teams" ON public.teams;
CREATE POLICY "Leaders can update teams" ON public.teams
  FOR UPDATE USING (leader_id = auth.uid()::text);

-- Fix staff_access_keys: remove overly permissive SELECT policy
-- (Backend uses service_role key which bypasses RLS, so no policy needed)
DROP POLICY IF EXISTS "Staff can read active keys" ON public.staff_access_keys;

-- Add team_chats field to tournaments for per-team organizer chat
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS team_chats JSONB DEFAULT '{}';
