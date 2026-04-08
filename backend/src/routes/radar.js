import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { validateCommitment, commitCoOrganizer, calculateFunding, getCommitmentLabel } from '../logic/radar.js';
import { generateBillNumber } from '../logic/billing.js';

const router = Router();

// GET / - list open radar entries (shared tournaments only)
router.get('/', async (req, res) => {
  try {
    const { status = 'open', game, limit = 50 } = req.query;

    // Only include radar entries whose linked tournament is of type 'shared'
    const { data: sharedTournaments, error: tErr } = await supabaseAdmin
      .from('tournaments')
      .select('id')
      .eq('tournament_type', 'shared');
    if (tErr) throw tErr;
    const sharedIds = (sharedTournaments || []).map(t => t.id);

    let query = supabaseAdmin.from('sponsorship_radar').select('*');
    if (sharedIds.length > 0) {
      query = query.in('tournament_id', sharedIds);
    } else {
      // No shared tournaments exist — return empty list
      return res.json([]);
    }
    if (status !== 'all') query = query.eq('status', status);
    if (game) query = query.eq('game', game);
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
    const { data, error } = await supabaseAdmin.from('sponsorship_radar').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Radar entry not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create radar entry
router.post('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('sponsorship_radar').insert({ ...req.body, main_organizer_id: req.user.id }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('sponsorship_radar').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/commit - co-organizer commits
router.post('/:id/commit', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const { data: radar } = await supabaseAdmin.from('sponsorship_radar').select('*').eq('id', req.params.id).single();
    if (!radar) return res.status(404).json({ error: 'Radar entry not found' });

    const percent = req.body.percent || req.body.commitment_percent;
    if (!percent) return res.status(400).json({ error: 'Commitment percent is required' });

    // Main organizer cannot commit to their own tournament
    if (req.user.id === radar.main_organizer_id) {
      return res.status(400).json({ error: 'You cannot commit to your own tournament' });
    }

    // Check if already committed
    const alreadyCommitted = (radar.co_organizers || []).find(co => co.organizer_id === req.user.id);
    if (alreadyCommitted) {
      return res.status(400).json({ error: 'You have already committed to this tournament' });
    }

    const validation = validateCommitment(radar, percent);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    // Auto-fetch organizer brand info if not provided
    let { brand_name, brand_logo } = req.body;
    if (!brand_name) {
      const { data: orgProfile } = await supabaseAdmin.from('organizer_profiles')
        .select('brand_name, brand_logo').eq('user_id', req.user.id).single();
      brand_name = orgProfile?.brand_name || 'Unknown';
      brand_logo = orgProfile?.brand_logo || '';
    }

    // Add co-organizer
    const coOrg = {
      organizer_id: req.user.id,
      brand_name,
      brand_logo,
      percent,
      commitment_percent: percent,
      label: getCommitmentLabel(percent),
      amount: radar.total_cost * (percent / 100),
      access_granted: false,
      committed_at: new Date().toISOString(),
    };

    const updatedCoOrgs = [...(radar.co_organizers || []), coOrg];
    const funding = calculateFunding({ ...radar, co_organizers: updatedCoOrgs });

    const newStatus = funding.funding_percent >= 100 ? 'fully_funded' : 'in_progress';

    await supabaseAdmin.from('sponsorship_radar').update({
      co_organizers: updatedCoOrgs,
      funding_percent: funding.funding_percent,
      amount_still_needed: funding.amount_still_needed,
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id);

    // Update tournament co_organizers
    await supabaseAdmin.from('tournaments').update({
      co_organizers: updatedCoOrgs,
      radar_funding_percent: funding.funding_percent,
    }).eq('id', radar.tournament_id);

    // Create bill for co-organizer
    const billNumber = await generateBillNumber(supabaseAdmin);
    const platformFeeShare = (radar.total_cost * 0.15) * (percent / 100);
    const subtotalShare = (radar.total_cost / 1.15) * (percent / 100);
    const grandTotal = coOrg.amount;

    await supabaseAdmin.from('bills').insert({
      bill_number: billNumber,
      bill_type: 'co_organizer',
      tournament_id: radar.tournament_id,
      tournament_name: radar.tournament_name,
      payer_id: req.user.id,
      payer_type: 'organizer',
      payer_name: brand_name,
      subtotal: subtotalShare,
      platform_fee: platformFeeShare,
      grand_total: grandTotal,
      payment_status: 'unpaid',
      shared_tournament: true,
      total_tournament_cost: radar.total_cost,
    });

    // Create billing snapshot
    await supabaseAdmin.from('billing_snapshots').insert({
      tournament_id: radar.tournament_id,
      tournament_name: radar.tournament_name,
      tournament_type: 'shared',
      organizer_id: req.user.id,
      organizer_brand_name: brand_name,
      organizer_brand_logo: brand_logo,
      billing_type: 'shared_co',
      commitment_percent: percent,
      amount_due: grandTotal,
      payment_status: 'unpaid',
    });

    res.json({ success: true, bill_number: billNumber, amount: grandTotal, label: coOrg.label });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/chat
router.post('/:id/chat', requireAuth, async (req, res) => {
  try {
    const { data: radar } = await supabaseAdmin.from('sponsorship_radar').select('chat').eq('id', req.params.id).single();
    const chat = [...(radar.chat || []), { ...req.body, user_id: req.user.id, timestamp: new Date().toISOString() }];
    const { data, error } = await supabaseAdmin.from('sponsorship_radar').update({ chat }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
