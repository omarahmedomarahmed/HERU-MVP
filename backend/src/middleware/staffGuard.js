import { supabaseAdmin } from '../lib/supabase.js';

/**
 * Middleware that validates a staff session token.
 * Expects header: x-staff-token: <session_token>
 * Must be used AFTER requireAuth (so req.user exists).
 */
export async function requireStaff(req, res, next) {
  try {
    const staffToken = req.headers['x-staff-token'];
    if (!staffToken) {
      return res.status(401).json({ error: 'Staff session token required' });
    }

    const { data: session, error } = await supabaseAdmin
      .from('staff_sessions')
      .select('*')
      .eq('session_token', staffToken)
      .eq('is_active', true)
      .single();

    if (error || !session) {
      return res.status(401).json({ error: 'Invalid or inactive staff session' });
    }

    if (new Date(session.expires_at) < new Date()) {
      // Deactivate expired session
      await supabaseAdmin
        .from('staff_sessions')
        .update({ is_active: false })
        .eq('id', session.id);
      return res.status(401).json({ error: 'Staff session expired' });
    }

    req.staffSession = session;
    next();
  } catch (err) {
    console.error('[requireStaff]', err);
    return res.status(500).json({ error: 'Staff authentication failed' });
  }
}
