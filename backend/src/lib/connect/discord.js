const DISCORD_API = 'https://discord.com/api/v10';
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3001/api/connect/discord/callback';

if (!CLIENT_ID) console.warn('[discord] DISCORD_CLIENT_ID not set');
if (!CLIENT_SECRET) console.warn('[discord] DISCORD_CLIENT_SECRET not set');

async function discordFetch(path, options = {}) {
  const res = await fetch(`${DISCORD_API}${path}`, options);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord API error ${res.status}: ${err}`);
  }
  return res.json();
}

export function getOAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email guilds',
    state,
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}

export async function exchangeCode(code) {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
  });
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord token exchange failed: ${err}`);
  }
  return res.json();
}

export async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error('Discord token refresh failed');
  return res.json();
}

export async function getMe(accessToken) {
  return discordFetch('/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getUserGuilds(accessToken) {
  return discordFetch('/users/@me/guilds', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function getBotInstallUrl() {
  const clientId = process.env.DISCORD_APPLICATION_ID || CLIENT_ID;
  const params = new URLSearchParams({
    client_id: clientId,
    permissions: '2147485696',
    scope: 'bot applications.commands',
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}
