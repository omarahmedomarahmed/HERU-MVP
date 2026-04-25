import { Router } from 'express';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmailPassword(email, password) {
  if (!email || !password) return 'Email and password are required';
  if (!EMAIL_REGEX.test(email)) return 'Invalid email format';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password is too long';
  return null;
}

function createAuthClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// POST /register/gamer
router.post('/register/gamer', async (req, res) => {
  try {
    const { email, password, full_name, username } = req.body;
    const err = validateEmailPassword(email, password);
    if (err) return res.status(400).json({ error: err });

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name, role: 'gamer' },
    });
    if (authError) return res.status(400).json({ error: authError.message });
    const userId = authData.user.id;

    await supabaseAdmin.from('user_profiles').insert({ id: userId, role: 'gamer', full_name: full_name || '', is_verified: false, disabled: false });
    await supabaseAdmin.from('gamer_profiles').insert({ user_id: userId, username: username || full_name || email.split('@')[0], games: [], team_ids: [] });

    const authClient = createAuthClient();
    const { data: session, error: signInError } = await authClient.auth.signInWithPassword({ email, password });
    if (signInError) return res.status(201).json({ message: 'Account created. Please log in.', user: { id: userId, email, role: 'gamer' } });

    res.status(201).json({
      user: { id: userId, email, role: 'gamer', full_name },
      session: { access_token: session.session.access_token, refresh_token: session.session.refresh_token, expires_at: session.session.expires_at },
    });
  } catch (err) {
    console.error('[register/gamer]', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /register/organizer
router.post('/register/organizer', async (req, res) => {
  try {
    const { email, password, full_name, brand_name, location } = req.body;
    const err = validateEmailPassword(email, password);
    if (err) return res.status(400).json({ error: err });

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name, role: 'organizer' },
    });
    if (authError) return res.status(400).json({ error: authError.message });
    const userId = authData.user.id;

    await supabaseAdmin.from('user_profiles').insert({ id: userId, role: 'organizer', full_name: full_name || '', is_verified: false, disabled: false });
    await supabaseAdmin.from('organizer_profiles').insert({ user_id: userId, brand_name: brand_name || '', location: location || '' });

    const authClient = createAuthClient();
    const { data: session, error: signInError } = await authClient.auth.signInWithPassword({ email, password });
    if (signInError) return res.status(201).json({ message: 'Account created. Please log in.', user: { id: userId, email, role: 'organizer' } });

    res.status(201).json({
      user: { id: userId, email, role: 'organizer', full_name },
      session: { access_token: session.session.access_token, refresh_token: session.session.refresh_token, expires_at: session.session.expires_at },
    });
  } catch (err) {
    console.error('[register/organizer]', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /register/sponsor
router.post('/register/sponsor', async (req, res) => {
  try {
    const { email, password, full_name, brand_name, industry, website } = req.body;
    const err = validateEmailPassword(email, password);
    if (err) return res.status(400).json({ error: err });

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name, role: 'sponsor' },
    });
    if (authError) return res.status(400).json({ error: authError.message });
    const userId = authData.user.id;

    await supabaseAdmin.from('user_profiles').insert({ id: userId, role: 'sponsor', full_name: full_name || '', is_verified: false, disabled: false });
    await supabaseAdmin.from('sponsor_profiles').insert({ user_id: userId, brand_name: brand_name || '', industry: industry || '', website: website || '', subscription_plan: 'free' });

    const authClient = createAuthClient();
    const { data: session, error: signInError } = await authClient.auth.signInWithPassword({ email, password });
    if (signInError) return res.status(201).json({ message: 'Account created. Please log in.', user: { id: userId, email, role: 'sponsor' } });

    res.status(201).json({
      user: { id: userId, email, role: 'sponsor', full_name },
      session: { access_token: session.session.access_token, refresh_token: session.session.refresh_token, expires_at: session.session.expires_at },
    });
  } catch (err) {
    console.error('[register/sponsor]', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /register/provider
router.post('/register/provider', async (req, res) => {
  try {
    const { email, password, full_name, display_name, categories } = req.body;
    const err = validateEmailPassword(email, password);
    if (err) return res.status(400).json({ error: err });

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name, role: 'service_provider' },
    });
    if (authError) return res.status(400).json({ error: authError.message });
    const userId = authData.user.id;

    await supabaseAdmin.from('user_profiles').insert({ id: userId, role: 'service_provider', full_name: full_name || '', is_verified: false, disabled: false });
    await supabaseAdmin.from('service_provider_profiles').insert({
      user_id: userId,
      display_name: display_name || full_name || email.split('@')[0],
      categories: Array.isArray(categories) ? categories : [],
      approval_status: 'pending',
    });

    const authClient = createAuthClient();
    const { data: session, error: signInError } = await authClient.auth.signInWithPassword({ email, password });
    if (signInError) return res.status(201).json({ message: 'Account created. Please log in.', user: { id: userId, email, role: 'service_provider' } });

    res.status(201).json({
      user: { id: userId, email, role: 'service_provider', full_name },
      session: { access_token: session.session.access_token, refresh_token: session.session.refresh_token, expires_at: session.session.expires_at },
    });
  } catch (err) {
    console.error('[register/provider]', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const err = validateEmailPassword(email, password);
    if (err) return res.status(400).json({ error: err });

    const authClient = createAuthClient();
    const { data, error } = await authClient.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: 'Invalid email or password' });

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role, full_name, is_verified, disabled')
      .eq('id', data.user.id)
      .single();

    if (profile?.disabled) return res.status(403).json({ error: 'Account is disabled' });

    res.json({
      user: { id: data.user.id, email: data.user.email, role: profile?.role || 'gamer', full_name: profile?.full_name || '', is_verified: profile?.is_verified || false },
      session: { access_token: data.session.access_token, refresh_token: data.session.refresh_token, expires_at: data.session.expires_at },
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /staff/login
router.post('/staff/login', async (req, res) => {
  try {
    const { email, password, access_key } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (!access_key) return res.status(400).json({ error: 'Staff access key is required' });

    const authClient = createAuthClient();
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({ email, password });
    if (authError) return res.status(401).json({ error: 'Invalid credentials' });

    const { data: profile } = await supabaseAdmin.from('user_profiles').select('role, full_name').eq('id', authData.user.id).single();
    if (!profile || profile.role !== 'admin') return res.status(403).json({ error: 'Invalid credentials' });

    const { data: keyRecord } = await supabaseAdmin.from('staff_access_keys').select('*').eq('access_key', access_key).eq('is_active', true).single();
    if (!keyRecord) return res.status(403).json({ error: 'Invalid credentials' });

    await supabaseAdmin.from('staff_access_keys').update({ use_count: (keyRecord.use_count || 0) + 1, last_used_at: new Date().toISOString() }).eq('id', keyRecord.id);

    const sessionToken = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await supabaseAdmin.from('staff_sessions').insert({
      user_id: authData.user.id, session_token: sessionToken,
      staff_email: email, staff_name: profile.full_name || email,
      access_key_id: keyRecord.id, expires_at: expiresAt, is_active: true,
      ip_address: req.ip, user_agent: req.headers['user-agent'] || '',
    });

    res.json({
      user: { id: authData.user.id, email, role: 'admin', full_name: profile.full_name || '' },
      staff_session: { session_token: sessionToken, expires_at: expiresAt, staff_name: profile.full_name || email },
    });
  } catch (err) {
    console.error('[staff/login]', err);
    res.status(500).json({ error: 'Staff login failed' });
  }
});

// POST /staff/validate
router.post('/staff/validate', async (req, res) => {
  try {
    const staffToken = req.headers['x-staff-token'];
    if (!staffToken) return res.status(401).json({ valid: false, error: 'No staff token provided' });

    const { data: session } = await supabaseAdmin
      .from('staff_sessions')
      .select('id, user_id, staff_email, staff_name, expires_at, is_active')
      .eq('session_token', staffToken).eq('is_active', true).single();

    if (!session) return res.status(401).json({ valid: false, error: 'Invalid or expired staff session' });
    if (new Date(session.expires_at) < new Date()) {
      await supabaseAdmin.from('staff_sessions').update({ is_active: false }).eq('id', session.id);
      return res.status(401).json({ valid: false, error: 'Staff session expired' });
    }

    res.json({ valid: true, user: { id: session.user_id, email: session.staff_email, full_name: session.staff_name, role: 'admin' } });
  } catch (err) {
    console.error('[staff/validate]', err);
    res.status(500).json({ valid: false, error: 'Validation failed' });
  }
});

// POST /staff/logout
router.post('/staff/logout', async (req, res) => {
  try {
    const staffToken = req.headers['x-staff-token'];
    if (staffToken) await supabaseAdmin.from('staff_sessions').update({ is_active: false }).eq('session_token', staffToken);
    res.json({ message: 'Staff session ended' });
  } catch (err) {
    res.status(500).json({ error: 'Staff logout failed' });
  }
});

// POST /logout
router.post('/logout', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) await supabaseAdmin.auth.admin.signOut(header.split(' ')[1]).catch(() => {});
    const staffToken = req.headers['x-staff-token'];
    if (staffToken) await supabaseAdmin.from('staff_sessions').update({ is_active: false }).eq('session_token', staffToken);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// GET /me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const result = { id: userId, email: req.user.email, role, full_name: req.user.full_name || '', is_verified: req.user.is_verified || false, user: req.user };

    if (role === 'gamer') {
      const { data: gamerProfile } = await supabaseAdmin.from('gamer_profiles').select('*').eq('user_id', userId).single();
      result.gamer_profile = gamerProfile;
    } else if (role === 'organizer') {
      const { data: orgProfile } = await supabaseAdmin.from('organizer_profiles').select('*').eq('user_id', userId).single();
      result.organizer_profile = orgProfile;
    } else if (role === 'sponsor') {
      const { data: sponsorProfile } = await supabaseAdmin.from('sponsor_profiles').select('*').eq('user_id', userId).single();
      result.sponsor_profile = sponsorProfile;
    } else if (role === 'service_provider') {
      const { data: providerProfile } = await supabaseAdmin.from('service_provider_profiles').select('*').eq('user_id', userId).single();
      result.provider_profile = providerProfile;
    }

    res.json(result);
  } catch (err) {
    console.error('[me]', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
