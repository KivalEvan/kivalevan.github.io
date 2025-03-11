<script lang="ts">
   import BeatmapShowcase from './BeatmapShowcase.svelte';
   import beatmaps from '../../data/beatmap.json' assert { type: 'json' };
   import type { BeatmapDetails } from '../../utils/beatmap.ts';
   const showcaseMaps = (beatmaps).filter((b) =>
      b.tag.some((t: string) => t === 'showcase')
   ) as BeatmapDetails[];
   const requestMaps = (beatmaps).filter((b) =>
      b.tag.some((t: string) => t === 'request')
   ) as BeatmapDetails[];
</script>

<h5>Personal</h5>
<BeatmapShowcase beatmaps={showcaseMaps} />
<br />
<h5>Requested</h5>
<BeatmapShowcase beatmaps={requestMaps} />
<br />

<style>
   h5 {
      margin: 0.25em 0.375em;
   }
</style>
