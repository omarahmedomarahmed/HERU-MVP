import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET / - list deliverables (filter by gig_request_id, tournament_id, assigned_to)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { gig_request_id, tournament_id, assigned_to, status, limit = 50, offset = 0 } = req.query;
    let query = supabaseAdmin.from('deliverables').select('*');
    if (gig_request_id) query = query.eq('gig_request_id', gig_request_id);
    if (tournament_id) query = query.eq('tournament_id', tournament_id);
    if (assigned_to) query = query.eq('assigned_to', assigned_to);
    if (status) query = query.eq('status', status);
    query = query.order('created_at', { ascending: false }).range(offset, Number(offset) + Number(limit) - 1);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('deliverables').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Deliverable not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create deliverable
router.post('/', requireAuth, async (req, res) => {
  try {
    const { gig_request_id, tournament_id, title, description, assigned_to, due_date } = req.body;
    if (!gig_request_id || !tournament_id || !title || !assigned_to) {
      return res.status(400).json({ error: 'gig_request_id, tournament_id, title, and assigned_to are required' });
    }
    const { data, error } = await supabaseAdmin.from('deliverables').insert({
      gig_request_id, tournament_id, title, description, assigned_to, due_date, status: 'pending',
    }).select().single();
    if (error) throw error;

    // Update deliverables_count on gig_request
    const { count } = await supabaseAdmin
      .from('deliverables')
      .select('id', { count: 'exact', head: true })
      .eq('gig_request_id', gig_request_id);
    await supabaseAdmin.from('gig_requests').update({ deliverables_count: count }).eq('id', gig_request_id);

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update deliverable (status, files, notes)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    if (updates.status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    const { data, error } = await supabaseAdmin.from('deliverables').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;

    // Update gig_request deliverable_status based on all deliverables
    if (data?.gig_request_id) {
      const { data: allDeliverables } = await supabaseAdmin
        .from('deliverables')
        .select('status')
        .eq('gig_request_id', data.gig_request_id);
      const statuses = (allDeliverables || []).map(d => d.status);
      let gigStatus = 'pending';
      if (statuses.every(s => s === 'completed')) gigStatus = 'completed';
      else if (statuses.some(s => s === 'in_progress' || s === 'revision')) gigStatus = 'in_progress';
      else if (statuses.some(s => s === 'on_break')) gigStatus = 'on_break';
      await supabaseAdmin.from('gig_requests').update({ deliverable_status: gigStatus }).eq('id', data.gig_request_id);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin.from('deliverables').select('gig_request_id').eq('id', req.params.id).single();
    const { error } = await supabaseAdmin.from('deliverables').delete().eq('id', req.params.id);
    if (error) throw error;

    // Update count
    if (existing?.gig_request_id) {
      const { count } = await supabaseAdmin
        .from('deliverables')
        .select('id', { count: 'exact', head: true })
        .eq('gig_request_id', existing.gig_request_id);
      await supabaseAdmin.from('gig_requests').update({ deliverables_count: count }).eq('id', existing.gig_request_id);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
