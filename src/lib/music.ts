import type {
  Client,
  GuildMember,
  TextBasedChannel,
  VoiceBasedChannel,
} from 'discord.js';
import type {
  LavalinkManager,
  Player,
  Track,
  UnresolvedTrack,
} from 'lavalink-client';

/**
 * Lightweight helpers that hide the verbose Lavalink client/player shape from
 * command handlers. All command files use these so swapping player libraries
 * or tweaking queue semantics only requires changing this file.
 *
 * We intentionally avoid module augmentation of `discord.js.Client`:
 * the library ships dual CJS (`index.d.ts`) and ESM (`index.d.mts`) type
 * bundles which TypeScript considers structurally distinct (separate private
 * `actions` slots), so an augmentation applied to one variant fails to flow
 * through the other and every call site ends up with a type error.
 *
 * Instead, every caller goes through {@link getManager} which retrieves the
 * Lavalink manager stashed on the client in `src/app.ts`. This keeps the
 * public API minimal and works regardless of which resolution mode TS picks.
 */

const MANAGER_KEY = '__musicbotLavalink' as const;
type ClientWithManager = { readonly [MANAGER_KEY]?: LavalinkManager };

export function attachManager(client: Client, manager: LavalinkManager): void {
  (client as unknown as { [MANAGER_KEY]: LavalinkManager })[MANAGER_KEY] = manager;
}

export function getManager(client: Client): LavalinkManager {
  const manager = (client as unknown as ClientWithManager)[MANAGER_KEY];
  if (!manager) {
    throw new Error(
      'Lavalink manager is not attached to the client. Did src/app.ts run?',
    );
  }
  return manager;
}

export function getOrCreatePlayer(
  client: Client,
  member: GuildMember,
  textChannel: TextBasedChannel | null,
): Player | null {
  const voiceChannel = member.voice.channel as VoiceBasedChannel | null;
  if (!voiceChannel) return null;

  const manager = getManager(client);
  const existing = manager.getPlayer(voiceChannel.guildId);
  if (existing) return existing;

  return manager.createPlayer({
    guildId: voiceChannel.guildId,
    voiceChannelId: voiceChannel.id,
    textChannelId: textChannel?.id ?? voiceChannel.id,
    selfDeaf: true,
  });
}

export function getPlayer(client: Client, guildId: string): Player | null {
  return getManager(client).getPlayer(guildId) ?? null;
}

export function formatTrackName(track: Track | UnresolvedTrack | null): string {
  if (!track) return 'Unknown';
  return track.info.title ?? 'Unknown';
}

export function trackDurationSeconds(
  track: Track | UnresolvedTrack | null,
): number {
  if (!track) return 0;
  return Math.max(0, Math.floor((track.info.duration ?? 0) / 1000));
}

export type RepeatMode = Player['repeatMode'];
