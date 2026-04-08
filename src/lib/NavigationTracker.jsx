import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Navigation tracker - logs page views for analytics
export default function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    // Optional: add analytics here (e.g. Plausible, PostHog)
    // For now, just log to console in dev
    if (import.meta.env.DEV) {
      console.log('[nav]', location.pathname);
    }
  }, [location]);

  return null;
}
