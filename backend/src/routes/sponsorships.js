import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireSponsor } from '../middleware/roleGuard.js';

const router = Router();
const HERU_FEE_RATE = 0.15;

router.get('/', requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let query;
    if (req.user.role === 'sponsor') {
      query = supabaseAdmin.from('sponsorships').select('*, sponsorship_packages(title,price,tournament_id), tournaments(name,game)').eq('sponsor_id', req.user.id).order('created_at', { ascending: false });
    } else if (req.user.role === 'organizer') {
      const { data: myTournaments } = await supabaseAdmin.from('tournaments').select('id').eq('organizer_id', req.user.id);
      const ids = (myTournaments || []).map(t => t.id);
      query = supabaseAdmin.from('sponsorships').select('*, sponsorship_packages(title,price), tournaments(name,game)').in('tournament_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']).order('created_at', { ascending: false });
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ sponsorships: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sponsorships' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('sponsorships').select('*, sponsorship_packages(*), tournaments(name,game,organizer_id)').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'Sponsorship not found' });
    const isOwner = data.sponsor_id === req.user.id;
    const isOrganizer = data.tournaments?.organizer_id === req.user.id;
    if (!isOwner && !isOrganizer) return res.status(403).json({ error: 'Access denied' });
    res.json({ sponsorship: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sponsorship' });
  }
});

router.post('/', requireAuth, requireSponsor, async (req, res) => {
  try {
    const { package_id, is_recurring, recurrence_interval } = req.body;
    if (!package_id) return res.status(400).json({ error: 'package_id is required' });
    const { data: pkg } = await supabaseAdmin.from('sponsorship_packages').select('*').eq('id', package_id).eq('is_active', true).single();
    if (!pkg) return res.status(404).json({ error: 'Package not found or inactive' });
    const { data: sponsorProfile } = await supabaseAdmin.from('sponsor_profiles').select('brand_name').eq('user_id', req.user.id).single();
    const amount = pkg.price;
    const heruFee = Math.round(amount * HERU_FEE_RATE * 100) / 100;
    const netToOrganizer = Math.round((amount - heruFee) * 100) / 100;
    const { data, error } = await supabaseAdmin.from('sponsorships').insert({
      package_id, tournament_id: pkg.tournament_id, sponsor_id: req.user.id,
      sponsor_brand: sponsorProfile?.brand_name || '',
      amount, heru_fee: heruFee, net_to_organizer: netToOrganizer,
      status: 'pending',
      is_recurring: Boolean(is_recurring),
      recurrence_interval: is_recurring ? (recurrence_interval || 'per_season') : null,
    }).select().single();
    if (error) throw error;
    res.status(201).json({ sponsorship: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create sponsorship' });
  }
});

router.put('/:id/pay', requireAuth, async (req, res) => {
  try {
    const { paymob_order_id, paymob_transaction_id } = req.body;
    const { data: sponsorship } = await supabaseAdmin.from('sponsorships').select('*').eq('id', req.params.id).single();
    if (!sponsorship) return res.status(404).json({ error: 'Sponsorship not found' });
    if (sponsorship.sponsor_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { data, error } = await supabaseAdmin.from('sponsorships').update({
      status: 'paid', paid_at: new Date().toISOString(),
      paymob_order_id: paymob_order_id || null,
      paymob_transaction_id: paymob_transaction_id || null,
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id).select().single();
    if (error) throw error;
    const { data: allSpons } = await supabaseAdmin.from('sponsorships').select('amount').eq('tournament_id', data.tournament_id).in('status', ['paid','active','completed']);
    const totalRaised = (allSpons || []).reduce((s, r) => s + Number(r.amount), 0);
    await supabaseAdmin.from('tournaments').update({ total_sponsorship_raised: totalRaised }).eq('id', data.tournament_id);
    await supabaseAdmin.from('heru_revenue_ledger').insert({
      source_type: 'sponsorship', source_id: data.id,
      gross_amount: data.amount, heru_fee: data.heru_fee, net_amount: data.net_to_organizer, currency: 'EGP',
    });
    res.json({ sponsorship: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

export default router;
