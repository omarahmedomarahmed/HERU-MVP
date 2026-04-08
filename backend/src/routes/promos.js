import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireStaff } from '../middleware/staffGuard.js';

const router = Router();

// POST /validate — validate a promo code for a gamer
router.post('/validate', requireAuth, async (req, res) => {
  try {
    const { code, gamer_id } = req.body;
    if (!code) return res.status(400).json({ error: 'code is required' });

    const { data, error } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Invalid or expired promo code' });
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return res.status(400).json({ error: 'This promo code has expired' });
    }

    // Check single-use codes (gamer-specific)
    if (data.gamer_id && data.gamer_id !== (gamer_id || req.user.id)) {
      return res.status(403).json({ error: 'This code is not valid for your account' });
    }

    // Check usage limit
    if (data.max_uses && data.use_count >= data.max_uses) {
      return res.status(400).json({ error: 'This promo code has reached its usage limit' });
    }

    // Increment use count
    await supabaseAdmin
      .from('promo_codes')
      .update({ use_count: (data.use_count || 0) + 1 })
      .eq('id', data.id);

    res.json({
      id: data.id,
      code: data.code,
      discount_percent: data.discount_percent,
      description: data.description,
    });
  } catch (err) {
    console.error('[promos/validate]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET / — list all promo codes (staff only)
router.get('/', requireAuth, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / — create promo code (staff only)
router.post('/', requireAuth, requireStaff, async (req, res) => {
  try {
    const { code, discount_percent, description, max_uses, expires_at, gamer_id } = req.body;
    if (!code || !discount_percent) return res.status(400).json({ error: 'code and discount_percent required' });

    const { data, error } = await supabaseAdmin
      .from('promo_codes')
      .insert({
        code: code.toUpperCase().trim(),
        discount_percent: Number(discount_percent),
        description,
        max_uses: max_uses || null,
        expires_at: expires_at || null,
        gamer_id: gamer_id || null,
        is_active: true,
        use_count: 0,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id — deactivate (staff only)
router.delete('/:id', requireAuth, requireStaff, async (req, res) => {
  try {
    await supabaseAdmin
      .from('promo_codes')
      .update({ is_active: false })
      .eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
