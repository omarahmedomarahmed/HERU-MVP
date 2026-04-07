import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET / - list gamer profiles
router.get('/', async (req, res) => {
  try {
    const { is_talent, talent_type, user_id, username_slug, limit = 50, offset = 0 } = req.query;
    let query = supabaseAdmin.from('gamer_profiles').select('*');
    if (is_talent) query = query.eq('is_talent', is_talent === 'true');
    if (talent_type) query = query.eq('talent_type', talent_type);
    if (user_id) query = query.eq('user_id', user_id);
    if (username_slug) query = query.eq('username_slug', username_slug);
    query = query.order('created_at', { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create gamer profile
router.post('/', requireAuth, async (req, res) => {
  try {
    const payload = { ...req.body, user_id: req.user.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const { data, error } = await supabaseAdmin.from('gamer_profiles').insert(payload).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /me - update own profile
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('gamer_profiles')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('user_id', req.user.id)
      .select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /talent-application - apply to become talent
router.post('/talent-application', requireAuth, async (req, res) => {
  try {
    const { data: profile } = await supabaseAdmin.from('gamer_profiles').select('*').eq('user_id', req.user.id).single();
    const { data, error } = await supabaseAdmin.from('approval_requests').insert({
      approval_type: 'talent_application',
      requester_id: req.user.id,
      requester_name: profile?.username || '',
      requester_email: req.user.email,
      reference_id: profile?.id || req.user.id,
      reference_name: profile?.username || '',
      details: { talent_type: req.body.talent_type, talent_price: req.body.talent_price, talent_video_link: req.body.talent_video_link },
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NOTE: specific sub-routes MUST come before /:id to avoid being shadowed

// GET /:id/stats - get gamer stats
router.get('/:id/stats', async (req, res) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('gamer_profiles')
      .select('team_ids, username, avatar, games, is_talent, talent_type, talent_rating')
      .or(`id.eq.${req.params.id},user_id.eq.${req.params.id}`)
      .single();
    if (!profile) return res.status(404).json({ error: 'Gamer not found' });
    res.json({
      ...profile,
      teams_count: (profile.team_ids || []).length,
      games_count: (profile.games || []).length,
      win_rate: 0,
      tournaments_played: 0,
      tournaments_won: 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/achievements - get gamer's earned achievements
router.get('/:id/achievements', async (req, res) => {
  try {
    // Return empty array gracefully if achievements tables don't exist yet
    const { data: profile } = await supabaseAdmin
      .from('gamer_profiles')
      .select('user_id')
      .or(`id.eq.${req.params.id},user_id.eq.${req.params.id}`)
      .single();
    if (!profile) return res.json([]);

    const { data, error } = await supabaseAdmin
      .from('gamer_achievements')
      .select('*, achievements(*)')
      .eq('user_id', profile.user_id)
      .order('earned_at', { ascending: false });

    // Table may not exist yet — return empty rather than 500
    if (error) return res.json([]);
    res.json(data || []);
  } catch (err) {
    res.json([]);
  }
});

// GET /:id - get by id or user_id (MUST be last)
router.get('/:id', async (req, res) => {
  try {
    let { data, error } = await supabaseAdmin.from('gamer_profiles').select('*').eq('id', req.params.id).single();
    if (!data) {
      ({ data, error } = await supabaseAdmin.from('gamer_profiles').select('*').eq('user_id', req.params.id).single());
    }
    if (!data) return res.status(404).json({ error: 'Profile not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
