import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET / - list gamer profiles
router.get('/', async (req, res) => {
  try {
    const { is_talent, talent_type, limit = 50, offset = 0 } = req.query;
    let query = supabaseAdmin.from('gamer_profiles').select('*');
    if (is_talent) query = query.eq('is_talent', is_talent === 'true');
    if (talent_type) query = query.eq('talent_type', talent_type);
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

export default router;
