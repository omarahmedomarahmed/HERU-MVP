const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleGuard');

// POST /api/reports — submit a user report
router.post('/', requireAuth, async (req, res) => {
  try {
    const { reported_user_id, reason, details } = req.body;
    if (!reported_user_id || !reason) return res.status(400).json({ error: 'reported_user_id and reason required' });
    const { data, error } = await supabase
      .from('user_reports')
      .insert({ reporter_id: req.user.id, reported_user_id, reason, details })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports — staff views all reports
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase
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
    const { status, staff_notes } = req.body;
    const { data, error } = await supabase
      .from('user_reports')
      .update({ status, staff_notes, reviewed_by: req.user.id, reviewed_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
