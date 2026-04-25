import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireSponsor } from '../middleware/roleGuard.js';

const router = Router();

router.get('/me', requireAuth, requireSponsor, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('sponsor_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
    if (error) return res.status(404).json({ error: 'Sponsor profile not found' });
    res.json({ sponsor: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/me', requireAuth, requireSponsor, async (req, res) => {
  try {
    const allowed = ['brand_name','brand_logo','industry','description','website','location','social_links'];
    const updates = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const { data, error } = await supabaseAdmin
      .from('sponsor_profiles')
      .update(updates)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ sponsor: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/me/dashboard', requireAuth, requireSponsor, async (req, res) => {
  try {
    const { data: sponsorships } = await supabaseAdmin
      .from('sponsorships')
      .select('*, sponsorship_packages(title,tournament_id,expected_reach,expected_impressions)')
      .eq('sponsor_id', req.user.id)
      .order('created_at', { ascending: false });

    const list = sponsorships || [];
    const totalSpend = list
      .filter(s => ['paid','active','completed'].includes(s.status))
      .reduce((sum, s) => sum + Number(s.amount), 0);

    res.json({
      sponsorships: list,
      total_spend: totalSpend,
      active_count: list.filter(s => s.status === 'active').length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

export default router;
