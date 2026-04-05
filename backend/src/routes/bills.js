import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET / - list own bills
router.get('/', requireAuth, async (req, res) => {
  try {
    const { payment_status, bill_type, tournament_id, limit = 50 } = req.query;
    let query = supabaseAdmin.from('bills').select('*');
    // If tournament_id filter, show all bills for that tournament (for shared bill view)
    if (tournament_id) {
      query = query.eq('tournament_id', tournament_id);
    } else {
      query = query.eq('payer_id', req.user.id);
    }
    if (payment_status) query = query.eq('payment_status', payment_status);
    if (bill_type) query = query.eq('bill_type', bill_type);
    query = query.order('created_at', { ascending: false }).limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /all - staff: list all bills
router.get('/all', requireAuth, async (req, res) => {
  try {
    const staffToken = req.headers['x-staff-token'];
    if (!staffToken) return res.status(403).json({ error: 'Staff access required' });
    const { payment_status, limit = 100 } = req.query;
    let query = supabaseAdmin.from('bills').select('*');
    if (payment_status) query = query.eq('payment_status', payment_status);
    query = query.order('created_at', { ascending: false }).limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /number/:billNumber - get by bill number (shared bill page)
router.get('/number/:billNumber', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('bills').select('*').eq('bill_number', req.params.billNumber).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Bill not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('bills').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Bill not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/pay - mark as paid
router.put('/:id/pay', requireAuth, async (req, res) => {
  try {
    const { data: bill } = await supabaseAdmin.from('bills').select('*').eq('id', req.params.id).single();
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    const { data, error } = await supabaseAdmin.from('bills').update({
      payment_status: 'paid',
      paid_amount: bill.grand_total,
      paid_date: new Date().toISOString().split('T')[0],
      payment_method: req.body.payment_method || 'test',
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id).select().single();
    if (error) throw error;

    // If co-organizer bill, grant access
    if (bill.bill_type === 'co_organizer' && bill.tournament_id) {
      const { data: tournament } = await supabaseAdmin.from('tournaments').select('co_organizers').eq('id', bill.tournament_id).single();
      if (tournament) {
        const updatedCoOrgs = (tournament.co_organizers || []).map(co =>
          co.organizer_id === bill.payer_id ? { ...co, access_granted: true } : co
        );
        await supabaseAdmin.from('tournaments').update({ co_organizers: updatedCoOrgs }).eq('id', bill.tournament_id);
      }

      // Update billing snapshot
      await supabaseAdmin.from('billing_snapshots').update({
        amount_paid: bill.grand_total,
        payment_status: 'paid',
      }).eq('organizer_id', bill.payer_id).eq('tournament_id', bill.tournament_id);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
