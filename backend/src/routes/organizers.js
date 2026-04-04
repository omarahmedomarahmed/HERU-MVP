import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET / - list organizer profiles
router.get('/', async (req, res) => {
  try {
    const { is_verified, limit = 50, offset = 0 } = req.query;
    let query = supabaseAdmin.from('organizer_profiles').select('*');
    if (is_verified) query = query.eq('is_verified', is_verified === 'true');
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

export default router;
