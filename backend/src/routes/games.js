import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET / - list all active games, ordered by sort_order (public)
router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error) {
      // Table may not exist yet — return empty array instead of 500
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return res.json([]);
      }
      throw error;
    }
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create a new game (staff only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const staffToken = req.headers['x-staff-token'];
    if (!staffToken) return res.status(403).json({ error: 'Staff access required' });

    const { name, slug, image, sort_order } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const { data, error } = await supabaseAdmin
      .from('games')
      .insert({ name, slug: slug || null, image: image || null, sort_order: sort_order ?? 0 })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update a game (staff only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const staffToken = req.headers['x-staff-token'];
    if (!staffToken) return res.status(403).json({ error: 'Staff access required' });

    const { name, slug, image, sort_order, is_active } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (image !== undefined) updates.image = image;
    if (sort_order !== undefined) updates.sort_order = sort_order;
    if (is_active !== undefined) updates.is_active = is_active;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data, error } = await supabaseAdmin
      .from('games')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Game not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - deactivate a game (staff only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const staffToken = req.headers['x-staff-token'];
    if (!staffToken) return res.status(403).json({ error: 'Staff access required' });

    const { data, error } = await supabaseAdmin
      .from('games')
      .update({ is_active: false })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Game not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
