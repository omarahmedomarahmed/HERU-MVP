import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '../supabase.js';
import { getToolDefinitions, executeTool, toolRequiresConfirmation } from './tools.js';
import { buildSystemPrompt } from './prompts.js';

const MODEL = process.env.AI_AGENT_MODEL || 'claude-opus-4-7';
const MAX_TOKENS = parseInt(process.env.AI_AGENT_MAX_TOKENS) || 4096;

let _anthropic;
function getClient() {
  if (!_anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

async function getOrCreateSession(userId, discordUserId, channel, discordChannelId, discordGuildId) {
  let query = supabaseAdmin.from('ai_agent_sessions').select('*');
  if (userId) query = query.eq('user_id', userId).eq('channel', channel);
  else if (discordUserId) query = query.eq('discord_user_id', discordUserId).eq('channel', 'discord');
  if (discordChannelId) query = query.eq('discord_channel_id', discordChannelId);

  const { data } = await query.order('last_active_at', { ascending: false }).limit(1).single();
  if (data) return data;

  const { data: created } = await supabaseAdmin.from('ai_agent_sessions').insert({
    user_id: userId || null,
    discord_user_id: discordUserId || null,
    channel: channel || 'web',
    discord_channel_id: discordChannelId || null,
    discord_guild_id: discordGuildId || null,
    messages: [],
    last_active_at: new Date().toISOString(),
  }).select().single();
  return created;
}

async function saveSession(sessionId, messages) {
  await supabaseAdmin.from('ai_agent_sessions').update({
    messages: messages.slice(-50),
    last_active_at: new Date().toISOString(),
  }).eq('id', sessionId);
}

export async function runAgent({ userId, discordUserId, userRole, message, sessionId, channel, discordChannelId, discordGuildId, confirmed }) {
  const client = getClient();

  let session;
  if (sessionId) {
    const { data } = await supabaseAdmin.from('ai_agent_sessions').select('*').eq('id', sessionId).single();
    session = data;
  }
  if (!session) {
    session = await getOrCreateSession(userId, discordUserId, channel, discordChannelId, discordGuildId);
  }

  let profile = null;
  if (userId) {
    if (userRole === 'gamer') {
      const { data } = await supabaseAdmin.from('gamer_profiles').select('username,bio,games').eq('user_id', userId).single();
      profile = data;
    } else if (userRole === 'organizer') {
      const { data } = await supabaseAdmin.from('organizer_profiles').select('brand_name,location').eq('user_id', userId).single();
      profile = data;
    }
  }

  const systemPrompt = buildSystemPrompt({ id: userId, role: userRole }, profile, channel);
  const context = { userId, userRole };
  const history = session.messages || [];
  const userMsg = { role: 'user', content: confirmed ? `[CONFIRMED] ${message}` : message };
  let loopMessages = [...history, userMsg].map(m => ({ role: m.role, content: m.content }));

  let response;
  for (let i = 0; i < 8; i++) {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      tools: getToolDefinitions(),
      messages: loopMessages,
    });

    if (response.stop_reason === 'end_turn') break;

    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
      const toolResults = [];

      for (const block of toolUseBlocks) {
        if (toolRequiresConfirmation(block.name) && !confirmed) {
          const prefaceText = response.content.find(b => b.type === 'text')?.text || '';
          await saveSession(session.id, [...history, userMsg]);
          return {
            sessionId: session.id,
            response: `${prefaceText}\n\nI'd like to **${block.name.replace(/_/g, ' ')}** with:\n\`\`\`json\n${JSON.stringify(block.input, null, 2)}\n\`\`\`\n\nShall I go ahead? Reply **yes** to confirm or **no** to cancel.`.trim(),
            requiresConfirmation: true,
            pendingTool: { name: block.name, input: block.input },
          };
        }

        let toolResult;
        try { toolResult = await executeTool(block.name, block.input, context); }
        catch (err) { toolResult = { error: err.message }; }
        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(toolResult) });
      }

      loopMessages = [
        ...loopMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ];
    } else {
      break;
    }
  }

  const finalText = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
  await saveSession(session.id, [
    ...history,
    { role: 'user', content: message, timestamp: new Date().toISOString() },
    { role: 'assistant', content: finalText, timestamp: new Date().toISOString() },
  ]);

  return { sessionId: session.id, response: finalText, requiresConfirmation: false };
}
