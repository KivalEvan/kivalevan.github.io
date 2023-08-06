<script lang="ts">
   import BeatmapCard from './BeatmapCard.svelte';
   import type { BeatmapDetails } from '../../utils/beatmap';
   import { interleave } from '../../utils/misc';

   export let beatmaps: BeatmapDetails[];
   let _beatmapLeft: BeatmapDetails[] = [];
   let _beatmapRight: BeatmapDetails[] = [];
   let index = 0;
   const count = 8;
   $: page = 1;
   $: beatmapLeft = _beatmapLeft;
   $: beatmapRight = _beatmapRight;

   beatmaps = interleave(beatmaps);

   function showMap() {
      _beatmapLeft = [];
      _beatmapRight = [];
      beatmaps.slice(index, index + count).forEach((beatmap, i) => {
         if (i % 2) {
            _beatmapRight.push(beatmap);
         } else {
            _beatmapLeft.push(beatmap);
         }
      });
   }

   function nextMap() {
      index += count;
      if (index >= beatmaps.length) index = 0;
      page = Math.floor(index / count) + 1;
      showMap();
   }

   function prevMap() {
      index -= count;
      if (index < 0) index = Math.floor(beatmaps.length / count) * count;
      if (index === beatmaps.length) index -= count;
      page = Math.floor(index / count) + 1;
      showMap();
   }

   showMap();
</script>

<div class="spacer">
   <button class="fake-link" on:click={prevMap} on:keypress={prevMap} tabindex="0">Prev</button>
   <span>
      {page} | {Math.ceil(beatmaps.length / count)}
   </span>
   <button class="fake-link" on:click={nextMap} on:keypress={nextMap} tabindex="0">Next</button>
</div>
<div id="map-showcase" class="panel-inner">
   <div class="panel-column">
      {#each beatmapLeft as beatmap}
         <BeatmapCard {beatmap} />
         <br />
      {/each}
   </div>
   <div class="panel-column">
      {#each beatmapRight as beatmap}
         <BeatmapCard {beatmap} />
         <br />
      {/each}
   </div>
</div>

<style lang="scss">
   button {
      font-size: 1em;
      background: none;
      border: 1px solid white;
      border-radius: 0.5em;
      padding: 0.125em 0.5em;
      margin: 0 0.375em;
   }
   .spacer {
      margin: 0.25em 0;
   }
</style>
