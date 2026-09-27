<svelte:options runes={true} />

<script lang="ts">
   import BeatmapShowcase from './BeatmapShowcase.svelte';
   import beatmaps from '../../data/beatmap.json';
   import type { BeatmapDetails } from '../../data/beatmap';

   const showcaseMaps = beatmaps.filter((b) =>
      b.tag.some((t: string) => t === 'showcase'),
   ) as unknown as BeatmapDetails[];
   const requestMaps = beatmaps.filter((b) =>
      b.tag.some((t: string) => t === 'request'),
   ) as unknown as BeatmapDetails[];
</script>

<div class="beatmap-list">
   <section class="beatmap-list__section" aria-labelledby="personal-beatmaps">
      <h3 id="personal-beatmaps" class="beatmap-list__heading">Personal</h3>
      <BeatmapShowcase
         beatmaps={showcaseMaps}
         emptyMessage="No personal beatmaps are available in this section yet."
      />
   </section>
   <section class="beatmap-list__section" aria-labelledby="requested-beatmaps">
      <h3 id="requested-beatmaps" class="beatmap-list__heading">Requested</h3>
      <BeatmapShowcase
         beatmaps={requestMaps}
         emptyMessage="No requested beatmaps are available in this section yet."
      />
   </section>
</div>

<style lang="scss">
   @layer layout {
      .beatmap-list {
         width: 100%;

         &__section:not(:last-child) {
            margin-block-start: 0;
            margin-block-end: 1.5rem;
         }

         &__heading {
            margin-bottom: 0.75rem;
            font-family: 'Big Shoulders Display', sans-serif;
            font-size: 1.875rem;
            font-weight: 800;
            line-height: 1;
            text-transform: uppercase;
         }
      }
   }
</style>
