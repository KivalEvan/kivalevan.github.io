<script lang="ts">
   import BeatmapCard from './BeatmapCard.svelte';
   import type { BeatmapDetails } from '../../data/beatmap';

   let {
      beatmaps,
      emptyMessage = 'No beatmaps are available in this section yet.',
   }: { beatmaps: BeatmapDetails[]; emptyMessage?: string } = $props();

   const count = 6;
   let index = $state(0);
   const pageCount = $derived(Math.ceil(beatmaps.length / count));
   const visibleMaps = $derived(beatmaps.slice(index, index + count));
   const page = $derived(Math.floor(index / count) + 1);

   function nextMap() {
      if (!beatmaps.length) return;
      index += count;
      if (index >= beatmaps.length) index = 0;
   }

   function prevMap() {
      if (!beatmaps.length) return;
      index -= count;
      if (index < 0) index = (pageCount - 1) * count;
   }
</script>

<div class="beatmap-showcase">
   {#if beatmaps.length > 0}
      {#if pageCount > 1}
         <nav class="beatmap-showcase__pager" aria-label="Beatmap showcase pages">
            <button
               class="beatmap-pager print-action"
               type="button"
               onclick={prevMap}
               aria-label="Previous beatmap page">Previous</button
            >
            <span class="beatmap-showcase__page" aria-live="polite">Page {page} of {pageCount}</span
            >
            <button
               class="beatmap-pager print-action"
               type="button"
               onclick={nextMap}
               aria-label="Next beatmap page">Next</button
            >
         </nav>
      {/if}
      <div class="beatmap-showcase__grid">
         {#each visibleMaps as beatmap (beatmap.id)}
            <BeatmapCard {beatmap} />
         {/each}
      </div>
   {:else}
      <p class="chipped-corners chipped-corners--bordered beatmap-showcase__empty" role="status">
         {emptyMessage}
      </p>
   {/if}
</div>

<style lang="scss">
   @layer layout {
      .beatmap-pager {
         cursor: pointer;
      }

      .beatmap-showcase {
         width: 100%;

         &__pager {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
         }

         &__page {
            min-width: 7rem;
            text-align: center;
         }

         &__grid {
            display: grid;
            width: 100%;
            grid-template-columns: minmax(0, 1fr);
            gap: 1rem;

            @media (min-width: 64rem) {
               grid-template-columns: repeat(2, minmax(0, 1fr));
            }
         }

         &__empty {
            padding: 1rem;
            border: 1px solid #6883ad;
            background: rgb(11 20 41 / 80%);
            text-align: center;
         }
      }
   }
</style>
