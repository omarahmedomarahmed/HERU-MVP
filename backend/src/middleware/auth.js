import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../lib/supabase.js';

/**
 * Middleware that verifies the caller's Supabase JWT.
 * Also handles impersonation tokens issued by staff god-mode endpoints.
 * On success it attaches `req.user` with { id, email, role }.
 * When impersonating, also attaches `req.impersonatedBy` (staff user_profile id).
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = header.split(' ')[1];

    // ── Check for impersonation token (signed with JWT_SECRET) ───────────────
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      try {
        const decoded = jwt.verify(token, jwtSecret);
        if (decoded && decoded.impersonation === true) {
          // Look up the target user directly by auth_user_id — skip Supabase auth
          const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('id, role, full_name, is_verified, disabled, auth_user_id')
            .eq('auth_user_id', decoded.sub)
            .single();

          if (!profile) {
            return res.status(401).json({ error: 'Impersonated user not found' });
          }

          if (profile.disabled) {
            return res.status(403).json({ error: 'Impersonated account is disabled' });
          }

          req.user = {
            id: profile.id,
            email: decoded.email || null,
            role: profile.role || decoded.role || 'gamer',
            full_name: profile.full_name || '',
            is_verified: profile.is_verified || false,
          };
          req.impersonatedBy = decoded.impersonated_by;
          req.accessToken = token;
          return next();
        }
      } catch (_jwtErr) {
        // Not a valid impersonation JWT — fall through to normal Supabase check
      }
    }

    // ── Normal Supabase JWT path ─────────────────────────────────────────────
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
