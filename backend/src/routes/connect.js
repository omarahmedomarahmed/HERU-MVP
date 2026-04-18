import { Router } from 'express';
import { createRequire } from 'module';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import * as discord from '../lib/connect/discord.js';
import * as riot from '../lib/connect/riot.js';
import crypto from 'crypto';

const router = Router();
const require = createRequire(import.meta.url);

// GET /api/connect/status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [{ data: discordAccounts }, { data: riotAccounts }] = await Promise.all([
      supabaseAdmin.from('connected_accounts').select('id,platform,platform_username,platform_avatar,is_active,last_synced_at,created_at').eq('user_id', userId),
      supabaseAdmin.from('riot_accounts').select('id,game_key,game_name,tag_line,region,rank_tier,rank_division,rank_lp,wins,losses,summoner_level,profile_icon_id,is_primary,is_public,last_synced_at').eq('user_id', userId).order('created_at'),
    ]);
    const hasDiscord = (discordAccounts || []).some(a => a.platform === 'discord' && a.is_active);
    const hasRiot = (riotAccounts || []).length > 0;
    res.json({ discord: discordAccounts || [], riot: riotAccounts || [], is_complete: hasDiscord && hasRiot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/connect/discord/auth-url — returns JSON so frontend can redirect
router.get('/discord/auth-url', requireAuth, (req, res) => {
  const state = Buffer.from(JSON.stringify({
    userId: req.user.id,
    nonce: crypto.randomBytes(16).toString('hex'),
  })).toString('base64url');
  res.json({ url: discord.getOAuthUrl(state) });
});

// GET /api/connect/discord/auth — legacy browser-redirect flow
router.get('/discord/auth', requireAuth, (req, res) => {
  const state = Buffer.from(JSON.stringify({
    userId: req.user.id,
    nonce: crypto.randomBytes(16).toString('hex'),
  })).toString('base64url');
  res.redirect(discord.getOAuthUrl(state));
});

// GET /api/connect/discord/callback
router.get('/discord/callback', async (req, res) => {
  const frontendBase = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const connectTab = `${frontendBase}/gamer/profile?tab=connect`;
  try {
    const { code, state, error } = req.query;
    if (error) return res.redirect(`${connectTab}&error=${error}`);
    if (!code || !state) return res.redirect(`${connectTab}&error=missing_params`);

    let stateData;
    try { stateData = JSON.parse(Buffer.from(state, 'base64url').toString()); }
    catch { return res.redirect(`${connectTab}&error=invalid_state`); }

    const { userId } = stateData;
    if (!userId) return res.redirect(`${connectTab}&error=invalid_state`);

    const tokens = await discord.exchangeCode(code);
    const discordUser = await discord.getMe(tokens.access_token);
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await supabaseAdmin.from('connected_accounts').upsert({
      user_id: userId,
      platform: 'discord',
      platform_user_id: discordUser.id,
      platform_username: discordUser.discriminator && discordUser.discriminator !== '0'
        ? `${discordUser.username}#${discordUser.discriminator}`
        : discordUser.username,
      platform_avatar: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null,
      platform_email: discordUser.email || null,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      token_expires_at: tokenExpiresAt,
      scopes: tokens.scope ? tokens.scope.split(' ') : [],
      raw_data: discordUser,
      is_active: true,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,platform' });

    res.redirect(`${connectTab}&discord=connected`);
  } catch (err) {
    console.error('[connect/discord/callback]', err.message);
    res.redirect(`${connectTab}&error=discord_failed`);
  }
});

// DELETE /api/connect/discord
router.delete('/discord', requireAuth, async (req, res) => {
  try {
    await supabaseAdmin.from('connected_accounts').delete().eq('user_id', req.user.id).eq('platform', 'discord');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/connect/bot-install-url
router.get('/bot-install-url', (req, res) => {
  res.json({ url: discord.getBotInstallUrl() });
});

// GET /api/connect/riot/accounts — current user's accounts (all, including private)
router.get('/riot/accounts', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('riot_accounts').select('*').eq('user_id', req.user.id).order('created_at');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/connect/discord/public/:userId — public Discord username for any user
router.get('/discord/public/:userId', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('connected_accounts')
      .select('platform_username,platform_avatar')
      .eq('user_id', req.params.userId)
      .eq('platform', 'discord')
      .eq('is_active', true)
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/connect/riot/public/:userId — public Riot accounts for any user (for profiles, team pages)
router.get('/riot/public/:userId', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('riot_accounts')
      .select('id,game_key,game_name,tag_line,region,rank_tier,rank_division,rank_lp,wins,losses,summoner_level,profile_icon_id,is_primary,champion_masteries,match_history_cache,total_mastery_score,hot_streak,flex_rank_tier,flex_rank_division,flex_rank_lp,flex_wins,flex_losses,last_synced_at,val_rank_tier,val_rank_rating,val_wins')
      .eq('user_id', req.params.userId)
      .eq('is_public', true)
      .order('is_primary', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/connect/riot/public-batch — public Riot accounts for multiple users at once
// Body: { user_ids: ['uuid1', 'uuid2', ...] }
router.post('/riot/public-batch', async (req, res) => {
  try {
    const { user_ids } = req.body;
    if (!Array.isArray(user_ids) || user_ids.length === 0) return res.json([]);
    const { data, error } = await supabaseAdmin
      .from('riot_accounts')
      .select('id,user_id,game_key,game_name,tag_line,region,rank_tier,rank_division,rank_lp,wins,losses,summoner_level,profile_icon_id,is_primary,champion_masteries,val_rank_tier,val_rank_rating,last_synced_at')
      .in('user_id', user_ids.slice(0, 50))
      .eq('is_public', true)
      .order('is_primary', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/connect/riot/link
router.post('/riot/link', requireAuth, async (req, res) => {
  try {
    const { gameName, tagLine, region, game } = req.body;
    if (!gameName || !tagLine || !region || !game) {
      return res.status(400).json({ error: 'gameName, tagLine, region, game are required' });
    }
    if (!['lol', 'valorant'].includes(game)) {
      return res.status(400).json({ error: 'game must be lol or valorant' });
    }

    const account = await riot.lookupByRiotId(gameName, tagLine, region);
    if (!account) return res.status(404).json({ error: 'Riot account not found. Check your Riot ID and region.' });

    const { puuid } = account;

    const { data: existing } = await supabaseAdmin.from('riot_accounts').select('id').eq('user_id', req.user.id).eq('puuid', puuid).eq('game_key', game).single();
    if (existing) return res.status(409).json({ error: 'This Riot account is already linked to your profile' });

    let statsData = {};
    if (game === 'lol') statsData = await riot.syncLolStats(puuid, region);
    else statsData = await riot.syncValorantStats(puuid, region);

    const { count } = await supabaseAdmin.from('riot_accounts').select('id', { count: 'exact', head: true }).eq('user_id', req.user.id).eq('game_key', game);

    const { data: newAccount, error } = await supabaseAdmin.from('riot_accounts').insert({
      user_id: req.user.id,
      game_key: game,
      game_name: account.gameName || gameName,
      tag_line: account.tagLine || tagLine,
      puuid,
      region,
      is_primary: count === 0,
      is_public: true,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...statsData,
    }).select().single();

    if (error) throw error;

    // Auto-populate gamer profile username + avatar on first ever Riot link
    const { count: totalRiot } = await supabaseAdmin
      .from('riot_accounts').select('id', { count: 'exact', head: true }).eq('user_id', req.user.id);
    if (totalRiot === 1) {
      const { data: gamerProfile } = await supabaseAdmin
        .from('gamer_profiles').select('id,username,avatar').eq('user_id', req.user.id).single();
      if (gamerProfile && (!gamerProfile.username || !gamerProfile.avatar)) {
        const updates = {};
        if (!gamerProfile.username) updates.username = newAccount.game_name;
        if (!gamerProfile.avatar && newAccount.profile_icon_id) {
          updates.avatar = `https://ddragon.leagueoflegends.com/cdn/16.8.1/img/profileicon/${newAccount.profile_icon_id}.png`;
        }
        if (Object.keys(updates).length > 0) {
          updates.updated_at = new Date().toISOString();
          await supabaseAdmin.from('gamer_profiles').update(updates).eq('user_id', req.user.id);
          newAccount._profile_updated = updates;
        }
      }
    }

    res.status(201).json(newAccount);
  } catch (err) {
    console.error('[connect/riot/link]', err.message);
    if (err.message?.includes('401') || err.message?.includes('Forbidden')) {
      return res.status(503).json({ error: 'Riot API key is invalid or expired. Please update RIOT_API_KEY in the backend environment.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/connect/riot/:accountId
router.delete('/riot/:accountId', requireAuth, async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('riot_accounts').delete().eq('id', req.params.accountId).eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/connect/riot/:accountId/sync
router.post('/riot/:accountId/sync', requireAuth, async (req, res) => {
  try {
    const { data: account, error: fetchErr } = await supabaseAdmin.from('riot_accounts').select('*').eq('id', req.params.accountId).eq('user_id', req.user.id).single();
    if (fetchErr || !account) return res.status(404).json({ error: 'Account not found' });

    let statsData = {};
    if (account.game_key === 'lol') statsData = await riot.syncLolStats(account.puuid, account.region);
    else statsData = await riot.syncValorantStats(account.puuid, account.region);

    const { data: updated, error } = await supabaseAdmin.from('riot_accounts').update({ ...statsData, last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', req.params.accountId).select().single();
    if (error) throw error;
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/connect/riot/:accountId
router.patch('/riot/:accountId', requireAuth, async (req, res) => {
  try {
    const { is_public, is_primary } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (is_public !== undefined) updates.is_public = is_public;
    if (is_primary !== undefined) updates.is_primary = is_primary;
    const { data, error } = await supabaseAdmin.from('riot_accounts').update(updates).eq('id', req.params.accountId).eq('user_id', req.user.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
