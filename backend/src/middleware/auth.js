import { supabaseAdmin } from '../lib/supabase.js';

/**
 * Middleware that verifies the caller's Supabase JWT.
 * On success it attaches `req.user` with { id, email, role }.
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = header.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch extended profile
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role, full_name, is_verified, disabled')
      .eq('id', user.id)
      .single();

    if (profile?.disabled) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'gamer',
      full_name: profile?.full_name || '',
      is_verified: profile?.is_verified || false,
    };
    req.accessToken = token;

    next();
  } catch (err) {
    console.error('[requireAuth]', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
