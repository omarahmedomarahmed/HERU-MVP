// reviewed 2026-04-25
import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/direct-messages — list conversations (latest message per partner)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('direct_messages')
      .select('id, sender_id, recipient_id, message, is_read, created_at')
      .or(`sender_id.eq.${req.user.id},recipient_id.eq.${req.user.id}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    // Deduplicate by conversation partner
    const seen = new Set();
    const conversations = [];
    for (const msg of data) {
      const partnerId = msg.sender_id === req.user.id ? msg.recipient_id : msg.sender_id;
      if (!seen.has(partnerId)) {
        seen.add(partnerId);
        conversations.push({ partner_id: partnerId, last_message: msg });
      }
    }
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/direct-messages/:partnerId — full thread with one user
router.get('/:partnerId', requireAuth, async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { data, error } = await supabaseAdmin
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${req.user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${req.user.id})`)
      .order('created_at', { ascending: true });
    if (error) throw error;
    // Mark messages to current user as read
    await supabaseAdmin
      .from('direct_messages')
      .update({ is_read: true })
      .eq('recipient_id', req.user.id)
      .eq('sender_id', partnerId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/direct-messages — send message
router.post('/', requireAuth, async (req, res) => {
  try {
    const { recipient_id, message } = req.body;
    if (!recipient_id || !message?.trim()) return res.status(400).json({ error: 'recipient_id and message required' });
    const { data, error } = await supabaseAdmin
      .from('direct_messages')
      .insert({ sender_id: req.user.id, recipient_id, message: message.trim(), is_read: false })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/direct-messages/:partnerId/read — mark thread as read
router.put('/:partnerId/read', requireAuth, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('direct_messages')
      .update({ is_read: true })
      .eq('recipient_id', req.user.id)
      .eq('sender_id', req.params.partnerId);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
