import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireStaff } from '../middleware/staffGuard.js';

const router = Router();

// GET / - list all approvals (staff)
router.get('/', requireAuth, requireStaff, async (req, res) => {
  try {
    const { status, approval_type, limit = 50 } = req.query;
    let query = supabaseAdmin.from('approval_requests').select('*');
    if (status) query = query.eq('status', status);
    if (approval_type) query = query.eq('approval_type', approval_type);
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
