// Copyright 2021-Eternity Channelping. All rights reserved. MIT License.

function isRecord(value: unknown): value is Record<string, unknown> {
   return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Read a positive duration in seconds from MediaInfo's General track. Throws on command or data errors. */
export async function readDuration(path: string): Promise<number> {
   try {
      const { code, stdout, stderr } = await new Deno.Command('mediainfo', {
         args: ['--Output=JSON', path],
      }).output();
      const decoder = new TextDecoder();
      if (code !== 0)
         throw new Error(`MediaInfo exited with code ${code}: ${decoder.decode(stderr).trim()}`);
      const info: unknown = JSON.parse(decoder.decode(stdout));
      if (!isRecord(info) || !isRecord(info.media) || !Array.isArray(info.media.track)) {
         throw new Error('Invalid MediaInfo JSON: expected media.track array');
      }
      const general = info.media.track.find(
         (track: unknown) => isRecord(track) && track['@type'] === 'General',
      );
      const raw: unknown = isRecord(general) ? general.Duration : undefined;
      const duration =
         typeof raw === 'number' || (typeof raw === 'string' && raw.trim()) ? Number(raw) : NaN;
      if (!Number.isFinite(duration) || duration <= 0)
         throw new Error('Missing or invalid General track Duration');
      return duration;
   } catch (error) {
      throw new Error(
         `Cannot read duration for ${path}: ${error instanceof Error ? error.message : String(error)}`,
         { cause: error },
      );
   }
}
