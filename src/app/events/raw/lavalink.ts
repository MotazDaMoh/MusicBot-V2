import type { Client } from 'discord.js';
import type { LavalinkManager } from 'lavalink-client';

import { getManager } from '../../../lib/music.js';

type RawPayload = Parameters<LavalinkManager['sendRawData']>[0];

/**
 * Forward voice-state and voice-server updates from discord.js's raw event
 * stream into Lavalink. Without this the Lavalink node never learns about the
 * bot joining a voice channel and no audio is played.
 */
export default async function onRaw(
  payload: unknown,
  client: Client<true>,
): Promise<void> {
  await getManager(client).sendRawData(payload as RawPayload);
}
