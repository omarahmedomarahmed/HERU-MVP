import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { requireStaff } from '../middleware/staffGuard.js';
import { calculateTournamentCost, generateBrackets } from '../logic/tournament.js';
import { generateBillNumber, createBill } from '../logic/billing.js';

const router = Router();

// GET / - list tournaments (public)
router.get('/', async (req, res) => {
  try {
    const { status, game, organizer_id, limit = 50, offset = 0 } = req.query;
    let query = supabaseAdmin.from('tournaments').select('*');

    if (status) query = query.eq('status', status);
    else query = query.in('status', ['published', 'live', 'completed']);

    if (game) query = query.eq('game', game);
    if (organizer_id) query = query.eq('organizer_id', organizer_id);

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get tournament
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('tournaments').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Tournament not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create tournament
router.post('/', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const tournament = {
      ...req.body,
      organizer_id: req.user.id,
      main_organizer_id: req.user.id,
      status: 'draft',
    };
    const { data, error } = await supabaseAdmin.from('tournaments').insert(tournament).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update tournament
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin.from('tournaments').select('organizer_id, main_organizer_id').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ error: 'Tournament not found' });
    if (existing.organizer_id !== req.user.id && existing.main_organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    const { data, error } = await supabaseAdmin.from('tournaments').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete draft tournament
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin.from('tournaments').select('organizer_id, status').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ error: 'Tournament not found' });
    if (existing.organizer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (existing.status !== 'draft') return res.status(400).json({ error: 'Can only delete draft tournaments' });
    const { error } = await supabaseAdmin.from('tournaments').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/publish - publish tournament
router.post('/:id/publish', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('*').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.organizer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const costs = calculateTournamentCost(tournament);
    const brackets = tournament.teams?.length ? generateBrackets(tournament.teams, tournament.format || 'single_elimination') : [];

    // Create tournament order
    const { data: order } = await supabaseAdmin.from('tournament_orders').insert({
      tournament_id: tournament.id,
      tournament_name: tournament.name,
      tournament_type: tournament.tournament_type,
      main_organizer_id: tournament.organizer_id,
      main_organizer_brand: tournament.organizer_brand?.brand_name || '',
      items: [...(tournament.branding_items || []), ...(tournament.production_items || []), ...(tournament.venue_items || [])],
      subtotal_items: costs.subtotal - (tournament.prizepool_total || 0),
      prizepool_amount: tournament.prizepool_total || 0,
      platform_fee: costs.platformFee,
      grand_total: costs.total,
      main_organizer_owes: tournament.tournament_type === 'solo' ? costs.total : costs.total * ((tournament.radar_funding_percent || 33) / 100),
      fulfillment_status: 'pending_payment',
    }).select().single();

    const updateData = {
      status: 'published',
      total_cost: costs.subtotal,
      platform_fee: costs.platformFee,
      brackets,
      updated_at: new Date().toISOString(),
    };

    // If solo, create bill directly
    if (tournament.tournament_type === 'solo') {
      const billNumber = await generateBillNumber(supabaseAdmin);
      await supabaseAdmin.from('bills').insert({
        bill_number: billNumber,
        bill_type: 'organizer',
        tournament_id: tournament.id,
        tournament_name: tournament.name,
        tournament_order_id: order.id,
        payer_id: tournament.organizer_id,
        payer_type: 'organizer',
        payer_name: tournament.organizer_brand?.brand_name || '',
        items: order.items,
        subtotal: costs.subtotal,
        platform_fee: costs.platformFee,
        grand_total: costs.total,
        payment_status: 'unpaid',
        total_tournament_cost: costs.total,
      });
    } else {
      // Shared: put on radar
      const radarPercent = tournament.radar_funding_percent || 33;
      const contribution = costs.total * (radarPercent / 100);
      const { data: radar } = await supabaseAdmin.from('sponsorship_radar').insert({
        tournament_id: tournament.id,
        tournament_name: tournament.name,
        main_organizer_id: tournament.organizer_id,
        main_organizer_brand: tournament.organizer_brand,
        game: tournament.game,
        schedule: tournament.schedule,
        description: tournament.description,
        total_cost: costs.total,
        prizepool_amount: tournament.prizepool_total || 0,
        main_organizer_contribution: contribution,
        main_organizer_percent: radarPercent,
        amount_still_needed: costs.total - contribution,
        funding_percent: radarPercent,
        max_co_organizers: radarPercent <= 34 ? 2 : 1,
        status: 'open',
      }).select().single();

      updateData.on_radar = true;
      updateData.sponsorship_radar_id = radar.id;

      // Create bill for main organizer's share
      const billNumber = await generateBillNumber(supabaseAdmin);
      await supabaseAdmin.from('bills').insert({
        bill_number: billNumber,
        bill_type: 'organizer',
        tournament_id: tournament.id,
        tournament_name: tournament.name,
        tournament_order_id: order.id,
        payer_id: tournament.organizer_id,
        payer_type: 'organizer',
        payer_name: tournament.organizer_brand?.brand_name || '',
        subtotal: costs.subtotal * (radarPercent / 100),
        platform_fee: costs.platformFee * (radarPercent / 100),
        grand_total: contribution,
        payment_status: 'unpaid',
        shared_tournament: true,
        total_tournament_cost: costs.total,
      });
    }

    const { data: updated, error } = await supabaseAdmin.from('tournaments').update(updateData).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/brackets - update brackets
router.put('/:id/brackets', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('tournaments').update({ brackets: req.body.brackets, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/chat - organizer chat
router.post('/:id/chat', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('organizer_chat').eq('id', req.params.id).single();
    const chat = [...(tournament.organizer_chat || []), { ...req.body, user_id: req.user.id, timestamp: new Date().toISOString() }];
    const { data, error } = await supabaseAdmin.from('tournaments').update({ organizer_chat: chat }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/general-chat - public chat
router.post('/:id/general-chat', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('general_chat').eq('id', req.params.id).single();
    const chat = [...(tournament.general_chat || []), { ...req.body, user_id: req.user.id, timestamp: new Date().toISOString() }];
    const { data, error } = await supabaseAdmin.from('tournaments').update({ general_chat: chat }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/join-request - team join request
router.post('/:id/join-request', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('join_requests, max_teams, teams').eq('id', req.params.id).single();
    if ((tournament.teams?.length || 0) >= (tournament.max_teams || 999)) {
      return res.status(400).json({ error: 'Tournament is full' });
    }
    const requests = [...(tournament.join_requests || []), { ...req.body, id: crypto.randomUUID(), user_id: req.user.id, status: 'pending', created_at: new Date().toISOString() }];
    const { data, error } = await supabaseAdmin.from('tournaments').update({ join_requests: requests }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/join-request/:requestId - approve/reject
router.put('/:id/join-request/:requestId', requireAuth, async (req, res) => {
  try {
    const { data: tournament } = await supabaseAdmin.from('tournaments').select('join_requests, teams, organizer_id').eq('id', req.params.id).single();
    if (tournament.organizer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const requests = (tournament.join_requests || []).map(r =>
      r.id === req.params.requestId ? { ...r, status: req.body.status } : r
    );
    const updates = { join_requests: requests, updated_at: new Date().toISOString() };

    if (req.body.status === 'approved') {
      const request = tournament.join_requests.find(r => r.id === req.params.requestId);
      if (request?.team_id) {
        updates.teams = [...(tournament.teams || []), request.team_id];
      }
    }

    const { data, error } = await supabaseAdmin.from('tournaments').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
