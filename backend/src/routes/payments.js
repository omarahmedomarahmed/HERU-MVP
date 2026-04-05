import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { verifyHmac } from '../lib/paymob.js';

const router = Router();

// POST /paymob/callback - Paymob webhook
router.post('/paymob/callback', async (req, res) => {
  try {
    const { obj } = req.body;
    if (!obj) return res.status(400).json({ error: 'Invalid payload' });

    // Verify HMAC — mandatory for payment integrity
    const hmac = req.query.hmac || req.headers['x-paymob-hmac'];
    if (!process.env.PAYMOB_HMAC_SECRET) {
      console.error('[payments] PAYMOB_HMAC_SECRET not configured — rejecting callback');
      return res.status(500).json({ error: 'Payment verification not configured' });
    }
    if (!hmac || !verifyHmac(obj, hmac)) {
      return res.status(401).json({ error: 'Invalid or missing HMAC signature' });
    }

    const merchantOrderId = obj.order?.merchant_order_id;
    const transactionId = obj.id?.toString();
    const success = obj.success === true || obj.success === 'true';

    if (!merchantOrderId) return res.status(400).json({ error: 'No merchant_order_id' });

    // Find bill by bill_number
    const { data: bill } = await supabaseAdmin.from('bills').select('*').eq('bill_number', merchantOrderId).single();
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    if (success) {
      // Mark paid
      await supabaseAdmin.from('bills').update({
        payment_status: 'paid',
        paid_amount: bill.grand_total,
        paid_date: new Date().toISOString().split('T')[0],
        payment_method: 'paymob',
        paymob_order_id: obj.order?.id?.toString(),
        paymob_transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      }).eq('id', bill.id);

      // Handle co-organizer access grant
      if (bill.bill_type === 'co_organizer' && bill.tournament_id) {
        const { data: tournament } = await supabaseAdmin.from('tournaments').select('co_organizers').eq('id', bill.tournament_id).single();
        if (tournament) {
          const updatedCoOrgs = (tournament.co_organizers || []).map(co =>
            co.organizer_id === bill.payer_id ? { ...co, access_granted: true } : co
          );
          await supabaseAdmin.from('tournaments').update({ co_organizers: updatedCoOrgs }).eq('id', bill.tournament_id);
        }

        await supabaseAdmin.from('billing_snapshots').update({
          amount_paid: bill.grand_total,
          payment_status: 'paid',
        }).eq('organizer_id', bill.payer_id).eq('tournament_id', bill.tournament_id);
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
