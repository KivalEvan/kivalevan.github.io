<svelte:options runes={true} />

<script lang="ts">
   import BeatmapShowcase from './BeatmapShowcase.svelte';
   import beatmaps from '../../data/beatmap.json';
   import type { BeatmapDetails } from '../../utils/beatmap.ts';

   const showcaseMaps = beatmaps.filter((b) =>
      b.tag.some((t: string) => t === 'showcase'),
   ) as unknown as BeatmapDetails[];
   const requestMaps = beatmaps.filter((b) =>
      b.tag.some((t: string) => t === 'request'),
   ) as unknown as BeatmapDetails[];
</script>

<div class="w-full space-y-6">
   <section aria-labelledby="personal-beatmaps">
      <h3
         id="personal-beatmaps"
         class="mb-3 font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase leading-none"
      >
         Personal
      </h3>
      <BeatmapShowcase
         beatmaps={showcaseMaps}
         emptyMessage="No personal beatmaps are available in this section yet."
      />
   </section>
   <section aria-labelledby="requested-beatmaps">
      <h3
         id="requested-beatmaps"
         class="mb-3 font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase leading-none"
      >
         Requested
      </h3>
      <BeatmapShowcase
         beatmaps={requestMaps}
         emptyMessage="No requested beatmaps are available in this section yet."
      />
   </section>
</div>
