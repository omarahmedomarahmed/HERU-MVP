import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireProvider } from '../middleware/roleGuard.js';

const router = Router();

// GET /providers — list approved providers (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    let query = supabaseAdmin
      .from('service_provider_profiles')
      .select('*, services(id,title,category,price,rating,is_approved)')
      .eq('is_approved', true)
      .order('rating', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (search) {
      query = query.ilike('display_name', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const filtered = category
      ? data.filter(p => p.services?.some(s => s.category === category && s.is_approved))
      : data;

    res.json({ providers: filtered });
  } catch (err) {
    console.error('[providers GET /]', err);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// GET /providers/me — own profile (requires provider auth)
router.get('/me', requireAuth, requireProvider, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_provider_profiles')
      .select('*, services(*), provider_portfolio_items(*), provider_past_projects(*)')
      .eq('user_id', req.user.id)
      .single();

    if (error) return res.status(404).json({ error: 'Provider profile not found' });
    res.json({ provider: data });
  } catch (err) {
    console.error('[providers GET /me]', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /providers/admin/pending — staff: list pending provider profiles
router.get('/admin/pending', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { data, error } = await supabaseAdmin
      .from('service_provider_profiles')
      .select('*')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ providers: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /providers/admin/:id/approve
router.put('/admin/:id/approve', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { data, error } = await supabaseAdmin
      .from('service_provider_profiles')
      .update({ is_approved: true, approval_status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ provider: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /providers/admin/:id/reject
router.put('/admin/:id/reject', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { data, error } = await supabaseAdmin
      .from('service_provider_profiles')
      .update({ is_approved: false, approval_status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ provider: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /providers/:id — public provider profile
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_provider_profiles')
      .select('*, services(*), provider_portfolio_items(*), provider_past_projects(*)')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Provider not found' });
    res.json({ provider: data });
  } catch (err) {
    console.error('[providers GET /:id]', err);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

// PUT /providers/me — update own profile
router.put('/me', requireAuth, requireProvider, async (req, res) => {
  try {
    const allowed = [
      'display_name','avatar','bio','portfolio_url','portfolio_description',
      'years_experience','social_links','is_discord_server',
      'discord_server_invite','discord_server_member_count',
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.is_discord_server && updates.discord_server_member_count < 1000) {
      return res.status(400).json({ error: 'Discord server must have at least 1000 members' });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('service_provider_profiles')
      .update(updates)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ provider: data });
  } catch (err) {
    console.error('[providers PUT /me]', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
