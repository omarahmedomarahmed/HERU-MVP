import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireStaff } from '../middleware/staffGuard.js';

const router = Router();

// GET /dashboard - stats
router.get('/dashboard', requireAuth, requireStaff, async (req, res) => {
  try {
    const [tournaments, activeTournaments, users, orders, bills, revenue, staffSessions] = await Promise.all([
      supabaseAdmin.from('tournaments').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('tournaments').select('id', { count: 'exact', head: true }).in('status', ['published', 'live']),
      supabaseAdmin.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('tournament_orders').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('bills').select('id', { count: 'exact', head: true }).eq('payment_status', 'paid'),
      supabaseAdmin.from('bills').select('platform_fee').eq('payment_status', 'paid'),
      supabaseAdmin.from('staff_sessions').select('id', { count: 'exact', head: true }).eq('is_active', true).gte('expires_at', new Date().toISOString()),
    ]);

    const totalRevenue = (revenue.data || []).reduce((sum, b) => sum + (b.platform_fee || 0), 0);

    res.json({
      total_tournaments: tournaments.count || 0,
      active_tournaments: activeTournaments.count || 0,
      total_users: users.count || 0,
      total_orders: orders.count || 0,
      paid_bills: bills.count || 0,
      total_platform_revenue: totalRevenue,
      active_staff_sessions: staffSessions.count || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users - list all users with filters (role, search)
router.get('/users', requireAuth, requireStaff, async (req, res) => {
  try {
    const { role, search, limit = 100, offset = 0 } = req.query;
    let query = supabaseAdmin.from('user_profiles').select('*');
    if (role) query = query.eq('role', role);
    if (search) query = query.or(`full_name.ilike.%${search}%,role.ilike.%${search}%`);
    query = query.order('created_at', { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);
    const { data, error } = await query;
    if (error) throw error;

    // Enrich with emails from auth.users via admin API
    const enriched = await Promise.all((data || []).map(async (profile) => {
      try {
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(profile.id);
        return { ...profile, email: user?.email || null };
      } catch {
        return { ...profile, email: null };
      }
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/:id
router.get('/users/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data: profile } = await supabaseAdmin.from('user_profiles').select('*').eq('id', req.params.id).single();
    if (!profile) return res.status(404).json({ error: 'User not found' });

    // Get email from auth.users
    let email = null;
    try {
      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(req.params.id);
      email = user?.email || null;
    } catch { /* ignore */ }

    let extraProfile = null;
    if (profile.role === 'gamer') {
      const { data } = await supabaseAdmin.from('gamer_profiles').select('*').eq('user_id', req.params.id).single();
      extraProfile = data;
    } else if (profile.role === 'organizer') {
      const { data } = await supabaseAdmin.from('organizer_profiles').select('*').eq('user_id', req.params.id).single();
      extraProfile = data;
    }

    // Also fetch tournaments if organizer
    let tournaments = [];
    if (profile.role === 'organizer') {
      const { data: tourns } = await supabaseAdmin.from('tournaments').select('id, name, status, game').eq('organizer_id', req.params.id).order('created_at', { ascending: false }).limit(10);
      tournaments = tourns || [];
    }

    res.json({ ...profile, email, profile: extraProfile, gamer_profile: profile.role === 'gamer' ? extraProfile : null, organizer_profile: profile.role === 'organizer' ? extraProfile : null, tournaments });
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

// GET /revenue - platform fee revenue breakdown with filters
router.get('/revenue', requireAuth, requireStaff, async (req, res) => {
  try {
    const { from_date, to_date, tournament_id } = req.query;

    // Fetch PAID bills (collected revenue)
    let paidQuery = supabaseAdmin.from('bills').select('tournament_id, tournament_name, platform_fee, payment_status, paid_date, created_at').eq('payment_status', 'paid');
    if (from_date) paidQuery = paidQuery.gte('paid_date', from_date);
    if (to_date) paidQuery = paidQuery.lte('paid_date', to_date);
    if (tournament_id) paidQuery = paidQuery.eq('tournament_id', tournament_id);
    paidQuery = paidQuery.order('paid_date', { ascending: false });

    // Fetch ALL bills for total expected fees
    let allQuery = supabaseAdmin.from('bills').select('platform_fee, payment_status');
    if (tournament_id) allQuery = allQuery.eq('tournament_id', tournament_id);

    const [{ data: paidBills, error: paidErr }, { data: allBills, error: allErr }] = await Promise.all([
      paidQuery,
      allQuery,
    ]);
    if (paidErr) throw paidErr;
    if (allErr) throw allErr;

    const totalRevenue = (paidBills || []).reduce((sum, b) => sum + (b.platform_fee || 0), 0);
    const totalExpectedFees = (allBills || []).reduce((sum, b) => sum + (b.platform_fee || 0), 0);
    const pendingFees = totalExpectedFees - totalRevenue;

    const byTournament = {};
    const byMonth = {};
    for (const bill of (paidBills || [])) {
      const name = bill.tournament_name || 'Marketplace';
      byTournament[name] = (byTournament[name] || 0) + (bill.platform_fee || 0);
      if (bill.paid_date) {
        const month = bill.paid_date.substring(0, 7); // YYYY-MM
        byMonth[month] = (byMonth[month] || 0) + (bill.platform_fee || 0);
      }
    }

    res.json({
      total_revenue: totalRevenue,
      total_expected_fees: totalExpectedFees,
      pending_fees: pendingFees,
      by_tournament: Object.entries(byTournament).map(([name, amount]) => ({ name, amount })),
      by_month: Object.entries(byMonth).map(([month, amount]) => ({ month, amount })).sort((a, b) => b.month.localeCompare(a.month)),
      bills: paidBills,
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
    const { action, entity_type, user_id, search, from_date, to_date, limit = 100, offset = 0 } = req.query;
    let query = supabaseAdmin.from('audit_log').select('*');
    if (action) query = query.eq('action', action);
    if (entity_type) query = query.eq('entity_type', entity_type);
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

// GET /organizers - list all organizer profiles
router.get('/organizers', requireAuth, requireStaff, async (req, res) => {
  try {
    const { search, is_verified, limit = 100, offset = 0 } = req.query;
    let query = supabaseAdmin.from('organizer_profiles').select('*');
    if (is_verified !== undefined) query = query.eq('is_verified', is_verified === 'true');
    if (search) query = query.or(`brand_name.ilike.%${search}%,location.ilike.%${search}%`);
    query = query.order('created_at', { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /messages - list all messages/chats
router.get('/messages', requireAuth, requireStaff, async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;

    const results = {};

    // Fetch tournament chats (organizer_chat, support_chat, general_chat)
    if (!type || type === 'tournament') {
      const { data: tournaments, error } = await supabaseAdmin
        .from('tournaments')
        .select('id, name, organizer_chat, support_chat, general_chat')
        .or('organizer_chat.neq.[],support_chat.neq.[],general_chat.neq.[]')
        .order('updated_at', { ascending: false })
        .limit(Number(limit));
      if (error) throw error;
      results.tournament_chats = (tournaments || []).map(t => ({
        tournament_id: t.id,
        tournament_name: t.name,
        organizer_chat: t.organizer_chat || [],
        support_chat: t.support_chat || [],
        general_chat: t.general_chat || [],
      }));
    }

    // Fetch gig request chats
    if (!type || type === 'gig') {
      const { data: gigs, error } = await supabaseAdmin
        .from('gig_requests')
        .select('id, tournament_name, talent_type, chat')
        .order('updated_at', { ascending: false })
        .limit(Number(limit));
      if (error) throw error;
      results.gig_chats = (gigs || []).map(g => ({
        gig_id: g.id,
        tournament_name: g.tournament_name,
        talent_type: g.talent_type,
        chat: g.chat || [],
      }));
    }

    // Fetch radar chats
    if (!type || type === 'radar') {
      const { data: radar, error } = await supabaseAdmin
        .from('sponsorship_radar')
        .select('id, tournament_name, chat')
        .order('created_at', { ascending: false })
        .limit(Number(limit));
      if (error) throw error;
      results.radar_chats = (radar || []).map(r => ({
        radar_id: r.id,
        tournament_name: r.tournament_name,
        chat: r.chat || [],
      }));
    }

    // Fetch order support chats
    if (!type || type === 'order') {
      const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('id, order_type, support_chat')
        .order('updated_at', { ascending: false })
        .limit(Number(limit));
      if (error) throw error;
      results.order_chats = (orders || []).map(o => ({
        order_id: o.id,
        order_type: o.order_type,
        support_chat: o.support_chat || [],
      }));
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /access-keys - list staff access keys
router.get('/access-keys', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('staff_access_keys')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /access-keys - create new staff access key
router.post('/access-keys', requireAuth, requireStaff, async (req, res) => {
  try {
    const { access_key, staff_name, staff_email, notes } = req.body;
    if (!access_key || !staff_name || !staff_email) {
      return res.status(400).json({ error: 'access_key, staff_name, and staff_email are required' });
    }
    const { data, error } = await supabaseAdmin
      .from('staff_access_keys')
      .insert({
        access_key,
        staff_name,
        staff_email,
        notes,
        is_active: true,
        created_by: req.user.id,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /access-keys/:id/deactivate - deactivate a staff access key
router.post('/access-keys/:id/deactivate', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('staff_access_keys')
      .update({ is_active: false })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Access key not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /tournaments/:id - staff can update ANY tournament field
router.put('/tournaments/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    const { data, error } = await supabaseAdmin
      .from('tournaments')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Tournament not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /tournaments/:id/status - staff can change tournament status
router.put('/tournaments/:id/status', requireAuth, requireStaff, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['draft', 'pending_approval', 'published', 'live', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: draft, pending_approval, published, live, completed' });
    }
    const { data, error } = await supabaseAdmin
      .from('tournaments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Tournament not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /bills/all - get all bills with filters
router.get('/bills/all', requireAuth, requireStaff, async (req, res) => {
  try {
    const { bill_type, payment_status, payer_id, tournament_id, search, limit = 100, offset = 0 } = req.query;
    let query = supabaseAdmin.from('bills').select('*');
    if (bill_type) query = query.eq('bill_type', bill_type);
    if (payment_status) query = query.eq('payment_status', payment_status);
    if (payer_id) query = query.eq('payer_id', payer_id);
    if (tournament_id) query = query.eq('tournament_id', tournament_id);
    if (search) query = query.or(`bill_number.ilike.%${search}%,payer_name.ilike.%${search}%,tournament_name.ilike.%${search}%`);
    query = query.order('created_at', { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /bills/:id - staff can update bill fields
router.put('/bills/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    const { data, error } = await supabaseAdmin
      .from('bills')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Bill not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /marketplace/:id/required - staff can set marketplace items as required for shared tournaments
router.put('/marketplace/:id/required', requireAuth, requireStaff, async (req, res) => {
  try {
    const { is_required } = req.body;
    if (typeof is_required !== 'boolean') {
      return res.status(400).json({ error: 'is_required must be a boolean' });
    }
    const { data, error } = await supabaseAdmin
      .from('marketplace_items')
      .update({ is_required, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Marketplace item not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /radar-views - get all radar views (latest 200)
router.get('/radar-views', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('radar_views')
      .select('*')
      .order('viewed_at', { ascending: false })
      .limit(200);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return res.json([]);
      }
      throw error;
    }
    res.json(data || []);
  } catch (err) {
    if (err.code === '42P01' || err.message?.includes('does not exist')) {
      return res.json([]);
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /radar - get all radar entries with full details (shared tournaments only)
router.get('/radar', requireAuth, requireStaff, async (req, res) => {
  try {
    const { status, search, limit = 100, offset = 0 } = req.query;

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
      return res.json([]);
    }
    if (status) query = query.eq('status', status);
    if (search) query = query.or(`tournament_name.ilike.%${search}%,game.ilike.%${search}%`);
    query = query.order('created_at', { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /radar/:id - staff can update radar entries
router.put('/radar/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    const { data, error } = await supabaseAdmin
      .from('sponsorship_radar')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Radar entry not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GAMERS ──────────────────────────────────────────────────────────────────
router.get('/gamers', requireAuth, requireStaff, async (req, res) => {
  try {
    const { search, is_talent, limit = 100, offset = 0 } = req.query;
    let q = supabaseAdmin.from('gamer_profiles').select('*');
    if (is_talent !== undefined) q = q.eq('is_talent', is_talent === 'true');
    if (search) q = q.or(`username.ilike.%${search}%,bio.ilike.%${search}%`);
    q = q.order('created_at', { ascending: false }).range(+offset, +offset + +limit - 1);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/gamers/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('gamer_profiles')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── TEAMS ────────────────────────────────────────────────────────────────────
router.get('/teams', requireAuth, requireStaff, async (req, res) => {
  try {
    const { search, limit = 100, offset = 0 } = req.query;
    let q = supabaseAdmin.from('teams').select('*');
    if (search) q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    q = q.order('created_at', { ascending: false }).range(+offset, +offset + +limit - 1);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/teams/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('teams')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/teams/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('teams').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Team deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GIG REQUESTS ─────────────────────────────────────────────────────────────
router.get('/gigs', requireAuth, requireStaff, async (req, res) => {
  try {
    const { status, search, limit = 100, offset = 0 } = req.query;
    let q = supabaseAdmin.from('gig_requests').select('*');
    if (status) q = q.eq('status', status);
    if (search) q = q.or(`tournament_name.ilike.%${search}%,talent_type.ilike.%${search}%`);
    q = q.order('created_at', { ascending: false }).range(+offset, +offset + +limit - 1);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/gigs/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('gig_requests')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── ORGANIZER PROFILE EDIT ───────────────────────────────────────────────────
router.put('/organizers/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('organizer_profiles')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── DELETE TOURNAMENT ─────────────────────────────────────────────────────────
router.delete('/tournaments/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('tournaments').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Tournament deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── DELETE USER ───────────────────────────────────────────────────────────────
router.delete('/users/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    await supabaseAdmin.from('user_profiles').delete().eq('id', req.params.id);
    await supabaseAdmin.auth.admin.deleteUser(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── BILLS CRUD ────────────────────────────────────────────────────────────────
router.post('/bills', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('bills').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/bills/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('bills').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Bill deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── STAFF SESSIONS ────────────────────────────────────────────────────────────
router.get('/sessions', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('staff_sessions').select('*')
      .order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/sessions/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    await supabaseAdmin.from('staff_sessions').update({ is_active: false }).eq('id', req.params.id);
    res.json({ message: 'Session terminated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── APP SETTINGS ──────────────────────────────────────────────────────────────
router.get('/app-settings', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('app_settings').select('*').order('setting_key');
    if (error) throw error;
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/app-settings/:key', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('app_settings')
      .upsert({ setting_key: req.params.key, ...req.body, updated_at: new Date().toISOString() }, { onConflict: 'setting_key' })
      .select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── BUILD TOURNAMENT ON BEHALF ────────────────────────────────────────────────
router.post('/tournaments/build-on-behalf', requireAuth, requireStaff, async (req, res) => {
  try {
    const { organizer_id, ...tournamentData } = req.body;
    if (!organizer_id) return res.status(400).json({ error: 'organizer_id is required' });
    const { data: orgProfile } = await supabaseAdmin.from('organizer_profiles')
      .select('brand_name, brand_logo').eq('user_id', organizer_id).single();
    const { data, error } = await supabaseAdmin.from('tournaments').insert({
      ...tournamentData,
      organizer_id,
      main_organizer_id: organizer_id,
      organizer_brand: orgProfile ? { name: orgProfile.brand_name, logo: orgProfile.brand_logo } : {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── ORDERS (full list) ────────────────────────────────────────────────────────
router.get('/orders', requireAuth, requireStaff, async (req, res) => {
  try {
    const { status, order_type, search, limit = 100, offset = 0 } = req.query;
    let q = supabaseAdmin.from('orders').select('*');
    if (status) q = q.eq('status', status);
    if (order_type) q = q.eq('order_type', order_type);
    q = q.order('created_at', { ascending: false }).range(+offset, +offset + +limit - 1);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/orders/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('orders')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── TOURNAMENT ORDERS ─────────────────────────────────────────────────────────
router.get('/tournament-orders', requireAuth, requireStaff, async (req, res) => {
  try {
    const { fulfillment_status, limit = 100, offset = 0 } = req.query;
    let q = supabaseAdmin.from('tournament_orders').select('*');
    if (fulfillment_status) q = q.eq('fulfillment_status', fulfillment_status);
    q = q.order('created_at', { ascending: false }).range(+offset, +offset + +limit - 1);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/tournament-orders/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('tournament_orders')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── APPROVALS ─────────────────────────────────────────────────────────────────
router.get('/approvals', requireAuth, requireStaff, async (req, res) => {
  try {
    const { status, approval_type, limit = 100, offset = 0 } = req.query;
    let q = supabaseAdmin.from('approval_requests').select('*');
    if (status) q = q.eq('status', status);
    if (approval_type) q = q.eq('approval_type', approval_type);
    q = q.order('created_at', { ascending: false }).range(+offset, +offset + +limit - 1);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/approvals/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('approval_requests')
      .update({ ...req.body, reviewed_by: req.user.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;

