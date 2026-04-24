const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

// GET /api/direct-messages/conversations — list unique conversation partners
router.get('/conversations', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('direct_messages')
      .select('sender_id, recipient_id, content, created_at')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Deduplicate to get unique conversation partners
    const seen = new Set();
    const conversations = [];
    for (const msg of data) {
      const partnerId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
      if (!seen.has(partnerId)) {
        seen.add(partnerId);
        conversations.push({ partner_id: partnerId, last_message: msg.content, last_at: msg.created_at });
      }
    }
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/direct-messages/:partnerId — get message thread with one user
router.get('/:partnerId', requireAuth, async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${partnerId}),` +
        `and(sender_id.eq.${partnerId},recipient_id.eq.${userId})`
      )
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/direct-messages — send a message
router.post('/', requireAuth, async (req, res) => {
  try {
    const { recipient_id, content } = req.body;
    if (!recipient_id || !content) return res.status(400).json({ error: 'recipient_id and content required' });
    const { data, error } = await supabase
      .from('direct_messages')
      .insert({ sender_id: req.user.id, recipient_id, content })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/direct-messages/:partnerId/read — mark all messages from partner as read
router.put('/:partnerId/read', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('direct_messages')
      .update({ read_at: new Date() })
      .eq('sender_id', req.params.partnerId)
      .eq('recipient_id', req.user.id)
      .is('read_at', null);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
