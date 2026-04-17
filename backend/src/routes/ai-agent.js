import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { runAgent } from '../lib/ai/agent.js';

const router = Router();

const agentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: parseInt(process.env.AI_AGENT_HOURLY_LIMIT) || 20,
  message: { error: 'AI agent rate limit exceeded. Max 20 messages per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
});

// POST /api/ai-agent/message
router.post('/message', requireAuth, agentLimiter, async (req, res) => {
  try {
    const { message, sessionId, confirmed } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'message is required' });

    const result = await runAgent({
      userId: req.user.id,
      userRole: req.user.role,
      message: message.trim(),
      sessionId,
      channel: 'web',
      confirmed: !!confirmed,
    });

    res.json(result);
  } catch (err) {
    console.error('[ai-agent/message]', err.message);
    if (err.message.includes('ANTHROPIC_API_KEY')) return res.status(503).json({ error: 'AI agent not configured' });
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai-agent/session
router.get('/session', requireAuth, async (req, res) => {
  try {
    const { data } = await supabaseAdmin
      .from('ai_agent_sessions')
      .select('id,messages,last_active_at,created_at')
      .eq('user_id', req.user.id)
      .eq('channel', 'web')
      .order('last_active_at', { ascending: false })
      .limit(1)
      .single();

    if (!data) return res.json({ messages: [], sessionId: null });
    res.json({ messages: (data.messages || []).slice(-40), sessionId: data.id, last_active_at: data.last_active_at });
  } catch {
    res.json({ messages: [], sessionId: null });
  }
});

// DELETE /api/ai-agent/session
router.delete('/session', requireAuth, async (req, res) => {
  try {
    await supabaseAdmin.from('ai_agent_sessions').update({ messages: [], last_active_at: new Date().toISOString() }).eq('user_id', req.user.id).eq('channel', 'web');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai-agent/bot/message
router.post('/bot/message', async (req, res) => {
  if (req.headers['x-bot-secret'] !== process.env.HERU_BOT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const { message, discordUserId, discordChannelId, discordGuildId, sessionId, confirmed, userRole } = req.body;
    if (!message || !discordUserId) return res.status(400).json({ error: 'message and discordUserId required' });

    const { data: linked } = await supabaseAdmin.from('connected_accounts').select('user_id').eq('platform', 'discord').eq('platform_user_id', discordUserId).eq('is_active', true).single();

    const result = await runAgent({
      userId: linked?.user_id || null,
      discordUserId,
      userRole: userRole || 'gamer',
      message,
      sessionId,
      channel: 'discord',
      discordChannelId,
      discordGuildId,
      confirmed: !!confirmed,
    });

    res.json(result);
  } catch (err) {
    console.error('[ai-agent/bot/message]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
