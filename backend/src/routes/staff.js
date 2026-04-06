import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireStaff } from '../middleware/staffGuard.js';

const router = Router();

// GET /dashboard - stats
router.get('/dashboard', requireAuth, requireStaff, async (req, res) => {
  try {
    const [tournaments, users, orders, bills, revenue] = await Promise.all([
      supabaseAdmin.from('tournaments').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('tournament_orders').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('bills').select('id', { count: 'exact', head: true }).eq('payment_status', 'paid'),
      supabaseAdmin.from('bills').select('platform_fee').eq('payment_status', 'paid'),
    ]);

    const totalRevenue = (revenue.data || []).reduce((sum, b) => sum + (b.platform_fee || 0), 0);

    res.json({
      total_tournaments: tournaments.count || 0,
      total_users: users.count || 0,
      total_orders: orders.count || 0,
      paid_bills: bills.count || 0,
      total_platform_revenue: totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users - list all users
router.get('/users', requireAuth, requireStaff, async (req, res) => {
  try {
    const { role, limit = 100 } = req.query;
    let query = supabaseAdmin.from('user_profiles').select('*');
    if (role) query = query.eq('role', role);
    query = query.order('created_at', { ascending: false }).limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/:id
router.get('/users/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data: profile } = await supabaseAdmin.from('user_profiles').select('*').eq('id', req.params.id).single();
    if (!profile) return res.status(404).json({ error: 'User not found' });

    let extraProfile = null;
    if (profile.role === 'gamer') {
      const { data } = await supabaseAdmin.from('gamer_profiles').select('*').eq('user_id', req.params.id).single();
      extraProfile = data;
    } else if (profile.role === 'organizer') {
      const { data } = await supabaseAdmin.from('organizer_profiles').select('*').eq('user_id', req.params.id).single();
      extraProfile = data;
    }

    res.json({ ...profile, profile: extraProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /users/:id - update user
router.put('/users/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('user_profiles').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /revenue - platform fee revenue breakdown
router.get('/revenue', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data: bills, error } = await supabaseAdmin.from('bills').select('tournament_name, platform_fee, payment_status, paid_date, created_at').eq('payment_status', 'paid').order('paid_date', { ascending: false });
    if (error) throw error;

    const totalRevenue = (bills || []).reduce((sum, b) => sum + (b.platform_fee || 0), 0);
    const byTournament = {};
    for (const bill of (bills || [])) {
      const name = bill.tournament_name || 'Marketplace';
      byTournament[name] = (byTournament[name] || 0) + (bill.platform_fee || 0);
    }

    res.json({
      total_revenue: totalRevenue,
      by_tournament: Object.entries(byTournament).map(([name, amount]) => ({ name, amount })),
      bills,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /billing - master billing
router.get('/billing', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('bills').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /audit - audit trail
router.get('/audit', requireAuth, requireStaff, async (req, res) => {
  try {
    const { action, user_id, search, from_date, to_date, limit = 100, offset = 0 } = req.query;
    let query = supabaseAdmin.from('audit_log').select('*');
    if (action) query = query.eq('action', action);
    if (user_id) query = query.eq('user_id', user_id);
    if (from_date) query = query.gte('created_at', from_date);
    if (to_date) query = query.lte('created_at', to_date);
    if (search) query = query.or(`user_email.ilike.%${search}%,user_name.ilike.%${search}%,action.ilike.%${search}%`);
    query = query.order('created_at', { ascending: false }).range(offset, Number(offset) + Number(limit) - 1);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
