import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireStaff } from '../middleware/staffGuard.js';

const router = Router();

// GET / - list active items
router.get('/', async (req, res) => {
  try {
    const { category, type, limit = 100 } = req.query;
    let query = supabaseAdmin.from('marketplace_items').select('*').eq('is_active', true);
    if (category) query = query.eq('category', category);
    if (type) query = query.eq('type', type);
    query = query.order('category').limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('marketplace_items').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Item not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create (staff only)
router.post('/', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('marketplace_items').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update (staff only)
router.put('/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('marketplace_items').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - soft delete (staff only)
router.delete('/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('marketplace_items').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
