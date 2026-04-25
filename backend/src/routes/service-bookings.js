import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOrganizer, requireProvider } from '../middleware/roleGuard.js';

const router = Router();

const HERU_FEE_RATE = 0.15;

// GET /service-bookings — list (organizer sees own, provider sees own)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let query;

    if (req.user.role === 'organizer') {
      query = supabaseAdmin
        .from('service_bookings')
        .select('*, services(title,category)')
        .eq('organizer_id', req.user.id)
        .order('created_at', { ascending: false });
    } else if (req.user.role === 'service_provider') {
      query = supabaseAdmin
        .from('service_bookings')
        .select('*, services(title,category)')
        .eq('provider_id', req.user.id)
        .order('created_at', { ascending: false });
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ bookings: data });
  } catch (err) {
    console.error('[service-bookings GET /]', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /service-bookings/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_bookings')
      .select('*, services(*)')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Booking not found' });

    if (data.organizer_id !== req.user.id && data.provider_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ booking: data });
  } catch (err) {
    console.error('[service-bookings GET /:id]', err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// POST /service-bookings — organizer creates booking
router.post('/', requireAuth, requireOrganizer, async (req, res) => {
  try {
    const { service_id, tournament_id, tournament_name, notes } = req.body;
    if (!service_id) return res.status(400).json({ error: 'service_id is required' });

    const { data: service, error: svcErr } = await supabaseAdmin
      .from('services')
      .select('*, service_provider_profiles(user_id)')
      .eq('id', service_id)
      .eq('is_approved', true)
      .eq('is_active', true)
      .single();

    if (svcErr || !service) return res.status(404).json({ error: 'Service not found or not available' });

    const price = service.price;
    const heruFee = Math.round(price * HERU_FEE_RATE * 100) / 100;
    const netToProvider = Math.round((price - heruFee) * 100) / 100;
    const providerId = service.service_provider_profiles.user_id;

    const { data, error } = await supabaseAdmin
      .from('service_bookings')
      .insert({
        service_id,
        provider_id: providerId,
        organizer_id: req.user.id,
        tournament_id: tournament_id || null,
        tournament_name: tournament_name || null,
        price,
        heru_fee: heruFee,
        net_to_provider: netToProvider,
        status: 'pending',
        escrow_status: 'held',
        notes: notes || '',
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ booking: data });
  } catch (err) {
    console.error('[service-bookings POST /]', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// PUT /service-bookings/:id/accept — provider accepts
router.put('/:id/accept', requireAuth, requireProvider, async (req, res) => {
  try {
    const { data: booking, error: fetchErr } = await supabaseAdmin
      .from('service_bookings')
      .select('*')
      .eq('id', req.params.id)
      .eq('provider_id', req.user.id)
      .single();

    if (fetchErr || !booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'pending') return res.status(400).json({ error: 'Booking is not pending' });

    const { data, error } = await supabaseAdmin
      .from('service_bookings')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ booking: data });
  } catch (err) {
    console.error('[service-bookings PUT /:id/accept]', err);
    res.status(500).json({ error: 'Failed to accept booking' });
  }
});

// PUT /service-bookings/:id/reject — provider rejects
router.put('/:id/reject', requireAuth, requireProvider, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_bookings')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('provider_id', req.user.id)
      .select()
      .single();

    if (error) return res.status(404).json({ error: 'Booking not found' });
    res.json({ booking: data });
  } catch (err) {
    console.error('[service-bookings PUT /:id/reject]', err);
    res.status(500).json({ error: 'Failed to reject booking' });
  }
});

// PUT /service-bookings/:id/complete — provider marks complete
router.put('/:id/complete', requireAuth, requireProvider, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_bookings')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('provider_id', req.user.id)
      .select()
      .single();

    if (error) return res.status(404).json({ error: 'Booking not found' });
    res.json({ booking: data });
  } catch (err) {
    console.error('[service-bookings PUT /:id/complete]', err);
    res.status(500).json({ error: 'Failed to mark complete' });
  }
});

// PUT /service-bookings/:id/release — organizer releases escrow
router.put('/:id/release', requireAuth, requireOrganizer, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_bookings')
      .update({
        escrow_status: 'released',
        payment_released_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('organizer_id', req.user.id)
      .eq('status', 'completed')
      .select()
      .single();

    if (error) return res.status(404).json({ error: 'Booking not found or not completed' });

    await supabaseAdmin.from('heru_revenue_ledger').insert({
      source_type: 'service_booking',
      source_id: data.id,
      gross_amount: data.price,
      heru_fee: data.heru_fee,
      net_amount: data.net_to_provider,
      currency: 'EGP',
    });

    res.json({ booking: data });
  } catch (err) {
    console.error('[service-bookings PUT /:id/release]', err);
    res.status(500).json({ error: 'Failed to release escrow' });
  }
});

// POST /service-bookings/:id/chat — add chat message
router.post('/:id/chat', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const { data: booking } = await supabaseAdmin
      .from('service_bookings')
      .select('chat, organizer_id, provider_id')
      .eq('id', req.params.id)
      .single();

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.organizer_id !== req.user.id && booking.provider_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const chat = booking.chat || [];
    chat.push({
      id: crypto.randomUUID(),
      sender_id: req.user.id,
      message,
      created_at: new Date().toISOString(),
    });

    const { data, error } = await supabaseAdmin
      .from('service_bookings')
      .update({ chat, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ booking: data });
  } catch (err) {
    console.error('[service-bookings POST /:id/chat]', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
