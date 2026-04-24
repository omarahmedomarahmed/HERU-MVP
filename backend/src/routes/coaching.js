const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

// GET /api/coaching — browse coaches (public)
router.get('/', async (req, res) => {
  try {
    const { game, min_price, max_price, limit = 20, offset = 0 } = req.query;
    let query = supabase
      .from('service_provider_profiles')
      .select(`
        id, user_id, display_name, bio, avatar, rating, provider_type,
        coach_games, coach_rank, coach_availability
      `)
      .eq('provider_type', 'coach')
      .eq('is_approved', true)
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (game) query = query.contains('coach_games', [game]);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/coaching/:id — get one coach profile (public)
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('service_provider_profiles')
      .select('*')
      .eq('user_id', req.params.id)
      .eq('provider_type', 'coach')
      .single();
    if (error) return res.status(404).json({ error: 'Coach not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/coaching/sessions/mine — get my coaching sessions (auth required)
router.get('/sessions/mine', requireAuth, async (req, res) => {
  try {
    const { role, id } = req.user;
    let query = supabase
      .from('coaching_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    if (role === 'service_provider') {
      query = query.eq('coach_id', id);
    } else {
      query = query.eq('gamer_id', id);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/coaching/sessions — gamer books a coaching session
router.post('/sessions', requireAuth, async (req, res) => {
  try {
    const { coach_id, service_id, session_type, game, duration_minutes, scheduled_at, notes, price } = req.body;
    if (!coach_id || !price) return res.status(400).json({ error: 'coach_id and price required' });
    const { data, error } = await supabase
      .from('coaching_sessions')
      .insert({
        coach_id,
        gamer_id: req.user.id,
        service_id,
        session_type: session_type || 'live_session',
        game,
        duration_minutes: duration_minutes || 60,
        scheduled_at,
        notes,
        price,
        status: 'pending',
        payment_status: 'unpaid',
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/coaching/sessions/:id/confirm — coach confirms session
router.put('/sessions/:id/confirm', requireAuth, async (req, res) => {
  try {
    const { data: session } = await supabase
      .from('coaching_sessions')
      .select('coach_id')
      .eq('id', req.params.id)
      .single();
    if (!session || session.coach_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { data, error } = await supabase
      .from('coaching_sessions')
      .update({ status: 'confirmed', updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/coaching/sessions/:id/complete — coach or gamer marks complete
router.put('/sessions/:id/complete', requireAuth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const { data: session } = await supabase
      .from('coaching_sessions')
      .select('coach_id, gamer_id')
      .eq('id', req.params.id)
      .single();
    if (!session || (session.coach_id !== req.user.id && session.gamer_id !== req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const update = { status: 'completed', updated_at: new Date() };
    if (req.user.id === session.gamer_id && rating) {
      update.gamer_rating = rating;
      update.gamer_review = review;
    }
    const { data, error } = await supabase
      .from('coaching_sessions')
      .update(update)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
