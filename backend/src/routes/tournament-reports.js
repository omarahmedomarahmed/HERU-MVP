import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// GET / - list reports (filter by organizer_id, tournament_id)
router.get('/', async (req, res) => {
  try {
    const { organizer_id, tournament_id, is_published, limit = 50, offset = 0 } = req.query;
    let query = supabaseAdmin.from('tournament_reports').select('*');
    if (organizer_id) query = query.eq('organizer_id', organizer_id);
    if (tournament_id) query = query.eq('tournament_id', tournament_id);
    if (is_published !== undefined) query = query.eq('is_published', is_published === 'true');
    query = query.order('created_at', { ascending: false }).range(offset, Number(offset) + Number(limit) - 1);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get single report
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('tournament_reports')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Report not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create report
router.post('/', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('tournament_reports')
      .insert({ ...req.body, organizer_id: req.user.id })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update report
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('tournament_reports')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('organizer_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete report
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('tournament_reports')
      .delete()
      .eq('id', req.params.id)
      .eq('organizer_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
