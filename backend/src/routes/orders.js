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

// POST / - create order
router.post('/', requireAuth, async (req, res) => {
  try {
    const order = { ...req.body, gamer_id: req.user.id, status: 'pending' };
    const { data, error } = await supabaseAdmin.from('orders').insert(order).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update order
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('orders').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
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
