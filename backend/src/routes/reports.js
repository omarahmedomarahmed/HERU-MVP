// reviewed 2026-04-25
import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleGuard.js';

const router = Router();

// POST /api/reports — submit a user report
router.post('/', requireAuth, async (req, res) => {
  try {
    const { reported_user_id, reason, details } = req.body;
    if (!reported_user_id || !reason) return res.status(400).json({ error: 'reported_user_id and reason required' });
    const { data, error } = await supabaseAdmin
      .from('user_reports')
      .insert({ reporter_id: req.user.id, reported_user_id, reason, details, status: 'pending' })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports — staff views all reports (with optional status filter)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabaseAdmin
      .from('user_reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/reports/:id — staff updates report status
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, resolution_notes } = req.body;
    const { data, error } = await supabaseAdmin
      .from('user_reports')
      .update({ status, resolution_notes, resolved_by: req.user.id, resolved_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
