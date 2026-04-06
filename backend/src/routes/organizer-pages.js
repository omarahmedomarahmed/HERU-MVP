import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// GET /:organizer_id - get page config (public)
router.get('/:organizer_id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('organizer_page_config')
      .select('*')
      .eq('organizer_id', req.params.organizer_id)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    res.json(data || { layout_template: 'modern', sections: [], show_stats: true, show_portfolio: true, show_social: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /me - update own page config
router.put('/me', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = { ...req.body, organizer_id: userId, updated_at: new Date().toISOString() };

    const { data, error } = await supabaseAdmin
      .from('organizer_page_config')
      .upsert(updates, { onConflict: 'organizer_id' })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
