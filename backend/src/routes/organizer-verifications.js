import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOrganizer, requireAdmin } from '../middleware/roleGuard.js';

const router = Router();

router.get('/me', requireAuth, requireOrganizer, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('organizer_verifications').select('*').eq('organizer_id', req.user.id).order('created_at', { ascending: false }).limit(1).single();
    if (error) return res.json({ verification: null });
    res.json({ verification: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch verification' });
  }
});

router.post('/', requireAuth, requireOrganizer, async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin.from('organizer_verifications').select('id,status').eq('organizer_id', req.user.id).eq('status', 'pending').single();
    if (existing) return res.status(409).json({ error: 'You already have a pending verification request' });
    const { documents, past_tournament_links, social_links, brand_deck_url } = req.body;
    const { data, error } = await supabaseAdmin.from('organizer_verifications').insert({ organizer_id: req.user.id, documents: Array.isArray(documents) ? documents : [], past_tournament_links: Array.isArray(past_tournament_links) ? past_tournament_links : [], social_links: social_links || {}, brand_deck_url: brand_deck_url || null, status: 'pending' }).select().single();
    if (error) throw error;
    res.status(201).json({ verification: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit verification request' });
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    if (!['approved','rejected'].includes(status)) return res.status(400).json({ error: 'status must be approved or rejected' });
    const { data, error } = await supabaseAdmin.from('organizer_verifications').update({ status, reviewed_by: req.user.id, rejection_reason: rejection_reason || null, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) return res.status(404).json({ error: 'Verification not found' });
    if (status === 'approved') {
      await supabaseAdmin.from('organizer_profiles').update({ is_verified: true, updated_at: new Date().toISOString() }).eq('user_id', data.organizer_id);
    }
    res.json({ verification: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const { data, error } = await supabaseAdmin.from('organizer_verifications').select('*, organizer_profiles(brand_name,brand_logo)').eq('status', status).order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ verifications: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch verifications' });
  }
});

export default router;
