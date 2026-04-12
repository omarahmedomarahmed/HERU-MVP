import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET / - list own orders
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    let query = supabaseAdmin.from('orders').select('*').eq('gamer_id', req.user.id);
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
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('orders').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order not found' });
    if (data.gamer_id !== req.user.id && data.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Valid columns for the orders table
const ORDER_COLUMNS = new Set([
  'gamer_id','organizer_id','order_type','tournament_id','tournament_name',
  'tournament_type','items','total','status','shipping_address','support_chat',
]);

// POST / - create order
router.post('/', requireAuth, async (req, res) => {
  try {
    // Strip unknown fields (e.g. promo_code_used, discount_applied) to avoid DB errors
    const clean = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (ORDER_COLUMNS.has(key) && value !== undefined) clean[key] = value;
    }
    const order = { ...clean, gamer_id: req.user.id, status: 'pending' };
    const { data, error } = await supabaseAdmin.from('orders').insert(order).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Allowed fields for order updates (prevent mass assignment)
const ORDER_UPDATE_COLUMNS = new Set(['status', 'shipping_address', 'support_chat']);

// PUT /:id - update order (only owner can update, only safe fields)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    // Ownership check — must own the order
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('orders').select('gamer_id, organizer_id').eq('id', req.params.id).single();
    if (fetchError || !existing) return res.status(404).json({ error: 'Order not found' });
    if (existing.gamer_id !== req.user.id && existing.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    // Whitelist fields
    const clean = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (ORDER_UPDATE_COLUMNS.has(key)) clean[key] = value;
    }
    const { data, error } = await supabaseAdmin.from('orders')
      .update({ ...clean, updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/chat - support chat
router.post('/:id/chat', requireAuth, async (req, res) => {
  try {
    const { data: order } = await supabaseAdmin.from('orders').select('support_chat').eq('id', req.params.id).single();
    const chat = [...(order.support_chat || []), { ...req.body, user_id: req.user.id, timestamp: new Date().toISOString() }];
    const { data, error } = await supabaseAdmin.from('orders').update({ support_chat: chat }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
