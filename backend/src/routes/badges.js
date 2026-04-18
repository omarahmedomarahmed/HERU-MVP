import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireStaff } from '../middleware/staffGuard.js';

const router = Router();

// GET /api/badges — all active badge definitions (public)
router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('badge_definitions')
      .select('*')
      .eq('is_active', true)
      .order('created_at');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/badges/user/:userId — all badges for a gamer (public)
router.get('/user/:userId', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('gamer_badges')
      .select('*, badge:badge_definitions(*)')
      .eq('gamer_user_id', req.params.userId)
      .order('awarded_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/badges — staff creates/edits a premade badge
router.post('/', requireStaff, async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const { data, error } = await supabaseAdmin
      .from('badge_definitions')
      .insert({ name, description, icon, color, badge_type: 'staff_premade', created_by: req.staffUser?.id })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/badges/:id — staff updates a badge definition
router.put('/:id', requireStaff, async (req, res) => {
  try {
    const { name, description, icon, color, is_active } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (icon !== undefined) updates.icon = icon;
    if (color !== undefined) updates.color = color;
    if (is_active !== undefined) updates.is_active = is_active;
    const { data, error } = await supabaseAdmin
      .from('badge_definitions')
      .update(updates)
      .eq('id', req.params.id)
      .select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/badges/award — staff awards badge to a gamer
router.post('/award', requireStaff, async (req, res) => {
  try {
    const { gamer_user_id, badge_id } = req.body;
    if (!gamer_user_id || !badge_id) return res.status(400).json({ error: 'gamer_user_id and badge_id are required' });
    const { data, error } = await supabaseAdmin
      .from('gamer_badges')
      .upsert({ gamer_user_id, badge_id, awarded_by: req.staffUser?.id, awarded_by_type: 'staff' }, { onConflict: 'gamer_user_id,badge_id' })
      .select('*, badge:badge_definitions(*)').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/badges/award/:gamerUserId/:badgeId — staff revokes badge
router.delete('/award/:gamerUserId/:badgeId', requireStaff, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('gamer_badges')
      .delete()
      .eq('gamer_user_id', req.params.gamerUserId)
      .eq('badge_id', req.params.badgeId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Organizer-created custom badges ─────────────────────────────────────────

// POST /api/badges/organizer — organizer creates custom badge
router.post('/organizer', requireAuth, async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const { data, error } = await supabaseAdmin
      .from('badge_definitions')
      .insert({ name, description, icon, color: color || '#ff1a1a', badge_type: 'organizer_custom', organizer_id: req.user.id, created_by: req.user.id })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/badges/organizer/mine — organizer's own custom badges
router.get('/organizer/mine', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('badge_definitions')
      .select('*')
      .eq('organizer_id', req.user.id)
      .eq('badge_type', 'organizer_custom')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/badges/organizer/award-tournament — award a badge to all gamers in a tournament
router.post('/organizer/award-tournament', requireAuth, async (req, res) => {
  try {
    const { badge_id, tournament_id } = req.body;
    if (!badge_id || !tournament_id) return res.status(400).json({ error: 'badge_id and tournament_id are required' });

    // Verify badge belongs to this organizer
    const { data: badge, error: badgeErr } = await supabaseAdmin
      .from('badge_definitions')
      .select('id,organizer_id')
      .eq('id', badge_id)
      .single();
    if (badgeErr || !badge) return res.status(404).json({ error: 'Badge not found' });
    if (badge.organizer_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    // Get all gamer user_ids from tournament teams
    const { data: tournament } = await supabaseAdmin
      .from('tournaments')
      .select('teams')
      .eq('id', tournament_id)
      .single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    const teamIds = tournament.teams || [];
    if (!teamIds.length) return res.json({ awarded: 0 });

    const { data: teams } = await supabaseAdmin
      .from('teams')
      .select('members')
      .in('id', teamIds);

    const userIds = [...new Set((teams || []).flatMap(t => t.members || []))];
    if (!userIds.length) return res.json({ awarded: 0 });

    // Upsert badges for all members
    const rows = userIds.map(uid => ({
      gamer_user_id: uid,
      badge_id,
      awarded_by: req.user.id,
      awarded_by_type: 'organizer',
      tournament_id,
    }));
    const { error: insertErr } = await supabaseAdmin
      .from('gamer_badges')
      .upsert(rows, { onConflict: 'gamer_user_id,badge_id' });
    if (insertErr) throw insertErr;

    res.json({ awarded: userIds.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
