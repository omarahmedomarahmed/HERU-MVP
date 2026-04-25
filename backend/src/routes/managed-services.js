// reviewed 2026-04-25
import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireSponsor, requireAdmin } from '../middleware/roleGuard.js';

const router = Router();

// GET /api/managed-services — sponsor sees own; staff sees all
router.get('/', requireAuth, async (req, res) => {
  try {
    let query = supabaseAdmin
      .from('managed_service_projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (req.user.role !== 'admin') {
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
    const { data, error } = await supabaseAdmin
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

// POST /api/managed-services — sponsor creates project request
router.post('/', requireAuth, requireSponsor, async (req, res) => {
  try {
    const { title, description, budget } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const { data, error } = await supabaseAdmin
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
    const { consultant_id } = req.body;
    const { data, error } = await supabaseAdmin
      .from('managed_service_projects')
      .update({ consultant_id, status: 'reviewing', updated_at: new Date().toISOString() })
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
    const { data, error } = await supabaseAdmin
      .from('managed_service_projects')
      .update({ proposal_text, proposal_amount, deliverables, status: 'proposal_sent', updated_at: new Date().toISOString() })
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
    const { data: proj, error: fetchErr } = await supabaseAdmin
      .from('managed_service_projects')
      .select('sponsor_id, status')
      .eq('id', req.params.id)
      .single();
    if (fetchErr) return res.status(404).json({ error: 'Not found' });
    if (proj.sponsor_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (proj.status !== 'proposal_sent') return res.status(400).json({ error: 'No proposal to approve' });
    const { data, error } = await supabaseAdmin
      .from('managed_service_projects')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
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
    const { data, error } = await supabaseAdmin
      .from('managed_service_projects')
      .update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/managed-services/:id/chat — send chat message
router.post('/:id/chat', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'message required' });
    const { data: proj, error: fetchErr } = await supabaseAdmin
      .from('managed_service_projects')
      .select('sponsor_id, chat')
      .eq('id', req.params.id)
      .single();
    if (fetchErr) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && proj.sponsor_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const newMsg = {
      sender_id: req.user.id,
      sender_role: req.user.role,
      message: message.trim(),
      sent_at: new Date().toISOString(),
    };
    const chat = [...(proj.chat || []), newMsg];
    const { data, error } = await supabaseAdmin
      .from('managed_service_projects')
      .update({ chat, updated_at: new Date().toISOString() })
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
