import 'dotenv/config';

const API_URL = process.env.HERU_API_URL || 'http://localhost:3001/api';
const BOT_SECRET = process.env.HERU_BOT_SECRET;

async function heruFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Bot-Secret': BOT_SECRET,
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HERU API error ${res.status}`);
  }
  return res.json();
}

export const heruClient = {
  getProfileByDiscord: (discordId) => heruFetch(`/bot/profile/by-discord/${discordId}`),
  getActiveTournaments: () => heruFetch('/bot/tournaments/active'),
  joinTournament: (tournamentId, discordUserId, teamId) => heruFetch(`/bot/tournaments/${tournamentId}/join`, { method: 'POST', body: { discordUserId, teamId } }),
  getTeam: (teamId) => heruFetch(`/bot/team/${teamId}`),
  setupServer: (data) => heruFetch('/bot/server/setup', { method: 'POST', body: data }),
  announce: (guildId, message, embed) => heruFetch('/bot/server/announce', { method: 'POST', body: { guildId, message, embed } }),
  getAgentSession: (discordId, channelId) => heruFetch(`/bot/agent/session/${discordId}?channelId=${channelId || ''}`),
  sendAgentMessage: (data) => heruFetch('/bot/agent/message', { method: 'POST', body: data }),
  getInstallUrl: () => heruFetch('/bot/install-url'),
};
