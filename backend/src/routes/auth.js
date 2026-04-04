import { Router } from 'express';
import crypto from 'crypto';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

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

    // Sign in to return a session
    const { data: session, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
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

    // Sign in to return a session
    const { data: session, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
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

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Fetch user profile
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
// POST /staff/login
// ---------------------------------------------------------------------------
router.post('/staff/login', async (req, res) => {
  try {
    const { email, access_key } = req.body;

    if (!email || !access_key) {
      return res.status(400).json({ error: 'Email and access key are required' });
    }

    // Validate access key
    const { data: keyRecord, error: keyError } = await supabaseAdmin
      .from('staff_access_keys')
      .select('*')
      .eq('access_key', access_key)
      .eq('staff_email', email)
      .eq('is_active', true)
      .single();

    if (keyError || !keyRecord) {
      return res.status(401).json({ error: 'Invalid staff credentials' });
    }

    // Look up the user by email
    const { data: userList, error: userListError } = await supabaseAdmin.auth.admin.listUsers();

    if (userListError) {
      return res.status(500).json({ error: 'Failed to look up user' });
    }

    const user = userList.users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'No user account found for this email' });
    }

    // Verify role is admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'User is not an admin' });
    }

    // Update access key usage
    await supabaseAdmin
      .from('staff_access_keys')
      .update({
        use_count: (keyRecord.use_count || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', keyRecord.id);

    // Create staff session (24h expiry)
    const sessionToken = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('staff_sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        staff_email: email,
        staff_name: keyRecord.staff_name,
        access_key_id: keyRecord.id,
        expires_at: expiresAt,
        is_active: true,
        ip_address: req.ip || req.connection?.remoteAddress,
        user_agent: req.headers['user-agent'] || '',
      })
      .select()
      .single();

    if (sessionError) {
      console.error('[staff/login] session creation error:', sessionError);
      return res.status(500).json({ error: 'Failed to create staff session' });
    }

    res.json({
      user: {
        id: user.id,
        email,
        role: 'admin',
        full_name: keyRecord.staff_name,
      },
      staff_session: {
        session_token: sessionToken,
        expires_at: expiresAt,
        staff_name: keyRecord.staff_name,
      },
    });
  } catch (err) {
    console.error('[staff/login]', err);
    res.status(500).json({ error: 'Staff login failed' });
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

    const result = { user: req.user };

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
