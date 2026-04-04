import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://utlxvkwdcpwvdnkthksk.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bHh2a3dkY3B3dmRua3Roa3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDM3NzAsImV4cCI6MjA5MDgxOTc3MH0.maTgrS_ecWgo5nPOOkFsGzuEoU66kvru2bm4_X_HeMk';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
