import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireStaff } from '../middleware/staffGuard.js';

const router = Router();

// GET / - get all settings
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('app_settings').select('*').order('setting_key');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:key
router.get('/:key', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('app_settings').select('*').eq('setting_key', req.params.key).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Setting not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:key - update (staff only)
router.put('/:key', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('app_settings').update({
      setting_value: req.body.value,
      updated_at: new Date().toISOString(),
    }).eq('setting_key', req.params.key).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
