// reviewed 2026-04-25
import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/leaderboards — public leaderboard (filter by game, region, season)
router.get('/', async (req, res) => {
  try {
    const { game, region, season, limit = 50, offset = 0 } = req.query;
    let query = supabaseAdmin
      .from('leaderboard_entries')
      .select('id, user_id, game, region, season, score, wins, losses, rank_position, updated_at')
      .order('score', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    if (game) query = query.eq('game', game);
    if (region) query = query.eq('region', region);
    if (season) query = query.eq('season', season);
    const { data, error } = await query;
    if (error) {
      console.error('[leaderboards GET /]', error);
      throw error;
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leaderboards/me — authenticated user's own rank entries
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('leaderboard_entries')
      .select('*')
      .eq('user_id', req.user.id)
      .order('score', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
