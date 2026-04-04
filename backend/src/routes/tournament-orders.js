import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireStaff } from '../middleware/staffGuard.js';

const router = Router();

// GET / - list tournament orders
router.get('/', requireAuth, async (req, res) => {
  try {
    const { fulfillment_status, limit = 50 } = req.query;
    let query = supabaseAdmin.from('tournament_orders').select('*');
    // Staff sees all, organizer sees own
    const staffToken = req.headers['x-staff-token'];
    if (!staffToken) {
      query = query.eq('main_organizer_id', req.user.id);
    }
    if (fulfillment_status) query = query.eq('fulfillment_status', fulfillment_status);
    query = query.order('created_at', { ascending: false }).limit(limit);
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
    const { data, error } = await supabaseAdmin.from('tournament_orders').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Tournament order not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update (staff for fulfillment)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('tournament_orders').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/chat - internal chat
router.post('/:id/chat', requireAuth, async (req, res) => {
  try {
    const { data: order } = await supabaseAdmin.from('tournament_orders').select('internal_chat').eq('id', req.params.id).single();
    const chat = [...(order.internal_chat || []), { ...req.body, user_id: req.user.id, timestamp: new Date().toISOString() }];
    const { data, error } = await supabaseAdmin.from('tournament_orders').update({ internal_chat: chat }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
