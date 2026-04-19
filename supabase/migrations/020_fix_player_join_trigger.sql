-- Fix trigger crash when player_participants is NULL on join
-- The old trigger used jsonb_array_length() without COALESCE,
-- causing "cannot get length of a null array" on rows where
-- player_participants was NULL rather than '[]'::jsonb.

CREATE OR REPLACE FUNCTION trg_audit_tournament_participant_join()
RETURNS TRIGGER AS $$
BEGIN
  -- Team joined (teams array grew)
  IF array_length(NEW.teams, 1) IS DISTINCT FROM array_length(OLD.teams, 1)
     AND COALESCE(array_length(NEW.teams, 1), 0) > COALESCE(array_length(OLD.teams, 1), 0) THEN
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, entity_name, details)
    VALUES (
      NULL,
      'team_joined_tournament',
      'tournament',
      NEW.id::TEXT,
      NEW.name,
      jsonb_build_object(
        'teams_count', COALESCE(array_length(NEW.teams, 1), 0),
        'teams', NEW.teams
      )
    );
  END IF;

  -- Player joined (player_participants JSONB array grew) — safe COALESCE for NULL
  IF jsonb_array_length(COALESCE(NEW.player_participants, '[]'::jsonb))
     > jsonb_array_length(COALESCE(OLD.player_participants, '[]'::jsonb)) THEN
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, entity_name, details)
    VALUES (
      NULL,
      'player_joined_tournament',
      'tournament',
      NEW.id::TEXT,
      NEW.name,
      jsonb_build_object(
        'player_count', jsonb_array_length(COALESCE(NEW.player_participants, '[]'::jsonb)),
        'participant_type', NEW.participant_type
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure all existing rows have '[]'::jsonb (not NULL) to prevent future issues
UPDATE tournaments
SET player_participants = '[]'::jsonb
WHERE player_participants IS NULL;
