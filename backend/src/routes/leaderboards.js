const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

// GET /api/leaderboards — public leaderboard list
router.get('/', async (req, res) => {
  try {
    const { game, region = 'MENA', season = '2026-S1', limit = 50 } = req.query;
    let query = supabase
      .from('leaderboard_entries')
      .select('*, gamer:gamer_id(id)')
      .eq('region', region)
      .eq('season', season)
      .order('score', { ascending: false })
      .limit(Number(limit));
    if (game) query = query.eq('game', game);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leaderboards/me — get my rank (auth required)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { game, season = '2026-S1' } = req.query;
    let query = supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('gamer_id', req.user.id)
      .eq('season', season);
    if (game) query = query.eq('game', game);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
