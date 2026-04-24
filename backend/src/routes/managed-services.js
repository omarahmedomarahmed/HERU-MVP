const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const { requireSponsor, requireAdmin } = require('../middleware/roleGuard');

// GET /api/managed-services — sponsor sees own projects; staff sees all
router.get('/', requireAuth, async (req, res) => {
  try {
    const { role } = req.user;
    let query = supabase.from('managed_service_projects').select('*').order('created_at', { ascending: false });
    if (role !== 'admin') {
      query = query.eq('sponsor_id', req.user.id);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/managed-services/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('managed_service_projects')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && data.sponsor_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/managed-services — sponsor submits new project request
router.post('/', requireAuth, requireSponsor, async (req, res) => {
  try {
    const { title, description, budget } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const { data, error } = await supabase
      .from('managed_service_projects')
      .insert({ sponsor_id: req.user.id, title, description, budget, status: 'submitted' })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/managed-services/:id/assign — staff assigns consultant
router.put('/:id/assign', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { staff_id } = req.body;
    const { data, error } = await supabase
      .from('managed_service_projects')
      .update({ assigned_staff_id: staff_id, status: 'reviewing', updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/managed-services/:id/proposal — staff sends proposal
router.put('/:id/proposal', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { proposal_text, proposal_amount, deliverables } = req.body;
    const { data, error } = await supabase
      .from('managed_service_projects')
      .update({ proposal_text, proposal_amount, deliverables, status: 'proposal_sent', updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/managed-services/:id/approve — sponsor approves proposal
router.put('/:id/approve', requireAuth, requireSponsor, async (req, res) => {
  try {
    const { data: project } = await supabase
      .from('managed_service_projects')
      .select('sponsor_id')
      .eq('id', req.params.id)
      .single();
    if (!project || project.sponsor_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { data, error } = await supabase
      .from('managed_service_projects')
      .update({ status: 'approved', updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/managed-services/:id/complete — staff marks complete
router.put('/:id/complete', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('managed_service_projects')
      .update({ status: 'completed', updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/managed-services/:id/chat — send a chat message
router.post('/:id/chat', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });
    const { data: project, error: fetchErr } = await supabase
      .from('managed_service_projects')
      .select('chat, sponsor_id')
      .eq('id', req.params.id)
      .single();
    if (fetchErr) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && project.sponsor_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const chat = project.chat || [];
    chat.push({ sender_id: req.user.id, sender_role: req.user.role, message, sent_at: new Date() });
    const { data, error } = await supabase
      .from('managed_service_projects')
      .update({ chat, updated_at: new Date() })
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
