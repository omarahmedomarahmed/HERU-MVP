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

// GET /api/friends/search — search users to add as friends
router.get('/search', requireAuth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ users: [] });
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, full_name, avatar_url, role')
      .ilike('full_name', `%${q}%`)
      .neq('id', req.user.id)
      .in('role', ['gamer'])
      .limit(10);
    if (error) throw error;
    res.json({ users: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/friends/request — send friend request
router.post('/request', requireAuth, async (req, res) => {
  try {
    const friend_id = req.body.friend_id || req.body.addressee_id;
    if (!friend_id) return res.status(400).json({ error: 'friend_id required' });
    if (friend_id === req.user.id) return res.status(400).json({ error: 'Cannot friend yourself' });

    // Check if friendship already exists
    const { data: existing } = await supabaseAdmin
      .from('friendships')
      .select('id, status')
      .or(`and(user_id.eq.${req.user.id},friend_id.eq.${friend_id}),and(user_id.eq.${friend_id},friend_id.eq.${req.user.id})`)
      .maybeSingle();
    if (existing) return res.status(409).json({ error: existing.status === 'accepted' ? 'Already friends' : 'Request already sent' });
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
