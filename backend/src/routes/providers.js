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
    let { data, error } = await supabaseAdmin
      .from('service_provider_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      // Auto-create profile if missing
      const { data: newProfile, error: createErr } = await supabaseAdmin
        .from('service_provider_profiles')
        .insert({
          user_id: req.user.id,
          display_name: req.user.email?.split('@')[0] || 'Provider',
          approval_status: 'pending',
          is_approved: false,
        })
        .select()
        .single();
      if (createErr) return res.status(500).json({ error: 'Failed to create provider profile' });
      data = newProfile;
    }

    // Fetch services and portfolio separately to avoid join errors
    const [{ data: services }, { data: portfolio }] = await Promise.all([
      supabaseAdmin.from('services').select('*').eq('provider_id', data.id).order('created_at', { ascending: false }),
      supabaseAdmin.from('provider_portfolio_items').select('*').eq('provider_id', data.id).order('created_at', { ascending: false }),
    ]);

    res.json({ provider: { ...data, services: services || [], provider_portfolio_items: portfolio || [] } });
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
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Provider not found' });

    const [{ data: services }, { data: portfolio }] = await Promise.all([
      supabaseAdmin.from('services').select('*').eq('provider_id', data.id).eq('status', 'approved'),
      supabaseAdmin.from('provider_portfolio_items').select('*').eq('provider_id', data.id).order('created_at', { ascending: false }),
    ]);

    res.json({ provider: { ...data, services: services || [], provider_portfolio_items: portfolio || [] } });
  } catch (err) {
    console.error('[providers GET /:id]', err);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

// PUT /providers/me — update own profile
router.put('/me', requireAuth, requireProvider, async (req, res) => {
  try {
    const allowed = [
      'display_name','avatar','bio','categories','provider_type',
      'social_links','coach_games','coach_rank','coach_availability','hourly_rate',
      'influencer_platforms','audience_size','avg_views_per_post','slug',
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Validate slug uniqueness if provided
    if (updates.slug) {
      updates.slug = updates.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const { data: existing } = await supabaseAdmin
        .from('service_provider_profiles')
        .select('id')
        .eq('slug', updates.slug)
        .neq('user_id', req.user.id)
        .single();
      if (existing) return res.status(400).json({ error: 'Slug already taken' });
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

// GET /providers/slug/:slug — public profile by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_provider_profiles')
      .select('*')
      .eq('slug', req.params.slug)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Provider not found' });

    const [{ data: services }, { data: portfolio }] = await Promise.all([
      supabaseAdmin.from('services').select('*').eq('provider_id', data.id).eq('status', 'approved'),
      supabaseAdmin.from('provider_portfolio_items').select('*').eq('provider_id', data.id).order('created_at', { ascending: false }),
    ]);

    res.json({ provider: { ...data, services: services || [], provider_portfolio_items: portfolio || [] } });
  } catch (err) {
    console.error('[providers GET /slug/:slug]', err);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

// POST /providers/portfolio — add portfolio item
router.post('/portfolio', requireAuth, requireProvider, async (req, res) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('service_provider_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const { title, description, image_url, video_url, tournament_name, type,
      client_name, deliverables, links, testimonial, service_id } = req.body;

    if (!title) return res.status(400).json({ error: 'title is required' });

    const insertData = {
      provider_id: profile.id,
      service_id: service_id || null,
      title,
      description: description || '',
      image_url: image_url || null,
      video_url: video_url || null,
      tournament_name: tournament_name || null,
    };
    // Extended fields added in migration 107 — include only if provided
    if (type !== undefined) insertData.type = type || 'general';
    if (client_name !== undefined) insertData.client_name = client_name || null;
    if (deliverables !== undefined) insertData.deliverables = Array.isArray(deliverables) ? deliverables : [];
    if (links !== undefined) insertData.links = Array.isArray(links) ? links : [];
    if (testimonial !== undefined) insertData.testimonial = testimonial || null;

    const { data, error } = await supabaseAdmin
      .from('provider_portfolio_items')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ item: data });
  } catch (err) {
    console.error('[providers POST /portfolio]', err);
    res.status(500).json({ error: 'Failed to add portfolio item' });
  }
});

// PUT /providers/portfolio/:id — update portfolio item
router.put('/portfolio/:id', requireAuth, requireProvider, async (req, res) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('service_provider_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    const allowed = ['title','description','image_url','video_url','tournament_name',
      'type','client_name','deliverables','links','testimonial','service_id'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const { data, error } = await supabaseAdmin
      .from('provider_portfolio_items')
      .update(updates)
      .eq('id', req.params.id)
      .eq('provider_id', profile.id)
      .select()
      .single();

    if (error) return res.status(404).json({ error: 'Item not found' });
    res.json({ item: data });
  } catch (err) {
    console.error('[providers PUT /portfolio/:id]', err);
    res.status(500).json({ error: 'Failed to update portfolio item' });
  }
});

// DELETE /providers/portfolio/:id
router.delete('/portfolio/:id', requireAuth, requireProvider, async (req, res) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('service_provider_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    const { error } = await supabaseAdmin
      .from('provider_portfolio_items')
      .delete()
      .eq('id', req.params.id)
      .eq('provider_id', profile.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('[providers DELETE /portfolio/:id]', err);
    res.status(500).json({ error: 'Failed to delete portfolio item' });
  }
});

export default router;
