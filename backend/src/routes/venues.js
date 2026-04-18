import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireStaff } from '../middleware/staffGuard.js';

const router = Router();

// GET /api/venues — organizer sees own submissions
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('venue_submissions')
      .select('*')
      .eq('organizer_id', req.user.id)
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/venues — organizer submits a venue
router.post('/', requireAuth, async (req, res) => {
  try {
    const { venue_name, venue_address, city, country, capacity, price_per_day, description, amenities, images, contact_number, contact_email, organizer_brand } = req.body;
    if (!venue_name || !venue_address) return res.status(400).json({ error: 'venue_name and venue_address are required' });
    const { data, error } = await supabaseAdmin
      .from('venue_submissions')
      .insert({
        organizer_id: req.user.id,
        organizer_brand: organizer_brand || null,
        venue_name, venue_address, city, country: country || 'Egypt',
        capacity, price_per_day, description,
        amenities: amenities || [],
        images: images || [],
        contact_number, contact_email,
        status: 'pending',
      })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/venues/:id — organizer updates pending submission
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { data: existing } = await supabaseAdmin.from('venue_submissions').select('organizer_id,status').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.organizer_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (existing.status !== 'pending') return res.status(400).json({ error: 'Cannot edit a reviewed submission' });
    const allowed = ['venue_name','venue_address','city','country','capacity','price_per_day','description','amenities','images','contact_number','contact_email'];
    const updates = { updated_at: new Date().toISOString() };
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const { data, error } = await supabaseAdmin.from('venue_submissions').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Staff ────────────────────────────────────────────────────────────────────

// GET /api/venues/staff/all — staff sees all submissions
router.get('/staff/all', requireStaff, async (req, res) => {
  try {
    const { status } = req.query;
    let q = supabaseAdmin.from('venue_submissions').select('*').order('submitted_at', { ascending: false });
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/venues/staff/:id/review — staff approves or rejects
router.put('/staff/:id/review', requireStaff, async (req, res) => {
  try {
    const { status, staff_notes } = req.body;
    if (!['approved','rejected'].includes(status)) return res.status(400).json({ error: 'status must be approved or rejected' });

    const { data: submission, error: fetchErr } = await supabaseAdmin.from('venue_submissions').select('*').eq('id', req.params.id).single();
    if (fetchErr || !submission) return res.status(404).json({ error: 'Not found' });

    const updates = { status, staff_notes: staff_notes || null, reviewed_at: new Date().toISOString(), reviewed_by: req.staffUser?.id, updated_at: new Date().toISOString() };

    // If approved: auto-create marketplace item in venue category
    if (status === 'approved') {
      const { data: item } = await supabaseAdmin.from('marketplace_items').insert({
        title: submission.venue_name,
        description: `${submission.venue_address}${submission.city ? ', ' + submission.city : ''}. ${submission.description || ''}`.trim(),
        category: 'venue',
        type: 'venue',
        price: submission.price_per_day || 0,
        image: submission.images?.[0] || null,
        is_active: true,
      }).select().single();
      if (item) updates.marketplace_item_id = item.id;
    }

    const { data, error } = await supabaseAdmin.from('venue_submissions').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
