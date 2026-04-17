import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes, Events } from 'discord.js';
import { commandDefinitions } from './commands/index.js';
import { heruClient } from './lib/heruClient.js';
import { tournamentEmbed, profileEmbed, confirmEmbed } from './lib/embeds.js';
import { getSession, setSession, touchSession, clearSession } from './lib/conversationManager.js';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const APP_ID = process.env.DISCORD_APPLICATION_ID;
const FRONTEND = process.env.HERU_FRONTEND_URL || 'https://heru.gg';

if (!TOKEN) { console.error('DISCORD_BOT_TOKEN not set'); process.exit(1); }
if (!APP_ID) { console.error('DISCORD_APPLICATION_ID not set'); process.exit(1); }

// Register slash commands
const rest = new REST({ version: '10' }).setToken(TOKEN);
async function registerCommands() {
  try {
    await rest.put(Routes.applicationCommands(APP_ID), { body: commandDefinitions });
    console.log('[bot] Slash commands registered');
  } catch (err) {
    console.error('[bot] Failed to register commands:', err.message);
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

client.once(Events.ClientReady, async () => {
  console.log(`[bot] Logged in as ${client.user.tag}`);
  await registerCommands();
});

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName, user, guildId, channelId } = interaction;

  await interaction.deferReply({ ephemeral: false }).catch(() => {});

  try {
    switch (commandName) {
      case 'heru-link': {
        const url = `${FRONTEND}/auth/gamer/login?discord_link=1`;
        await interaction.editReply({ content: `🔗 **Link your HERU account**\n\nClick below to connect your Discord to HERU.gg:\n${url}\n\nAfter linking, your HERU profile will sync with Discord.` });
        break;
      }

      case 'heru-join': {
        const url = `${FRONTEND}/auth/gamer/register?via=discord`;
        await interaction.editReply({ content: `👾 **Join HERU.gg**\n\nCreate your HERU gamer account:\n${url}\n\nAlready have one? Link your Discord at ${FRONTEND}/gamer/connect` });
        break;
      }

      case 'heru-profile': {
        const data = await heruClient.getProfileByDiscord(user.id);
        if (!data.profile) {
          await interaction.editReply({ content: `No HERU profile found. Create one at ${FRONTEND}` });
          break;
        }
        await interaction.editReply({ embeds: [profileEmbed(data.profile, data.riotAccounts, FRONTEND)] });
        break;
      }

      case 'heru-stats': {
        const game = interaction.options.getString('game') || 'lol';
        const data = await heruClient.getProfileByDiscord(user.id);
        const accounts = (data.riotAccounts || []).filter(a => a.game_key === game);
        if (accounts.length === 0) {
          await interaction.editReply({ content: `No ${game === 'lol' ? 'League of Legends' : 'Valorant'} accounts linked. Go to ${FRONTEND}/gamer/connect to link your Riot account.` });
          break;
        }
        const lines = accounts.map(a => {
          const rank = a.rank_tier ? `**${a.rank_tier} ${a.rank_division || ''}**` : 'Unranked';
          return `• ${a.game_name}#${a.tag_line} — ${rank}${a.is_primary ? ' ⭐' : ''}`;
        });
        await interaction.editReply({ content: `🎮 **${user.username}'s ${game === 'lol' ? 'LoL' : 'Valorant'} Accounts**\n${lines.join('\n')}` });
        break;
      }

      case 'heru-tournaments': {
        const tournaments = await heruClient.getActiveTournaments();
        if (!tournaments.length) {
          await interaction.editReply({ content: 'No active tournaments right now. Check back soon!' });
          break;
        }
        const embeds = tournaments.slice(0, 3).map(t => tournamentEmbed(t, FRONTEND));
        await interaction.editReply({ content: `🏆 **Active HERU Tournaments** (${tournaments.length} total)`, embeds });
        break;
      }

      case 'heru-team': {
        const id = interaction.options.getString('id');
        const team = await heruClient.getTeam(id);
        await interaction.editReply({
          embeds: [{
            title: team.name,
            color: 0x7c3aed,
            fields: [
              { name: 'Games', value: team.games?.join(', ') || 'N/A', inline: true },
              { name: 'Recruiting', value: team.is_recruiting ? 'Yes ✅' : 'No', inline: true },
              { name: 'Members', value: String(team.members?.length || 0), inline: true },
            ],
            description: team.description || '',
            footer: { text: 'HERU.gg' },
          }],
        });
        break;
      }

      case 'heru-standings': {
        const id = interaction.options.getString('id');
        if (!id) {
          await interaction.editReply({ content: `View tournament standings at ${FRONTEND}/tournaments` });
          break;
        }
        await interaction.editReply({ content: `📊 View standings at ${FRONTEND}/tournaments/${id}` });
        break;
      }

      case 'heru-build': {
        const session = getSession(channelId);
        const sessionId = session?.sessionId;

        const result = await heruClient.sendAgentMessage({
          message: 'I want to build a tournament for my Discord server. Please guide me through the process step by step.',
          discordUserId: user.id,
          discordChannelId: channelId,
          discordGuildId: guildId,
          sessionId,
          userRole: 'organizer',
        });

        setSession(channelId, result.sessionId, user.id);

        if (result.requiresConfirmation) {
          await interaction.editReply(confirmEmbed('Tournament Builder', result.response, result.sessionId));
        } else {
          await interaction.editReply({ content: result.response });
        }
        break;
      }

      case 'heru-ask': {
        const question = interaction.options.getString('question');
        const session = getSession(channelId);

        const result = await heruClient.sendAgentMessage({
          message: question,
          discordUserId: user.id,
          discordChannelId: channelId,
          discordGuildId: guildId,
          sessionId: session?.sessionId,
        });

        setSession(channelId, result.sessionId, user.id);

        if (result.requiresConfirmation) {
          await interaction.editReply(confirmEmbed('Confirm Action', result.response, result.sessionId));
        } else {
          const text = result.response || 'I could not process that request.';
          if (text.length > 1900) {
            await interaction.editReply({ content: text.slice(0, 1900) + '\n...' });
          } else {
            await interaction.editReply({ content: text });
          }
        }
        break;
      }

      case 'heru-setup': {
        if (!interaction.memberPermissions?.has('Administrator')) {
          await interaction.editReply({ content: '❌ Only server admins can run /heru-setup' });
          break;
        }
        const url = `${FRONTEND}/organizer/dashboard?setup_guild=${guildId}`;
        await interaction.editReply({ content: `⚙️ **Server Setup**\n\nTo link this server to your HERU organizer account:\n1. Go to: ${url}\n2. Click "Link Discord Server" and follow the steps\n\nYou need an organizer account on HERU.gg to proceed.` });
        break;
      }

      case 'heru-announce': {
        if (!interaction.memberPermissions?.has('Administrator')) {
          await interaction.editReply({ content: '❌ Only server admins can use /heru-announce' });
          break;
        }
        const message = interaction.options.getString('message');
        await heruClient.announce(guildId, message, null);
        await interaction.editReply({ content: '✅ Announcement sent to notification channel.' });
        break;
      }

      default:
        await interaction.editReply({ content: 'Unknown command' });
    }
  } catch (err) {
    console.error(`[bot] Command error (${commandName}):`, err.message);
    const errMsg = err.message.includes('linked') || err.message.includes('account')
      ? `${err.message} — Visit ${FRONTEND}/gamer/connect`
      : `Something went wrong. Try again or visit ${FRONTEND}`;
    await interaction.editReply({ content: `❌ ${errMsg}` }).catch(() => {});
  }
});

// Natural language: handle @mentions and DMs
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const isMention = message.mentions.has(client.user);
  const isDM = message.channel.type === 1;
  if (!isMention && !isDM) return;

  const text = message.content.replace(/<@!?\d+>/g, '').trim();
  if (!text) {
    await message.reply('Hi! I\'m HERU BOT. Ask me anything about tournaments, teams, or say **/heru-build** to create a tournament!');
    return;
  }

  const channelId = message.channel.id;
  const session = getSession(channelId);
  touchSession(channelId);

  try {
    await message.channel.sendTyping();

    const result = await heruClient.sendAgentMessage({
      message: text,
      discordUserId: message.author.id,
      discordChannelId: channelId,
      discordGuildId: message.guildId,
      sessionId: session?.sessionId,
    });

    setSession(channelId, result.sessionId, message.author.id);

    if (result.requiresConfirmation) {
      await message.reply(confirmEmbed('Confirm Action', result.response, result.sessionId));
    } else {
      const reply = result.response || 'I\'m not sure how to help with that. Try visiting heru.gg!';
      await message.reply(reply.length > 1900 ? reply.slice(0, 1900) + '\n...' : reply);
    }
  } catch (err) {
    console.error('[bot] NL message error:', err.message);
    await message.reply(`Something went wrong. Visit ${FRONTEND} for help.`);
  }
});

// When bot joins a new guild
client.on(Events.GuildCreate, async (guild) => {
  console.log(`[bot] Joined server: ${guild.name} (${guild.id})`);
  const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(guild.members.me)?.has('SendMessages'));
  if (channel) {
    channel.send({
      embeds: [{
        title: '👋 HERU BOT is here!',
        description: `Thanks for adding HERU BOT to **${guild.name}**!\n\n**To get started:**\n• Run \`/heru-setup\` (admin only) to link your organizer account\n• Use \`/heru-tournaments\` to browse active tournaments\n• Mention me or DM me to chat with HERU AI\n\n**Create a tournament:** \`/heru-build\`\n**View your profile:** \`/heru-profile\``,
        color: 0xff1a1a,
        footer: { text: `HERU.gg — ${process.env.HERU_FRONTEND_URL || 'https://heru.gg'}` },
      }],
    }).catch(() => {});
  }
});

client.login(TOKEN);
