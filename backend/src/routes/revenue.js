import express from 'express';
import { supabase } from '../lib/supabase.js';
import { requireStaff } from '../middleware/staffGuard.js';

const router = express.Router();

router.get('/ledger', requireStaff, async (req, res) => {
  try {
    const { data: entries, error } = await supabase
      .from('heru_revenue_ledger')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ entries: entries || [] });
  } catch (err) {
    console.error('revenue ledger error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
