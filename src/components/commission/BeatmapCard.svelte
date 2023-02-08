<script lang="ts">
    import type { BeatmapDetails } from '../../utils/beatmap';
    function toMMSS(seconds: number): string {
        if (!seconds) {
            return '0:00';
        }
        const numr = Math.floor(seconds);
        const temp = numr / 60;
        const min = temp < 0 ? `-${Math.ceil(temp).toString()}` : Math.floor(temp).toString();
        const sec = Math.abs(numr % 60)
            .toString()
            .padStart(2, '0');
        return `${min}:${sec}`;
    }

    export let beatmap: BeatmapDetails;
</script>

<div class="song-card">
    <a class="cover" href={beatmap.link['BeatSaver'].url}>
        <img
            alt={beatmap.songName}
            src={`/assets/img/cover/${beatmap.coverImage}`}
            width={256}
            height={256}
        />
    </a>
    <div class="metadata">
        <span class="song-name">{beatmap.songName}</span>
        <span class="song-subname">{beatmap.songSubName}</span><br />
        <span class="song-artist">{beatmap.songAuthorName}</span><br />
        <span class="song-bpm">{beatmap.beatsPerMinute.base}BPM</span><br />
        <span class="song-duration">{toMMSS(beatmap.songDuration)}</span><br />
        <br />
        <div>
            {#each Object.keys(beatmap.link) as link, index}
                <a class="map-link" href={beatmap.link[link].url}>{beatmap.link[link].name}</a>
                {#if index != Object.keys(beatmap.link).length - 1}
                    <span> | </span>
                {/if}
            {/each}
        </div>
    </div>
</div>

<style lang="scss">
    @use '../../styles/_var' as *;

    .cover {
        display: inline-block;
        width: 9em;
        height: 9em;
        margin: 0.5em;
        box-shadow: -0.1875em 0.1875em 0.375em #0008;
        transition: transform ease 0.25s, box-shadow ease 0.25s;

        @media (max-width: $breakpoint-mobile) {
            width: 8em;
            height: 8em;
        }

        img {
            width: 9em;
            height: 9em;

            @media (max-width: $breakpoint-mobile) {
                width: 8em;
                height: 8em;
            }
        }

        &:hover {
            box-shadow: -0.125em 0.125em 0.5em #000f;
            transform: scale(1.1);
        }
    }

    .metadata {
        display: inline-block;
        width: calc(100% - 11.375em);
        height: 9em;
        margin: 0.5em;
        vertical-align: top;

        @media (max-width: $breakpoint-mobile) {
            width: calc(100% - 10.375em);
            height: 8em;
        }
    }

    .song-name {
        font-size: 1.5rem;

        @media (max-width: $breakpoint-mobile) {
            font-size: 1.25rem;
        }
    }

    .song-artist {
        font-size: 1.1875rem;

        @media (max-width: $breakpoint-mobile) {
            font-size: 1rem;
        }
    }
</style>
