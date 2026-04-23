import { Client, GatewayIntentBits } from 'discord.js';

import { config } from './lib/config.js';
import { createLavalinkManager } from './lib/lavalink.js';
import { attachManager } from './lib/music.js';

/**
 * Entry point for the CommandKit v1 runtime.
 *
 * CommandKit discovers commands, events, and middleware from `src/app/*` and
 * drives the login lifecycle, so this file just needs to configure and export
 * the Discord.js client. The Lavalink manager is created eagerly and stashed
 * on the client so event/command code can reach it via `getManager(client)`.
 */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

attachManager(client, createLavalinkManager(client));

client.token = config.discord.token;

export default client;
