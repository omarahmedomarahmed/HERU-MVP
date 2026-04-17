import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import * as riot from '../lib/connect/riot.js';

const router = Router();

const CALLBACK_URL = process.env.RIOT_TOURNAMENT_CALLBACK_URL
  || `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/riot-tournament/callback`;

// GET /api/riot-tournament/health
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', stub: process.env.RIOT_USE_STUB === 'true' });
});

// ============================================================================
// Setup Riot provider + tournament for a HERU tournament (LoL only)
// POST /api/riot-tournament/:id/setup
// ============================================================================
router.post('/:id/setup', requireAuth, async (req, res) => {
  try {
    const { data: tournament, error: fetchErr } = await supabaseAdmin
      .from('tournaments')
      .select('id,name,riot_provider_id,riot_tournament_id,riot_region,organizer_id,game')
      .eq('id', req.params.id)
      .single();
    if (fetchErr || !tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.organizer_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (tournament.game !== 'League of Legends') {
      return res.status(400).json({ error: 'Riot tournament codes are only supported for League of Legends' });
    }

    let providerId = tournament.riot_provider_id;
    let tournamentId = tournament.riot_tournament_id;
    const region = tournament.riot_region || 'EUW';
    const platform = region === 'EUW' ? 'euw1' : region.toLowerCase();

    if (!providerId) {
      providerId = await riot.registerProvider(CALLBACK_URL, region, platform);
    }
    if (!tournamentId) {
      tournamentId = await riot.createTournament(providerId, tournament.name, platform);
    }

    await supabaseAdmin.from('tournaments').update({
      riot_provider_id: providerId,
      riot_tournament_id: tournamentId,
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id);

    res.json({ riot_provider_id: providerId, riot_tournament_id: tournamentId, region });
  } catch (err) {
    console.error('[riot-tournament/setup]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Generate tournament code for a match
// POST /api/riot-tournament/:id/match/:matchId/code
// ============================================================================
router.post('/:id/match/:matchId/code', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin
      .from('tournaments')
      .select('riot_tournament_id,riot_region,organizer_id,game,brackets')
      .eq('id', req.params.id)
      .single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.organizer_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (!tournament.riot_tournament_id) return res.status(400).json({ error: 'Run /setup first to register tournament with Riot' });

    const { data: match } = await supabaseAdmin
      .from('match_records')
      .select('*')
      .eq('id', req.params.matchId)
      .single();
    if (!match) return res.status(404).json({ error: 'Match not found' });
    if (match.riot_tournament_code) return res.json({ code: match.riot_tournament_code, existing: true });

    // Collect PUUIDs of all players in this match from riot_accounts
    const teamIds = [match.team1_id, match.team2_id].filter(Boolean);
    let allowedSummonerIds = [];
    if (teamIds.length > 0) {
      const { data: teams } = await supabaseAdmin
        .from('teams').select('members').in('id', teamIds);
      const memberIds = teams?.flatMap(t => t.members || []) || [];
      if (memberIds.length > 0) {
        const { data: riotAccounts } = await supabaseAdmin
          .from('riot_accounts')
          .select('puuid')
          .in('user_id', memberIds)
          .eq('game_key', 'lol')
          .eq('is_public', true);
        allowedSummonerIds = riotAccounts?.map(a => a.puuid) || [];
      }
    }

    const region = tournament.riot_region || 'EUW';
    const platform = region === 'EUW' ? 'euw1' : region.toLowerCase();
    const { teamSize = 5, pickType = 'TOURNAMENT_DRAFT', mapType = 'SUMMONERS_RIFT', spectatorType = 'ALL' } = req.body;

    const codeParams = {
      mapType, pickType, spectatorType, teamSize,
      metadata: JSON.stringify({ matchId: req.params.matchId, tournamentId: req.params.id }),
      ...(allowedSummonerIds.length > 0 ? { allowedSummonerIds } : {}),
    };

    const codes = await riot.generateTournamentCodes(
      tournament.riot_tournament_id, 1, codeParams, platform
    );
    const code = codes?.[0];
    if (!code) return res.status(500).json({ error: 'Failed to generate tournament code' });

    await supabaseAdmin.from('match_records').update({
      riot_tournament_code: code,
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.matchId);

    res.json({ code });
  } catch (err) {
    console.error('[riot-tournament/code]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Get lobby events for a match's tournament code
// GET /api/riot-tournament/:id/match/:matchId/lobby
// ============================================================================
router.get('/:id/match/:matchId/lobby', requireAuth, async (req, res) => {
  try {
    const { data: match } = await supabaseAdmin
      .from('match_records').select('riot_tournament_code').eq('id', req.params.matchId).single();
    if (!match?.riot_tournament_code) return res.status(400).json({ error: 'No tournament code for this match' });

    const { data: tournament } = await supabaseAdmin
      .from('tournaments').select('riot_region').eq('id', req.params.id).single();
    const region = tournament?.riot_region || 'EUW';
    const platform = region === 'EUW' ? 'euw1' : region.toLowerCase();

    const events = await riot.getLobbyEvents(match.riot_tournament_code, platform);

    // Cache in DB
    await supabaseAdmin.from('match_records').update({
      riot_lobby_events: events?.eventList || [],
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.matchId);

    res.json(events || { eventList: [] });
  } catch (err) {
    console.error('[riot-tournament/lobby]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Get full match result from Match-V5 (by tournament code)
// GET /api/riot-tournament/:id/match/:matchId/result
// ============================================================================
router.get('/:id/match/:matchId/result', requireAuth, async (req, res) => {
  try {
    const { data: match } = await supabaseAdmin
      .from('match_records').select('*').eq('id', req.params.matchId).single();
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const { data: tournament } = await supabaseAdmin
      .from('tournaments').select('riot_region,game').eq('id', req.params.id).single();
    const region = tournament?.riot_region || 'EUW';
    const platform = region === 'EUW' ? 'euw1' : region.toLowerCase();

    let matchData = null;

    if (tournament?.game === 'Valorant' && req.query.val_match_id) {
      const valPlatform = match.val_match_id ? 'eu' : (req.query.val_platform || 'eu');
      matchData = await riot.getValMatch(req.query.val_match_id, valPlatform);
      if (matchData) {
        await supabaseAdmin.from('match_records').update({
          val_match_id: req.query.val_match_id,
          val_match_data: matchData,
          updated_at: new Date().toISOString(),
        }).eq('id', req.params.matchId);
      }
    } else if (match.riot_game_id) {
      // Use riot_game_id from callback to build match ID
      const matchId = `${region.toUpperCase()}_${match.riot_game_id}`;
      matchData = await riot.getMatch(matchId, platform);
      if (matchData) {
        await supabaseAdmin.from('match_records').update({
          riot_match_id: matchId,
          riot_match_data: matchData,
          updated_at: new Date().toISOString(),
        }).eq('id', req.params.matchId);
      }
    }

    res.json(matchData || { error: 'No match data available yet' });
  } catch (err) {
    console.error('[riot-tournament/result]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Riot webhook callback (game completion)
// POST /api/riot-tournament/callback
// ============================================================================
router.post('/callback', async (req, res) => {
  try {
    // Riot sends: { startTime, shortCode, metaData, gameId, gameName, gameType, gameMap, gameMode, region, winners }
    const payload = req.body;
    const { shortCode, gameId, metaData } = payload;
    if (!shortCode) return res.status(400).json({ error: 'Missing shortCode' });

    let matchId = null;
    try {
      const meta = JSON.parse(metaData || '{}');
      matchId = meta.matchId;
    } catch { /* ignore */ }

    const query = matchId
      ? supabaseAdmin.from('match_records').select('*').eq('id', matchId)
      : supabaseAdmin.from('match_records').select('*').eq('riot_tournament_code', shortCode);

    const { data: matches } = await query;
    const match = matches?.[0];

    if (match) {
      const platform = payload.region ? `${payload.region.toLowerCase()}1` : 'euw1';
      let matchData = null;
      try {
        const matchRiotId = `${(payload.region || 'EUW').toUpperCase()}_${gameId}`;
        matchData = await riot.getMatch(matchRiotId, platform);
      } catch { /* best effort */ }

      await supabaseAdmin.from('match_records').update({
        riot_game_id: gameId,
        riot_callback_received: true,
        riot_callback_data: payload,
        ...(matchData ? { riot_match_id: `${(payload.region || 'EUW').toUpperCase()}_${gameId}`, riot_match_data: matchData } : {}),
        updated_at: new Date().toISOString(),
      }).eq('id', match.id);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[riot-tournament/callback]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Live spectator data for a player
// GET /api/riot-tournament/spectate/:puuid/:platform
// ============================================================================
router.get('/spectate/:puuid/:platform', requireAuth, async (req, res) => {
  try {
    const data = await riot.getSpectatorGame(req.params.puuid, req.params.platform);
    if (!data) return res.status(404).json({ error: 'Player is not in an active game' });
    res.json(data);
  } catch (err) {
    console.error('[riot-tournament/spectate]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// Valorant content (maps, agents, acts) — for map pool selection
// GET /api/riot-tournament/val-content/:valPlatform
// ============================================================================
router.get('/val-content/:valPlatform', async (req, res) => {
  try {
    const data = await riot.getValContent(req.params.valPlatform, req.query.locale || null);
    if (!data) return res.status(404).json({ error: 'Content not found' });
    // Return only the fields needed for UI
    res.json({
      acts: data.acts || [],
      maps: (data.maps || []).map(m => ({ id: m.id, assetName: m.assetName, localizedNames: m.localizedNames })),
      agents: (data.characters || []).map(c => ({ id: c.id, assetName: c.assetName, localizedNames: c.localizedNames })),
    });
  } catch (err) {
    console.error('[riot-tournament/val-content]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// LoL champion rotation (for displaying in profile/arena)
// GET /api/riot-tournament/champion-rotation/:platform
// ============================================================================
router.get('/champion-rotation/:platform', async (req, res) => {
  try {
    const data = await riot.getChampionRotation(req.params.platform);
    res.json(data || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
