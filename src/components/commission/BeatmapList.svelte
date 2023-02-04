<script lang="ts">
    import BeatmapShowcase from './BeatmapShowcase.svelte';
    import beatmaps from '../../data/beatmap.json';
    import type { BeatmapDetails } from '../../utils/beatmap';
    const showcaseMaps = (<any[]>beatmaps).filter((b) =>
        b.tag.some((t: string) => t === 'showcase')
    ) as BeatmapDetails[];
    const requestMaps = (<any[]>beatmaps).filter((b) =>
        b.tag.some((t: string) => t === 'request')
    ) as BeatmapDetails[];
</script>

<h5>Personal</h5>
<BeatmapShowcase beatmaps={showcaseMaps} />
<br />
<h5>Requested</h5>
<BeatmapShowcase beatmaps={requestMaps} />
<br />
