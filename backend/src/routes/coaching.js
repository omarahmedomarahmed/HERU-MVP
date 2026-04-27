// reviewed 2026-04-25
import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/coaching — browse coaches (public)
router.get('/', async (req, res) => {
  try {
    const { game, limit = 20, offset = 0 } = req.query;
    let query = supabaseAdmin
      .from('service_provider_profiles')
      .select('id, user_id, display_name, bio, avatar, rating, review_count, provider_type, coach_games, coach_rank, coach_availability, hourly_rate')
      .eq('provider_type', 'coach')
      .eq('approval_status', 'approved')
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    if (game) query = query.contains('coach_games', [game]);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/coaching/:id — single coach profile (public)
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
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

// GET /api/coaching/sessions/mine — my coaching sessions (auth required)
router.get('/sessions/mine', requireAuth, async (req, res) => {
  try {
    const { role, id } = req.user;
    let query = supabaseAdmin
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

// POST /api/coaching/sessions — gamer books a session
router.post('/sessions', requireAuth, async (req, res) => {
  try {
    const { coach_id, scheduled_at, duration_hours, notes } = req.body;
    if (!coach_id || !scheduled_at) return res.status(400).json({ error: 'coach_id and scheduled_at required' });
    const { data: coach } = await supabaseAdmin
      .from('service_provider_profiles')
      .select('hourly_rate')
      .eq('user_id', coach_id)
      .single();
    const price = coach?.hourly_rate ? coach.hourly_rate * (duration_hours || 1) : 0;
    const { data, error } = await supabaseAdmin
      .from('coaching_sessions')
      .insert({ gamer_id: req.user.id, coach_id, scheduled_at, duration_hours: duration_hours || 1, notes, price, status: 'pending' })
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
    const { data, error } = await supabaseAdmin
      .from('coaching_sessions')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('coach_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/coaching/sessions/:id/complete — mark complete + optional rating
router.put('/sessions/:id/complete', requireAuth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const updates = { status: 'completed', updated_at: new Date().toISOString() };
    if (rating) { updates.rating = rating; updates.review = review; }
    const { data, error } = await supabaseAdmin
      .from('coaching_sessions')
      .update(updates)
      .eq('id', req.params.id)
      .eq('gamer_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
