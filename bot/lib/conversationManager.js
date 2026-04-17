// Tracks active NL conversation state per Discord channel
const sessions = new Map(); // channelId → { sessionId, userId, lastActivity }

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 min inactivity clears session

export function getSession(channelId) {
  const s = sessions.get(channelId);
  if (!s) return null;
  if (Date.now() - s.lastActivity > SESSION_TIMEOUT_MS) {
    sessions.delete(channelId);
    return null;
  }
  return s;
}

export function setSession(channelId, sessionId, userId = null) {
  sessions.set(channelId, { sessionId, userId, lastActivity: Date.now() });
}

export function touchSession(channelId) {
  const s = sessions.get(channelId);
  if (s) s.lastActivity = Date.now();
}

export function clearSession(channelId) {
  sessions.delete(channelId);
}
