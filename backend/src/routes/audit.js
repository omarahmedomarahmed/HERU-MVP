import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Helper used by other routes to log
export async function logAudit({ actor_id, actor_name, actor_role, action, entity_type, entity_id, details, ip_address }) {
  try {
    await supabaseAdmin.from('audit_trail').insert({
      actor_id, actor_name, actor_role,
      action, entity_type, entity_id: String(entity_id || ''),
      details: details || {},
      ip_address,
      created_at: new Date().toISOString(),
    });
  } catch (_) { /* audit logging is best-effort */ }
}

// GET /audit — staff only
router.get('/', requireAuth, async (req, res) => {
  try {
    const { entity_type, actor_id, limit = 100, offset = 0 } = req.query;
    let q = supabaseAdmin.from('audit_trail').select('*');
    if (entity_type) q = q.eq('entity_type', entity_type);
    if (actor_id) q = q.eq('actor_id', actor_id);
    q = q.order('created_at', { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
