import { SlashCommandBuilder } from 'discord.js';

export const commandDefinitions = [
  new SlashCommandBuilder().setName('heru-link').setDescription('Link your HERU.gg account to Discord'),
  new SlashCommandBuilder().setName('heru-profile').setDescription('Show your HERU gamer profile').addStringOption(o => o.setName('username').setDescription('HERU username (leave empty for yours)')),
  new SlashCommandBuilder().setName('heru-stats').setDescription('Show your game stats').addStringOption(o => o.setName('game').setDescription('lol or valorant').addChoices({ name: 'League of Legends', value: 'lol' }, { name: 'Valorant', value: 'valorant' })),
  new SlashCommandBuilder().setName('heru-tournaments').setDescription('List active HERU tournaments'),
  new SlashCommandBuilder().setName('heru-join').setDescription('Create a HERU account or join a tournament via Discord'),
  new SlashCommandBuilder().setName('heru-team').setDescription('Show team info').addStringOption(o => o.setName('id').setDescription('Team ID').setRequired(true)),
  new SlashCommandBuilder().setName('heru-standings').setDescription('Show tournament standings').addStringOption(o => o.setName('id').setDescription('Tournament ID')),
  new SlashCommandBuilder().setName('heru-build').setDescription('(Organizer) Start the AI-powered tournament builder'),
  new SlashCommandBuilder().setName('heru-setup').setDescription('(Admin) Link this server to your HERU organizer account'),
  new SlashCommandBuilder().setName('heru-announce').setDescription('(Admin) Broadcast a message to the notification channel').addStringOption(o => o.setName('message').setDescription('Message to announce').setRequired(true)),
  new SlashCommandBuilder().setName('heru-ask').setDescription('Ask the HERU AI assistant anything').addStringOption(o => o.setName('question').setDescription('Your question').setRequired(true)),
].map(c => c.toJSON());
