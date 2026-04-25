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

// GET /api/friends/search — search users by name, gamer tag, or Riot account
router.get('/search', requireAuth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ users: [] });

    const userMap = new Map();

    // 1. Search user_profiles by full_name
    const { data: byName } = await supabaseAdmin
      .from('user_profiles')
      .select('id, full_name, avatar_url, role')
      .ilike('full_name', `%${q}%`)
      .neq('id', req.user.id)
      .in('role', ['gamer'])
      .limit(10);
    (byName || []).forEach(u => userMap.set(u.id, { ...u, match_source: 'name' }));

    // 2. Search gamer_profiles by username
    const { data: byUsername } = await supabaseAdmin
      .from('gamer_profiles')
      .select('user_id, username, avatar')
      .ilike('username', `%${q}%`)
      .neq('user_id', req.user.id)
      .limit(10);
    if (byUsername?.length) {
      const gpUserIds = byUsername.map(g => g.user_id);
      const { data: gpProfiles } = await supabaseAdmin
        .from('user_profiles')
        .select('id, full_name, avatar_url, role')
        .in('id', gpUserIds)
        .in('role', ['gamer']);
      (gpProfiles || []).forEach(u => {
        const gp = byUsername.find(g => g.user_id === u.id);
        userMap.set(u.id, { ...u, username: gp?.username, avatar_url: gp?.avatar || u.avatar_url, match_source: 'gamer_tag' });
      });
    }

    // 3. Search connected_accounts by Riot game_name (supports "Name#TAG" pattern)
    const riotQuery = q.includes('#') ? q.split('#')[0] : q;
    const { data: byRiot } = await supabaseAdmin
      .from('connected_accounts')
      .select('user_id, game_name, tag_line, rank_tier, game_key')
      .ilike('game_name', `%${riotQuery}%`)
      .neq('user_id', req.user.id)
      .limit(10);
    if (byRiot?.length) {
      const riotUserIds = [...new Set(byRiot.map(r => r.user_id))];
      const { data: riotProfiles } = await supabaseAdmin
        .from('user_profiles')
        .select('id, full_name, avatar_url, role')
        .in('id', riotUserIds)
        .in('role', ['gamer']);
      (riotProfiles || []).forEach(u => {
        if (!userMap.has(u.id)) {
          const acc = byRiot.find(r => r.user_id === u.id);
          userMap.set(u.id, {
            ...u,
            riot_id: acc ? `${acc.game_name}#${acc.tag_line}` : null,
            riot_rank: acc?.rank_tier || null,
            match_source: 'riot_account',
          });
        }
      });
    }

    res.json({ users: [...userMap.values()] });
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
