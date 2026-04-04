import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET / - list own gig requests
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    let query = supabaseAdmin.from('gig_requests').select('*')
      .or(`talent_user_id.eq.${req.user.id},organizer_id.eq.${req.user.id}`);
    if (status) query = query.eq('status', status);
    query = query.order('created_at', { ascending: false }).limit(limit);
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
    const { data, error } = await supabaseAdmin.from('gig_requests').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Gig not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create gig request
router.post('/', requireAuth, async (req, res) => {
  try {
    const gig = { ...req.body, organizer_id: req.user.id, status: 'pending' };
    const { data, error } = await supabaseAdmin.from('gig_requests').insert(gig).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update (accept/reject/complete)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('gig_requests').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/chat
router.post('/:id/chat', requireAuth, async (req, res) => {
  try {
    const { data: gig } = await supabaseAdmin.from('gig_requests').select('chat').eq('id', req.params.id).single();
    const chat = [...(gig.chat || []), { ...req.body, user_id: req.user.id, timestamp: new Date().toISOString() }];
    const { data, error } = await supabaseAdmin.from('gig_requests').update({ chat }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/files - add to file library
router.post('/:id/files', requireAuth, async (req, res) => {
  try {
    const { data: gig } = await supabaseAdmin.from('gig_requests').select('file_library').eq('id', req.params.id).single();
    const files = [...(gig.file_library || []), { ...req.body, uploaded_by: req.user.id, uploaded_at: new Date().toISOString() }];
    const { data, error } = await supabaseAdmin.from('gig_requests').update({ file_library: files }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
