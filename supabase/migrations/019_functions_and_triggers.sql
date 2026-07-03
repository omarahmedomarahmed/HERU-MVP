-- ============================================================================
-- 019: Database functions and triggers
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Auto-update updated_at timestamp on any UPDATE
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with an updated_at column
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'updated_at'
    GROUP BY table_name
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', tbl);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()',
      tbl
    );
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. Audit log helper function (callable from triggers or backend)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_log_insert(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_entity_name TEXT,
  p_user_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, entity_name, details)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_entity_name, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 3. Trigger: log team creation to audit_log
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_audit_team_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, entity_name, details)
  VALUES (
    NEW.leader_id,
    'team_created',
    'team',
    NEW.id::TEXT,
    NEW.name,
    jsonb_build_object('leader_id', NEW.leader_id, 'games', NEW.games)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_team_created ON public.teams;
CREATE TRIGGER audit_team_created
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_audit_team_created();

-- ---------------------------------------------------------------------------
-- 4. Trigger: log talent application (is_talent flips to true)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_audit_talent_application()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_talent = TRUE AND (OLD.is_talent IS NULL OR OLD.is_talent = FALSE) THEN
    INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, entity_name, details)
    VALUES (
      NEW.user_id::TEXT,
      'talent_application',
      'gamer_profile',
      NEW.id::TEXT,
      NEW.username,
      jsonb_build_object('talent_type', NEW.talent_type, 'talent_price', NEW.talent_price)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_talent_application ON public.gamer_profiles;
CREATE TRIGGER audit_talent_application
  AFTER UPDATE ON public.gamer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_audit_talent_application();

-- ---------------------------------------------------------------------------
-- 5. Trigger: log tournament participant joins
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_audit_tournament_participant_join()
RETURNS TRIGGER AS $$
BEGIN
  -- Team joined (teams array grew)
  IF array_length(NEW.teams, 1) IS DISTINCT FROM array_length(OLD.teams, 1)
     AND COALESCE(array_length(NEW.teams, 1), 0) > COALESCE(array_length(OLD.teams, 1), 0) THEN
    INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, entity_name, details)
    VALUES (
      NULL,
      'team_joined_tournament',
      'tournament',
      NEW.id::TEXT,
      NEW.name,
      jsonb_build_object('teams_count', COALESCE(array_length(NEW.teams, 1), 0))
    );
  END IF;

  -- Player joined (player_participants array grew)
  IF jsonb_array_length(COALESCE(NEW.player_participants, '[]'::jsonb)) >
     jsonb_array_length(COALESCE(OLD.player_participants, '[]'::jsonb)) THEN
    INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, entity_name, details)
    VALUES (
      NULL,
      'player_joined_tournament',
      'tournament',
      NEW.id::TEXT,
      NEW.name,
      jsonb_build_object('player_count', jsonb_array_length(NEW.player_participants))
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_tournament_participant_join ON public.tournaments;
CREATE TRIGGER audit_tournament_participant_join
  AFTER UPDATE ON public.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_audit_tournament_participant_join();
