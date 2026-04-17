import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commandDefinitions } from './commands/index.js';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const APP_ID = process.env.DISCORD_APPLICATION_ID;

if (!TOKEN || !APP_ID) { console.error('Set DISCORD_BOT_TOKEN and DISCORD_APPLICATION_ID'); process.exit(1); }

const rest = new REST({ version: '10' }).setToken(TOKEN);
rest.put(Routes.applicationCommands(APP_ID), { body: commandDefinitions })
  .then(() => console.log('Commands registered successfully'))
  .catch(console.error);
