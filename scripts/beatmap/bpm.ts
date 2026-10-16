import type { wrapper } from 'bsmap';

function positiveBpm(value: unknown): number {
   if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      throw new Error(`Expected a positive finite BPM, received ${String(value)}`);
   }
   return value;
}

/** Include base BPM and the first available BPM source: native events, type 100 events, then legacy custom data. */
export function bpmRange(
   base: number,
   beatmap?: wrapper.IWrapBeatmap,
): { min: number; max: number } {
   let min = positiveBpm(base);
   let max = min;
   let values: unknown[] = [];
   if (beatmap) {
      values = beatmap.difficulty.bpmEvents.map((event) => event.bpm);
      if (!values.length)
         values = beatmap.lightshow.basicEvents
            .filter((event) => event.type === 100)
            .map((event) => event.floatValue);
      if (!values.length) {
         const custom = beatmap.difficulty.customData;
         const changes: unknown = custom._BPMChanges ?? custom._bpmChanges ?? custom.BPMChanges;
         if (changes !== undefined) {
            if (!Array.isArray(changes)) throw new Error('Custom BPM changes must be an array');
            values = changes.map((change: unknown) => {
               if (typeof change !== 'object' || change === null || Array.isArray(change))
                  throw new Error('Custom BPM change must be an object');
               const entry = change as Record<string, unknown>;
               return entry._BPM ?? entry._bpm ?? entry.m;
            });
         }
      }
   }
   for (const value of values) {
      const bpm = positiveBpm(value);
      min = Math.min(min, bpm);
      max = Math.max(max, bpm);
   }
   return { min, max };
}
