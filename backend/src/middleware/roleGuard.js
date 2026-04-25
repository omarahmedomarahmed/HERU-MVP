/**
 * Returns middleware that checks req.user.role against allowed roles.
 * Must be used AFTER requireAuth.
 *
 * Usage: router.post('/', requireAuth, requireRole('organizer'), handler)
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
}

// Named convenience exports used by route files
export const requireGamer        = requireRole('gamer');
export const requireOrganizer    = requireRole('organizer');
export const requireSponsor      = requireRole('sponsor');
export const requireProvider     = requireRole('service_provider');
export const requireAdmin        = requireRole('admin');
export const requireOrgOrAdmin   = requireRole('organizer', 'admin');
