import { Router } from 'express';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ---------------------------------------------------------------------------
// Separate client for signInWithPassword.
// NEVER call signInWithPassword on supabaseAdmin — it contaminates the
// service-role client's internal session, making subsequent DB queries use the
// user's JWT instead of the service-role key, which causes RLS failures.
// ---------------------------------------------------------------------------
function createAuthClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// POST /register/gamer
// ---------------------------------------------------------------------------
router.post('/register/gamer', async (req, res) => {
  try {
    const { email, password, full_name, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: 'gamer' },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // Create user_profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId,
        role: 'gamer',
        full_name: full_name || '',
        is_verified: false,
        disabled: false,
      });

    if (profileError) {
      console.error('[register/gamer] user_profiles insert error:', profileError);
    }

    // Create gamer_profile
    const { error: gamerError } = await supabaseAdmin
      .from('gamer_profiles')
      .insert({
        user_id: userId,
        username: username || full_name || email.split('@')[0],
        games: [],
        team_ids: [],
      });

    if (gamerError) {
      console.error('[register/gamer] gamer_profiles insert error:', gamerError);
    }

    // Sign in to return a session (use separate client to avoid contaminating supabaseAdmin)
    const authClient = createAuthClient();
    const { data: session, error: signInError } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return res.status(201).json({
        message: 'Account created. Please log in.',
        user: { id: userId, email, role: 'gamer' },
      });
    }

    res.status(201).json({
      user: { id: userId, email, role: 'gamer', full_name },
      session: {
        access_token: session.session.access_token,
        refresh_token: session.session.refresh_token,
        expires_at: session.session.expires_at,
      },
    });
  } catch (err) {
    console.error('[register/gamer]', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ---------------------------------------------------------------------------
// POST /register/organizer
// ---------------------------------------------------------------------------
router.post('/register/organizer', async (req, res) => {
  try {
    const { email, password, full_name, brand_name, location } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: 'organizer' },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // Create user_profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId,
        role: 'organizer',
        full_name: full_name || '',
        is_verified: false,
        disabled: false,
      });

    if (profileError) {
      console.error('[register/organizer] user_profiles insert error:', profileError);
    }

    // Create organizer_profile
    const { error: orgError } = await supabaseAdmin
      .from('organizer_profiles')
      .insert({
        user_id: userId,
        brand_name: brand_name || '',
        location: location || '',
      });

    if (orgError) {
      console.error('[register/organizer] organizer_profiles insert error:', orgError);
    }

    // Sign in to return a session (use separate client to avoid contaminating supabaseAdmin)
    const authClient = createAuthClient();
    const { data: session, error: signInError } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return res.status(201).json({
        message: 'Account created. Please log in.',
        user: { id: userId, email, role: 'organizer' },
      });
    }

    res.status(201).json({
      user: { id: userId, email, role: 'organizer', full_name },
      session: {
        access_token: session.session.access_token,
        refresh_token: session.session.refresh_token,
        expires_at: session.session.expires_at,
      },
    });
  } catch (err) {
    console.error('[register/organizer]', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ---------------------------------------------------------------------------
// POST /login
// ---------------------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const authClient = createAuthClient();
    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Fetch user profile (uses supabaseAdmin — service role, bypasses RLS)
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role, full_name, is_verified, disabled')
      .eq('id', data.user.id)
      .single();

    if (profile?.disabled) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role || 'gamer',
        full_name: profile?.full_name || '',
        is_verified: profile?.is_verified || false,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ---------------------------------------------------------------------------
// POST /staff/login  (email + password)
// ---------------------------------------------------------------------------
router.post('/staff/login', async (req, res) => {
  try {
    const { email, password, access_key } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!access_key) {
      return res.status(400).json({ error: 'Staff access key is required' });
    }

    // 1. Authenticate with Supabase Auth (separate client to avoid contaminating supabaseAdmin)
    const authClient = createAuthClient();
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ error: 'Invalid email or password', step: 'auth' });
    }

    const user = authData.user;

    // 2. Verify role is admin (uses supabaseAdmin — service role, bypasses RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[staff/login] profile lookup error:', profileError);
      return res.status(500).json({ error: 'Failed to verify admin role', step: 'role_check', detail: profileError.message });
    }

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.', step: 'role_check' });
    }

    // 2b. Validate StaffAccessKey
    const { data: keyRecord, error: keyError } = await supabaseAdmin
      .from('staff_access_keys')
      .select('*')
      .eq('access_key', access_key)
      .eq('is_active', true)
      .single();

    if (keyError || !keyRecord) {
      return res.status(403).json({ error: 'Invalid or inactive staff access key', step: 'access_key' });
    }

    // Update key usage stats
    await supabaseAdmin.from('staff_access_keys').update({
      use_count: (keyRecord.use_count || 0) + 1,
      last_used_at: new Date().toISOString(),
    }).eq('id', keyRecord.id);

    // 3. Create staff session (24h expiry) — uses supabaseAdmin (service role) to bypass RLS
    const sessionToken = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: sessionError } = await supabaseAdmin
      .from('staff_sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        staff_email: email,
        staff_name: profile.full_name || email,
        expires_at: expiresAt,
        is_active: true,
        ip_address: req.ip || req.connection?.remoteAddress,
        user_agent: req.headers['user-agent'] || '',
      })
      .select()
      .single();

    if (sessionError) {
      console.error('[staff/login] session creation error:', sessionError);
      return res.status(500).json({ error: 'Failed to create staff session', step: 'session_insert', detail: sessionError.message });
    }

    res.json({
      user: {
        id: user.id,
        email,
        role: 'admin',
        full_name: profile.full_name || '',
      },
      staff_session: {
        session_token: sessionToken,
        expires_at: expiresAt,
        staff_name: profile.full_name || email,
      },
    });
  } catch (err) {
    console.error('[staff/login]', err);
    res.status(500).json({ error: 'Staff login failed' });
  }
});

// ---------------------------------------------------------------------------
// POST /staff/validate  — check if a staff session token is still valid
// ---------------------------------------------------------------------------
router.post('/staff/validate', async (req, res) => {
  try {
    const staffToken = req.headers['x-staff-token'];
    if (!staffToken) {
      return res.status(401).json({ valid: false, error: 'No staff token provided' });
    }

    const { data: session, error } = await supabaseAdmin
      .from('staff_sessions')
      .select('id, user_id, staff_email, staff_name, expires_at, is_active')
      .eq('session_token', staffToken)
      .eq('is_active', true)
      .single();

    if (error || !session) {
      return res.status(401).json({ valid: false, error: 'Invalid or expired staff session' });
    }

    if (new Date(session.expires_at) < new Date()) {
      // Deactivate expired session
      await supabaseAdmin
        .from('staff_sessions')
        .update({ is_active: false })
        .eq('id', session.id);
      return res.status(401).json({ valid: false, error: 'Staff session expired' });
    }

    res.json({
      valid: true,
      user: {
        id: session.user_id,
        email: session.staff_email,
        full_name: session.staff_name,
        role: 'admin',
      },
    });
  } catch (err) {
    console.error('[staff/validate]', err);
    res.status(500).json({ valid: false, error: 'Validation failed' });
  }
});

// ---------------------------------------------------------------------------
// POST /staff/logout  — deactivate a staff session
// ---------------------------------------------------------------------------
router.post('/staff/logout', async (req, res) => {
  try {
    const staffToken = req.headers['x-staff-token'];
    if (staffToken) {
      await supabaseAdmin
        .from('staff_sessions')
        .update({ is_active: false })
        .eq('session_token', staffToken);
    }
    res.json({ message: 'Staff session ended' });
  } catch (err) {
    console.error('[staff/logout]', err);
    res.status(500).json({ error: 'Staff logout failed' });
  }
});

// ---------------------------------------------------------------------------
// POST /logout
// ---------------------------------------------------------------------------
router.post('/logout', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      await supabaseAdmin.auth.admin.signOut(token).catch(() => {});
    }

    // Also deactivate staff session if provided
    const staffToken = req.headers['x-staff-token'];
    if (staffToken) {
      await supabaseAdmin
        .from('staff_sessions')
        .update({ is_active: false })
        .eq('session_token', staffToken);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('[logout]', err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ---------------------------------------------------------------------------
// GET /me
// ---------------------------------------------------------------------------
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // Flatten user fields at top level so pages can use user.id directly
    const result = {
      id: userId,
      email: req.user.email,
      role,
      full_name: req.user.full_name || '',
      is_verified: req.user.is_verified || false,
      user: req.user,
    };

    if (role === 'gamer') {
      const { data: gamerProfile } = await supabaseAdmin
        .from('gamer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      result.gamer_profile = gamerProfile;
    } else if (role === 'organizer') {
      const { data: orgProfile } = await supabaseAdmin
        .from('organizer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      result.organizer_profile = orgProfile;
    }

    res.json(result);
  } catch (err) {
    console.error('[me]', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
