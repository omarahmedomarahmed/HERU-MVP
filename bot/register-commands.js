import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commandDefinitions } from './commands/index.js';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const APP_ID = process.env.DISCORD_APPLICATION_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID; // Set for instant guild registration (dev), leave empty for global (prod)

if (!TOKEN || !APP_ID) { console.error('Set DISCORD_BOT_TOKEN and DISCORD_APPLICATION_ID'); process.exit(1); }

const rest = new REST({ version: '10' }).setToken(TOKEN);
const route = GUILD_ID
  ? Routes.applicationGuildCommands(APP_ID, GUILD_ID)
  : Routes.applicationCommands(APP_ID);

rest.put(route, { body: commandDefinitions })
  .then(() => console.log(`Commands registered successfully (${GUILD_ID ? `guild ${GUILD_ID}` : 'global'})`))
  .catch(console.error);
