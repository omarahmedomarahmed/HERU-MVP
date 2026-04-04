import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { requireStaff } from '../middleware/staffGuard.js';

const router = Router();

// GET / - list organizer profiles
router.get('/', async (req, res) => {
  try {
    const { is_verified, verification_status, limit = 50, offset = 0 } = req.query;
    let query = supabaseAdmin.from('organizer_profiles').select('*');
    if (is_verified) query = query.eq('is_verified', is_verified === 'true');
    if (verification_status) query = query.eq('verification_status', verification_status);
    query = query.order('created_at', { ascending: false }).range(offset, Number(offset) + Number(limit) - 1);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get by id or user_id
router.get('/:id', async (req, res) => {
  try {
    let { data, error } = await supabaseAdmin.from('organizer_profiles').select('*').eq('id', req.params.id).single();
    if (!data) {
      ({ data, error } = await supabaseAdmin.from('organizer_profiles').select('*').eq('user_id', req.params.id).single());
    }
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Profile not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/portfolio - public endpoint for organizer portfolio
router.get('/:id/portfolio', async (req, res) => {
  try {
    // Get organizer profile
    let { data: profile } = await supabaseAdmin.from('organizer_profiles').select('*').eq('id', req.params.id).single();
    if (!profile) {
      ({ data: profile } = await supabaseAdmin.from('organizer_profiles').select('*').eq('user_id', req.params.id).single());
    }
    if (!profile) return res.status(404).json({ error: 'Organizer not found' });

    // Get completed tournaments
    const { data: tournaments } = await supabaseAdmin
      .from('tournaments')
      .select('id, name, game, tournament_image, status, format, max_teams, teams, schedule, total_cost, prizepool_total, created_at')
      .eq('organizer_id', profile.user_id)
      .in('status', ['completed', 'live', 'published'])
      .order('created_at', { ascending: false });

    // Get published reports
    const { data: reports } = await supabaseAdmin
      .from('tournament_reports')
      .select('*')
      .eq('organizer_id', profile.user_id)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    res.json({ profile, tournaments: tournaments || [], reports: reports || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /me - update own profile
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('organizer_profiles').update({ ...req.body, updated_at: new Date().toISOString() }).eq('user_id', req.user.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/verify - staff-only: update verification status
router.put('/:id/verify', requireAuth, requireStaff, async (req, res) => {
  try {
    const { verification_status } = req.body;
    if (!['unverified', 'pending', 'verified'].includes(verification_status)) {
      return res.status(400).json({ error: 'Invalid verification status' });
    }
    const { data, error } = await supabaseAdmin
      .from('organizer_profiles')
      .update({ verification_status, is_verified: verification_status === 'verified', updated_at: new Date().toISOString() })
      .eq('user_id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Organizer not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
