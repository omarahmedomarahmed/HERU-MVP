import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing required environment variables: SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY) must be set'
  );
}

// ---------------------------------------------------------------------------
// Admin client – uses the service-role key so it bypasses RLS.
// Use this for all trusted backend operations (inserts, updates, deletes).
// ---------------------------------------------------------------------------

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '[supabase] SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'Admin operations will fall back to the anon key (RLS will apply).'
  );
}

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ---------------------------------------------------------------------------
// Per-request client – injects the caller's JWT so RLS policies see the
// correct auth.uid().  Use this when the query MUST respect row-level
// security (e.g. reading a user's own data).
// ---------------------------------------------------------------------------

export function createSupabaseClient(accessToken) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };
