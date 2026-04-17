import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { createRequire } from 'module';

const router = Router();
const require = createRequire(import.meta.url);

function verifyBotSecret(req, res, next) {
  if (req.headers['x-bot-secret'] !== process.env.HERU_BOT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function verifyDiscordSignature(rawBody, headers) {
  const signature = headers['x-signature-ed25519'];
  const timestamp = headers['x-signature-timestamp'];
  if (!signature || !timestamp || !process.env.DISCORD_PUBLIC_KEY) return false;
  try {
    const nacl = require('tweetnacl');
    const msg = Buffer.from(timestamp + rawBody);
    const sig = Buffer.from(signature, 'hex');
    const key = Buffer.from(process.env.DISCORD_PUBLIC_KEY, 'hex');
    return nacl.sign.detached.verify(msg, sig, key);
  } catch {
    return false;
  }
}

// POST /api/bot/webhook
router.post('/webhook', (req, res) => {
  const rawBody = JSON.stringify(req.body);
  if (!verifyDiscordSignature(rawBody, req.headers)) {
    return res.status(401).send('Invalid signature');
  }
  const { type } = req.body;
  if (type === 1) return res.json({ type: 1 });
  if (type === 2) return res.json({ type: 5 });
  if (type === 3) {
    const customId = req.body.data?.custom_id || '';
    if (customId.startsWith('cancel_')) return res.json({ type: 4, data: { content: 'Action cancelled.' } });
    return res.json({ type: 4, data: { content: 'Processing...' } });
  }
  res.json({ type: 1 });
});

// GET /api/bot/install-url
router.get('/install-url', (req, res) => {
  const clientId = process.env.DISCORD_APPLICATION_ID || process.env.DISCORD_CLIENT_ID;
  const params = new URLSearchParams({ client_id: clientId, permissions: '2147485696', scope: 'bot applications.commands' });
  res.json({ url: `https://discord.com/oauth2/authorize?${params}` });
});

// GET /api/bot/profile/by-discord/:discordId
router.get('/profile/by-discord/:discordId', verifyBotSecret, async (req, res) => {
  try {
    const { data: account } = await supabaseAdmin.from('connected_accounts').select('user_id').eq('platform', 'discord').eq('platform_user_id', req.params.discordId).eq('is_active', true).single();
    if (!account) return res.status(404).json({ error: 'No HERU account linked to this Discord user' });

    const [{ data: profile }, { data: riotAccounts }] = await Promise.all([
      supabaseAdmin.from('gamer_profiles').select('id,username,bio,games,is_talent,team_ids').eq('user_id', account.user_id).single(),
      supabaseAdmin.from('riot_accounts').select('game_key,game_name,tag_line,rank_tier,rank_division,is_primary').eq('user_id', account.user_id).eq('is_public', true),
    ]);
    res.json({ userId: account.user_id, profile, riotAccounts: riotAccounts || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bot/tournaments/active
router.get('/tournaments/active', verifyBotSecret, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('tournaments').select('id,name,game,status,format,max_teams,schedule,total_cost,prizepool_total,tournament_image').in('status', ['published', 'live']).order('schedule').limit(10);
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bot/tournaments/:id/join
router.post('/tournaments/:id/join', verifyBotSecret, async (req, res) => {
  try {
    const { discordUserId, teamId } = req.body;
    const { data: account } = await supabaseAdmin.from('connected_accounts').select('user_id').eq('platform', 'discord').eq('platform_user_id', discordUserId).single();
    if (!account) return res.status(404).json({ error: 'Please link your Discord on heru.gg/gamer/connect first' });

    const { data: tournament } = await supabaseAdmin.from('tournaments').select('join_requests').eq('id', req.params.id).single();
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    const updated = [...(tournament.join_requests || []), { team_id: teamId, user_id: account.user_id, status: 'pending', created_at: new Date().toISOString() }];
    await supabaseAdmin.from('tournaments').update({ join_requests: updated }).eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bot/team/:id
router.get('/team/:id', verifyBotSecret, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('teams').select('id,name,logo,games,description,is_recruiting,members').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'Team not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bot/server/setup
router.post('/server/setup', verifyBotSecret, async (req, res) => {
  try {
    const { guildId, guildName, guildIcon, organizerUserId, notificationChannelId } = req.body;
    if (!guildId) return res.status(400).json({ error: 'guildId required' });
    const { data: orgProfile } = await supabaseAdmin.from('organizer_profiles').select('id').eq('user_id', organizerUserId).single();
    const { data, error } = await supabaseAdmin.from('bot_servers').upsert({
      discord_guild_id: guildId, discord_guild_name: guildName, discord_guild_icon: guildIcon,
      organizer_id: orgProfile?.id || null, notification_channel_id: notificationChannelId || null,
      added_by_user_id: organizerUserId || null, is_active: true, updated_at: new Date().toISOString(),
    }, { onConflict: 'discord_guild_id' }).select().single();
    if (error) throw error;
    res.json({ success: true, server: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bot/server/announce
router.post('/server/announce', verifyBotSecret, async (req, res) => {
  try {
    const { guildId, message, embed } = req.body;
    const { data: server } = await supabaseAdmin.from('bot_servers').select('notification_channel_id').eq('discord_guild_id', guildId).single();
    if (!server?.notification_channel_id) return res.status(404).json({ error: 'No notification channel set' });

    const discordRes = await fetch(`https://discord.com/api/v10/channels/${server.notification_channel_id}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message, embeds: embed ? [embed] : [] }),
    });
    if (!discordRes.ok) return res.status(500).json({ error: `Discord send failed: ${await discordRes.text()}` });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bot/agent/session/:discordId
router.get('/agent/session/:discordId', verifyBotSecret, async (req, res) => {
  try {
    const { channelId } = req.query;
    let query = supabaseAdmin.from('ai_agent_sessions').select('id,messages,last_active_at').eq('discord_user_id', req.params.discordId).eq('channel', 'discord');
    if (channelId) query = query.eq('discord_channel_id', channelId);
    const { data } = await query.order('last_active_at', { ascending: false }).limit(1).single();
    if (data) return res.json({ sessionId: data.id, messageCount: data.messages?.length || 0 });

    const { data: newSession } = await supabaseAdmin.from('ai_agent_sessions').insert({ discord_user_id: req.params.discordId, channel: 'discord', discord_channel_id: channelId || null, messages: [], last_active_at: new Date().toISOString() }).select().single();
    res.json({ sessionId: newSession.id, messageCount: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
