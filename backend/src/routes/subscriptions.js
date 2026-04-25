import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireSponsor } from '../middleware/roleGuard.js';

const router = Router();
const PLAN_PRICES = {
  starter:  { monthly: 150000, annual: 1500000 },
  growth:   { monthly: 250000, annual: 2500000 },
  premium:  { monthly: 500000, annual: 5000000 },
  // legacy aliases kept for existing DB rows
  pro:        { monthly: 150000, annual: 1500000 },
  enterprise: { monthly: 500000, annual: 5000000 },
};

router.get('/me', requireAuth, requireSponsor, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('subscriptions').select('*').eq('sponsor_id', req.user.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1).single();
    if (error) return res.json({ subscription: null });
    res.json({ subscription: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

router.post('/', requireAuth, requireSponsor, async (req, res) => {
  try {
    const { plan, billing_cycle = 'monthly' } = req.body;
    if (!plan || !PLAN_PRICES[plan]) return res.status(400).json({ error: 'Invalid plan. Choose: starter, growth, or premium' });
    if (!['monthly','annual'].includes(billing_cycle)) return res.status(400).json({ error: 'billing_cycle must be monthly or annual' });
    await supabaseAdmin.from('subscriptions').update({ status: 'cancelled' }).eq('sponsor_id', req.user.id).eq('status', 'active');
    const amount = PLAN_PRICES[plan][billing_cycle];
    const renewalDate = new Date();
    if (billing_cycle === 'monthly') renewalDate.setMonth(renewalDate.getMonth() + 1);
    else renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    const { data, error } = await supabaseAdmin.from('subscriptions').insert({
      sponsor_id: req.user.id, plan, status: 'active', amount, billing_cycle,
      renewal_date: renewalDate.toISOString().split('T')[0],
    }).select().single();
    if (error) throw error;
    await supabaseAdmin.from('sponsor_profiles').update({ subscription_plan: plan, subscription_status: 'active', subscription_renewal_date: renewalDate.toISOString().split('T')[0], updated_at: new Date().toISOString() }).eq('user_id', req.user.id);
    await supabaseAdmin.from('heru_revenue_ledger').insert({ source_type: 'subscription', source_id: data.id, gross_amount: amount, heru_fee: amount, net_amount: 0, currency: 'EGP' });
    res.status(201).json({ subscription: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

router.put('/cancel', requireAuth, requireSponsor, async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('subscriptions').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('sponsor_id', req.user.id).eq('status', 'active');
    if (error) throw error;
    await supabaseAdmin.from('sponsor_profiles').update({ subscription_plan: 'free', subscription_status: 'cancelled', updated_at: new Date().toISOString() }).eq('user_id', req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export default router;
