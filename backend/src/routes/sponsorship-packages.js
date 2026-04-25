import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOrganizer } from '../middleware/roleGuard.js';

const router = Router();

router.get('/radar', async (req, res) => {
  try {
    const { game, min_reach, max_price, limit = 20, offset = 0 } = req.query;
    let query = supabaseAdmin
      .from('sponsorship_packages')
      .select(`*, tournaments!inner(id,name,game,organizer_id,organizer_brand,schedule,tournament_image,sponsorship_enabled,status)`)
      .eq('is_active', true)
      .eq('tournaments.sponsorship_enabled', true)
      .eq('tournaments.status', 'published')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    if (game) query = query.eq('tournaments.game', game);
    if (min_reach) query = query.gte('expected_reach', Number(min_reach));
    if (max_price) query = query.lte('price', Number(max_price));
    const { data, error } = await query;
    if (error) throw error;
    res.json({ packages: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch radar packages' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { tournament_id, limit = 20, offset = 0 } = req.query;
    let query = supabaseAdmin
      .from('sponsorship_packages')
      .select('*, tournaments(name,game,organizer_id,organizer_brand,schedule,tournament_image)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    if (tournament_id) query = query.eq('tournament_id', tournament_id);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ packages: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('sponsorship_packages')
      .select('*, tournaments(id,name,game,organizer_brand,schedule,tournament_image,organizer_id), sponsorships(id,status,sponsor_id)')
      .eq('id', req.params.id)
      .single();
    if (error) return res.status(404).json({ error: 'Package not found' });
    res.json({ package: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch package' });
  }
});

router.post('/', requireAuth, requireOrganizer, async (req, res) => {
  try {
    const { tournament_id, title, description, price, deliverables, marketing_channels, expected_reach, expected_impressions, expected_views, social_posts_count, logo_placement, on_site_presence } = req.body;
    if (!tournament_id || !title || price === undefined) {
      return res.status(400).json({ error: 'tournament_id, title, and price are required' });
    }
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('organizer_id').eq('id', tournament_id).single();
    if (!tournament || tournament.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this tournament' });
    }
    const { data, error } = await supabaseAdmin.from('sponsorship_packages').insert({
      tournament_id, organizer_id: req.user.id, title,
      description: description || '',
      price: Number(price),
      deliverables: Array.isArray(deliverables) ? deliverables : [],
      marketing_channels: Array.isArray(marketing_channels) ? marketing_channels : [],
      expected_reach: expected_reach ? Number(expected_reach) : null,
      expected_impressions: expected_impressions ? Number(expected_impressions) : null,
      expected_views: expected_views ? Number(expected_views) : null,
      social_posts_count: social_posts_count ? Number(social_posts_count) : null,
      logo_placement: logo_placement || '',
      on_site_presence: Boolean(on_site_presence),
      is_active: true,
    }).select().single();
    if (error) throw error;
    await supabaseAdmin.from('tournaments').update({ sponsorship_enabled: true }).eq('id', tournament_id);
    res.status(201).json({ package: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create package' });
  }
});

router.put('/:id', requireAuth, requireOrganizer, async (req, res) => {
  try {
    const allowed = ['title','description','price','deliverables','marketing_channels','expected_reach','expected_impressions','expected_views','social_posts_count','logo_placement','on_site_presence'];
    const updates = { updated_at: new Date().toISOString() };
    for (const key of allowed) { if (req.body[key] !== undefined) updates[key] = req.body[key]; }
    const { data, error } = await supabaseAdmin.from('sponsorship_packages').update(updates).eq('id', req.params.id).eq('organizer_id', req.user.id).select().single();
    if (error) return res.status(404).json({ error: 'Package not found or not yours' });
    res.json({ package: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update package' });
  }
});

router.delete('/:id', requireAuth, requireOrganizer, async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('sponsorship_packages').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', req.params.id).eq('organizer_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate package' });
  }
});

export default router;
