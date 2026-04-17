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

// GET /api/connect/discord/auth
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
  try {
    const { code, state, error } = req.query;
    if (error) return res.redirect(`${frontendBase}/gamer/connect?error=${error}`);
    if (!code || !state) return res.redirect(`${frontendBase}/gamer/connect?error=missing_params`);

    let stateData;
    try { stateData = JSON.parse(Buffer.from(state, 'base64url').toString()); }
    catch { return res.redirect(`${frontendBase}/gamer/connect?error=invalid_state`); }

    const { userId } = stateData;
    if (!userId) return res.redirect(`${frontendBase}/gamer/connect?error=invalid_state`);

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

    res.redirect(`${frontendBase}/gamer/connect?discord=connected`);
  } catch (err) {
    console.error('[connect/discord/callback]', err.message);
    res.redirect(`${frontendBase}/gamer/connect?error=discord_failed`);
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

// GET /api/connect/riot/accounts
router.get('/riot/accounts', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('riot_accounts').select('*').eq('user_id', req.user.id).order('created_at');
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
    res.status(201).json(newAccount);
  } catch (err) {
    console.error('[connect/riot/link]', err.message);
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
