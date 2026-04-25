import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOrganizer } from '../middleware/roleGuard.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { provider_id } = req.query;
    if (!provider_id) return res.status(400).json({ error: 'provider_id is required' });
    const { data, error } = await supabaseAdmin.from('reviews').select('*').eq('provider_id', provider_id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ reviews: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.post('/', requireAuth, requireOrganizer, async (req, res) => {
  try {
    const { booking_id, rating, comment } = req.body;
    if (!booking_id || !rating) return res.status(400).json({ error: 'booking_id and rating are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be between 1 and 5' });
    const { data: booking } = await supabaseAdmin.from('service_bookings').select('organizer_id, provider_id, status').eq('id', booking_id).single();
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.organizer_id !== req.user.id) return res.status(403).json({ error: 'Not your booking' });
    if (booking.status !== 'completed') return res.status(400).json({ error: 'Booking must be completed to review' });
    const { data, error } = await supabaseAdmin.from('reviews').insert({ booking_id, reviewer_id: req.user.id, provider_id: booking.provider_id, rating: Number(rating), comment: comment || '' }).select().single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'You already reviewed this booking' });
      throw error;
    }
    await supabaseAdmin.rpc('update_provider_rating', { p_provider_id: booking.provider_id });
    res.status(201).json({ review: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;
