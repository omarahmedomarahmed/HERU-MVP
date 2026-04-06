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
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
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
    let { data, error } = await supabaseAdmin.from('gamer_profiles').select('*').eq('id', req.params.id).single();
    if (!data) {
      ({ data, error } = await supabaseAdmin.from('gamer_profiles').select('*').eq('user_id', req.params.id).single());
    }
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Profile not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /me - update own profile
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('gamer_profiles').update({ ...req.body, updated_at: new Date().toISOString() }).eq('user_id', req.user.id).select().single();
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

// GET /:id/stats - get gamer stats
router.get('/:id/stats', async (req, res) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('gamer_profiles')
      .select('total_matches, total_wins, tournaments_played, tournaments_won, team_ids, username, avatar')
      .or(`id.eq.${req.params.id},user_id.eq.${req.params.id}`)
      .single();
    if (!profile) return res.status(404).json({ error: 'Gamer not found' });

    const winRate = profile.total_matches > 0 ? ((profile.total_wins / profile.total_matches) * 100).toFixed(1) : 0;

    res.json({
      ...profile,
      win_rate: Number(winRate),
      teams_count: (profile.team_ids || []).length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/achievements - get gamer's earned achievements
router.get('/:id/achievements', async (req, res) => {
  try {
    // Resolve to user_id
    let userId = req.params.id;
    const { data: profile } = await supabaseAdmin
      .from('gamer_profiles')
      .select('user_id')
      .or(`id.eq.${req.params.id},user_id.eq.${req.params.id}`)
      .single();
    if (profile) userId = profile.user_id;

    const { data, error } = await supabaseAdmin
      .from('gamer_achievements')
      .select('*, achievements(*)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
