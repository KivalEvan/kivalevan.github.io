<script lang="ts">
    import BeatmapCard from './BeatmapCard.svelte';
    import type { BeatmapDetails } from '../../utils/beatmap';
    import { interleave } from '../../utils/misc';

    export let beatmaps: BeatmapDetails[];
    let _beatmapLeft: BeatmapDetails[] = [];
    let _beatmapRight: BeatmapDetails[] = [];
    let index = 0;
    $: page = 1;
    $: beatmapLeft = _beatmapLeft;
    $: beatmapRight = _beatmapRight;

    beatmaps = interleave(beatmaps);

    function nextMap() {
        _beatmapLeft = [];
        _beatmapRight = [];
        beatmaps.slice(index, index + 10).forEach((beatmap, i) => {
            if (i % 2) {
                _beatmapRight.push(beatmap);
            } else {
                _beatmapLeft.push(beatmap);
            }
        });

        page = Math.floor(index / 10) + 1;
        index += 10;
        if (index > beatmaps.length) index = 0;
    }

    nextMap();
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<span class="fake-link" on:click={nextMap} on:keypress={nextMap} tabindex="0"
    >Next {page} | {Math.ceil(beatmaps.length / 10)}</span
>
<div id="map-showcase" class="panel-inner">
    <div class="panel-column">
        {#each beatmapLeft as beatmap}
            <BeatmapCard {beatmap} />
        {/each}
        <!-- <BeatmapCard beatmapName="new world" />
        <BeatmapCard beatmapName="last wind" />
        <BeatmapCard beatmapName="girly cupid" />
        <BeatmapCard beatmapName="azure raindrop" />
        <BeatmapCard beatmapName="werewolf howls." /> -->
    </div>
    <div class="panel-column">
        {#each beatmapRight as beatmap}
            <BeatmapCard {beatmap} />
        {/each}
        <!-- <BeatmapCard beatmapName="vagueness" />
        <BeatmapCard beatmapName="pure-hearted armeria" />
        <BeatmapCard beatmapName="the pressure" />
        <BeatmapCard beatmapName="frightmare" />
        <BeatmapCard beatmapName="echo" /> -->
    </div>
</div>
