<script lang="ts">
   import BeatmapCard from './BeatmapCard.svelte';
   import type { BeatmapDetails } from '../../utils/beatmap';

   let {
      beatmaps,
      emptyMessage = 'No beatmaps are available in this section yet.',
   }: { beatmaps: BeatmapDetails[]; emptyMessage?: string } = $props();

   const count = 6;
   const maps = beatmaps;
   const pageCount = Math.ceil(maps.length / count);
   let visibleMaps = $state<BeatmapDetails[]>([]);
   let index = $state(0);
   let page = $state(1);

   function showMap() {
      visibleMaps = maps.slice(index, index + count);
   }

   function nextMap() {
      if (!maps.length) return;
      index += count;
      if (index >= maps.length) index = 0;
      page = Math.floor(index / count) + 1;
      showMap();
   }

   function prevMap() {
      if (!maps.length) return;
      index -= count;
      if (index < 0) index = (pageCount - 1) * count;
      page = Math.floor(index / count) + 1;
      showMap();
   }

   showMap();
</script>

<div class="w-full">
   {#if maps.length > 0}
      {#if pageCount > 1}
         <nav class="mb-3 flex items-center justify-center gap-2" aria-label="Beatmap showcase pages">
            <button
               class="beatmap-pager print-action"
               type="button"
               onclick={prevMap}
               aria-label="Previous beatmap page"
            >Previous</button>
            <span class="min-w-28 text-center" aria-live="polite">Page {page} of {pageCount}</span>
            <button
               class="beatmap-pager print-action"
               type="button"
               onclick={nextMap}
               aria-label="Next beatmap page"
            >Next</button>
         </nav>
      {/if}
      <div class="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
         {#each visibleMaps as beatmap (beatmap.id)}
            <BeatmapCard {beatmap} />
         {/each}
      </div>
   {:else}
      <p
         class="chipped-corners border border-[#6883ad] bg-[#0b1429]/80 p-4 text-center"
         role="status"
      >
         {emptyMessage}
      </p>
   {/if}
</div>
