// reviewed 2026-04-25
import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/friends — list accepted friends
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('friendships')
      .select('id, user_id, friend_id, status, created_at')
      .or(`user_id.eq.${req.user.id},friend_id.eq.${req.user.id}`)
      .eq('status', 'accepted');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/friends/requests — incoming pending requests
router.get('/requests', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('friendships')
      .select('id, user_id, friend_id, status, created_at')
      .eq('friend_id', req.user.id)
      .eq('status', 'pending');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/friends/request — send friend request
router.post('/request', requireAuth, async (req, res) => {
  try {
    const { friend_id } = req.body;
    if (!friend_id) return res.status(400).json({ error: 'friend_id required' });
    if (friend_id === req.user.id) return res.status(400).json({ error: 'Cannot friend yourself' });
    const { data, error } = await supabaseAdmin
      .from('friendships')
      .insert({ user_id: req.user.id, friend_id, status: 'pending' })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/friends/:id/accept
router.put('/:id/accept', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', req.params.id)
      .eq('friend_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/friends/:id/block
router.put('/:id/block', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('friendships')
      .update({ status: 'blocked' })
      .eq('id', req.params.id)
      .or(`user_id.eq.${req.user.id},friend_id.eq.${req.user.id}`)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/friends/:id — remove friend
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('friendships')
      .delete()
      .eq('id', req.params.id)
      .or(`user_id.eq.${req.user.id},friend_id.eq.${req.user.id}`);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
