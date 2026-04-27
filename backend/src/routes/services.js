import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireProvider } from '../middleware/roleGuard.js';

const router = Router();

// GET /services — list services (approved by default; staff can filter by any status)
router.get('/', async (req, res) => {
  try {
    const { category, provider_id, status, limit = 50, offset = 0 } = req.query;

    // Determine if request comes from a valid staff session
    let isAdmin = false;
    const staffToken = req.headers['x-staff-token'];
    if (staffToken) {
      const { data: session } = await supabaseAdmin
        .from('staff_sessions')
        .select('id')
        .eq('session_token', staffToken)
        .eq('is_active', true)
        .single();
      if (session) isAdmin = true;
    }

    let query = supabaseAdmin
      .from('services')
      .select('*, service_provider_profiles(id,display_name,avatar,rating,is_approved,approval_status)')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    // Staff can filter by any status; public always gets approved only
    if (isAdmin && status) {
      query = query.eq('status', status);
    } else {
      query = query.eq('status', 'approved');
    }

    if (category) query = query.eq('category', category);
    if (provider_id) query = query.eq('provider_id', provider_id);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ services: data });
  } catch (err) {
    console.error('[services GET /]', err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// GET /services/categories — list service categories with sub-categories
router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_categories')
      .select('*')
      .order('sort_order');
    if (error) throw error;

    const topLevel = data.filter(c => !c.parent_id);
    const tree = topLevel.map(cat => ({
      ...cat,
      children: data.filter(c => c.parent_id === cat.id),
    }));

    res.json({ categories: tree });
  } catch (err) {
    console.error('[services GET /categories]', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /services/mine — own services (provider only)
router.get('/mine', requireAuth, requireProvider, async (req, res) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('service_provider_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (!profile) return res.status(404).json({ error: 'Provider profile not found' });

    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('provider_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ services: data });
  } catch (err) {
    console.error('[services GET /mine]', err);
    res.status(500).json({ error: 'Failed to fetch your services' });
  }
});

// GET /services/admin/pending — staff: pending unapproved services
router.get('/admin/pending', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*, service_provider_profiles(display_name)')
      .eq('is_approved', false)
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ services: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /services/admin/:id/approve
router.put('/admin/:id/approve', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { data, error } = await supabaseAdmin
      .from('services')
      .update({ is_approved: true, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ service: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /services/admin/:id/reject
router.put('/admin/:id/reject', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { data, error } = await supabaseAdmin
      .from('services')
      .update({ is_approved: false, is_active: false, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ service: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /services/:id — single service (public)
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*, service_provider_profiles(id,display_name,avatar,rating,bio,portfolio_url)')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Service not found' });
    res.json({ service: data });
  } catch (err) {
    console.error('[services GET /:id]', err);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// POST /services — create service (provider only, starts unapproved)
router.post('/', requireAuth, requireProvider, async (req, res) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('service_provider_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (!profile) return res.status(404).json({ error: 'Provider profile not found' });

    const {
      title, description, category, category_id, price, price_type,
      deliverables, portfolio_url, portfolio_images,
    } = req.body;

    if (!title || !category || price === undefined) {
      return res.status(400).json({ error: 'title, category, and price are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('services')
      .insert({
        provider_id: profile.id,
        title,
        description: description || '',
        category,
        price: Number(price),
        price_type: price_type || 'fixed',
        deliverables: Array.isArray(deliverables) ? deliverables : [],
        portfolio_images: Array.isArray(portfolio_images) ? portfolio_images : [],
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ service: data });
  } catch (err) {
    console.error('[services POST /]', err);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// PUT /services/:id — update own service
router.put('/:id', requireAuth, requireProvider, async (req, res) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('service_provider_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    const allowed = [
      'title','description','category','price','price_type',
      'deliverables','portfolio_images','portfolio_videos','availability',
    ];
    const updates = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const { data, error } = await supabaseAdmin
      .from('services')
      .update(updates)
      .eq('id', req.params.id)
      .eq('provider_id', profile.id)
      .select()
      .single();

    if (error) return res.status(404).json({ error: 'Service not found or not yours' });
    res.json({ service: data });
  } catch (err) {
    console.error('[services PUT /:id]', err);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// PUT /services/:id/approve — staff approve
router.put('/:id/approve', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { staff_adjusted_price, staff_notes } = req.body;
    const updateData = {
      status: 'approved',
      approved_by: req.user.id,
      approved_at: new Date().toISOString(),
      staff_notes: staff_notes || null,
    };
    if (staff_adjusted_price) updateData.staff_adjusted_price = staff_adjusted_price;
    const { data, error } = await supabaseAdmin
      .from('services')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ service: data });
  } catch (err) {
    console.error('[services PUT /:id/approve]', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /services/:id/reject — staff reject
router.put('/:id/reject', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { staff_notes } = req.body;
    const { data, error } = await supabaseAdmin
      .from('services')
      .update({ status: 'rejected', staff_notes: staff_notes || null, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ service: data });
  } catch (err) {
    console.error('[services PUT /:id/reject]', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /services/:id/suspend — staff suspend
router.put('/:id/suspend', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { data, error } = await supabaseAdmin
      .from('services')
      .update({ status: 'suspended', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ service: data });
  } catch (err) {
    console.error('[services PUT /:id/suspend]', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /services/:id — soft delete (deactivate)
router.delete('/:id', requireAuth, requireProvider, async (req, res) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('service_provider_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    const { error } = await supabaseAdmin
      .from('services')
      .update({ status: 'suspended', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('provider_id', profile.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('[services DELETE /:id]', err);
    res.status(500).json({ error: 'Failed to deactivate service' });
  }
});

export default router;
