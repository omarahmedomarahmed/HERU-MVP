import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireStaff } from '../middleware/staffGuard.js';

const router = Router();

// POST / - create approval request (any authenticated user)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { approval_type, reference_id, reference_name, details, status = 'pending' } = req.body;
    if (!approval_type || !reference_id) {
      return res.status(400).json({ error: 'approval_type and reference_id are required' });
    }

    // Prevent duplicate pending requests of same type from same user
    const { data: existing } = await supabaseAdmin.from('approval_requests')
      .select('id')
      .eq('requester_id', req.user.id)
      .eq('approval_type', approval_type)
      .eq('status', 'pending')
      .limit(1);
    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'You already have a pending request of this type' });
    }

    const { data, error } = await supabaseAdmin.from('approval_requests').insert({
      approval_type,
      requester_id: req.user.id,
      requester_name: req.body.requester_name || '',
      requester_email: req.body.requester_email || '',
      reference_id,
      reference_name: reference_name || '',
      details: details || {},
      status,
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET / - list approvals (staff gets all, regular users get their own)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, approval_type, requester_id, limit = 50 } = req.query;
    let query = supabaseAdmin.from('approval_requests').select('*');

    // Non-staff users can only see their own requests
    const staffToken = req.headers['x-staff-token'];
    if (!staffToken) {
      query = query.eq('requester_id', requester_id || req.user.id);
    }

    if (status) query = query.eq('status', status);
    if (approval_type) query = query.eq('approval_type', approval_type);
    if (requester_id && staffToken) query = query.eq('requester_id', requester_id);
    query = query.order('created_at', { ascending: false }).limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id
router.get('/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('approval_requests').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Approval not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/approve
router.put('/:id/approve', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data: approval } = await supabaseAdmin.from('approval_requests').select('*').eq('id', req.params.id).single();
    if (!approval) return res.status(404).json({ error: 'Approval not found' });

    const { data, error } = await supabaseAdmin.from('approval_requests').update({
      status: 'approved',
      reviewed_by: req.user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id).select().single();
    if (error) throw error;

    // Handle approval side effects
    if (approval.approval_type === 'talent_application') {
      await supabaseAdmin.from('gamer_profiles').update({
        is_talent: true,
        talent_type: approval.details?.talent_type,
        talent_price: approval.details?.talent_price,
        talent_video_link: approval.details?.talent_video_link,
        updated_at: new Date().toISOString(),
      }).eq('user_id', approval.requester_id);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/reject
router.put('/:id/reject', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('approval_requests').update({
      status: 'rejected',
      reviewed_by: req.user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: req.body.reason || '',
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
