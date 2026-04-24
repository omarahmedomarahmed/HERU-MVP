const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

// GET /api/friends — list accepted friends
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('*, requester:requester_id(id), addressee:addressee_id(id)')
      .or(`requester_id.eq.${req.user.id},addressee_id.eq.${req.user.id}`)
      .eq('status', 'accepted');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/friends/requests — incoming pending requests
router.get('/requests', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .eq('addressee_id', req.user.id)
      .eq('status', 'pending');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/friends/request — send friend request
router.post('/request', requireAuth, async (req, res) => {
  try {
    const { addressee_id } = req.body;
    if (!addressee_id) return res.status(400).json({ error: 'addressee_id required' });
    if (addressee_id === req.user.id) return res.status(400).json({ error: 'Cannot friend yourself' });
    const { data, error } = await supabase
      .from('friendships')
      .insert({ requester_id: req.user.id, addressee_id, status: 'pending' })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/friends/:id/accept
router.put('/:id/accept', requireAuth, async (req, res) => {
  try {
    const { data: friendship } = await supabase
      .from('friendships')
      .select('addressee_id')
      .eq('id', req.params.id)
      .single();
    if (!friendship || friendship.addressee_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { data, error } = await supabase
      .from('friendships')
      .update({ status: 'accepted', updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/friends/:id/block
router.put('/:id/block', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .update({ status: 'blocked', updated_at: new Date() })
      .eq('id', req.params.id)
      .or(`requester_id.eq.${req.user.id},addressee_id.eq.${req.user.id}`)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/friends/:id — remove friend
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', req.params.id)
      .or(`requester_id.eq.${req.user.id},addressee_id.eq.${req.user.id}`);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
