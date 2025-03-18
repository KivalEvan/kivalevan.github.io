<script lang="ts">
   import type { BeatmapDetails } from '../../utils/beatmap';
   import { round } from '../../utils/misc';
   const CharacteristicRename: { readonly [key: string]: string } = {
      Standard: 'Standard',
      NoArrows: 'No Arrows',
      OneSaber: 'One Saber',
      Legacy: 'Legacy',
      '360Degree': '360 Degree',
      '90Degree': '90 Degree',
      Lightshow: 'Lightshow',
      Lawless: 'Lawless',
   } as const;

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

   function joinString(ary: string[]) {
      return ary.reduce(
         (p, v, i) =>
            p + (ary.length - 1 === i ? (i ? ' & ' : '') : i ? ', ' : '') + CharacteristicRename[v],
         '',
      );
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
      {#each Object.keys(beatmap.link) as link, index}
         <a class="map-link" href={beatmap.link[link].url}> {beatmap.link[link].name}</a>
         {#if index !== Object.keys(beatmap.link).length - 1}
            <span>
               |
            </span>
            <span>
               
            </span>
         {/if}
      {/each}
      <br>
      <span class="song-name">{beatmap.songName}</span>
      <span class="song-subname">{beatmap.songSubName}</span><br />
      <span class="song-artist">{beatmap.songAuthorName}</span><br />
      <span class="song-bpm">
         {#if beatmap.beatsPerMinute.base !== beatmap.beatsPerMinute.min || beatmap.beatsPerMinute.base !== beatmap.beatsPerMinute.max}
            ({round(beatmap.beatsPerMinute.min, 2)}-{round(beatmap.beatsPerMinute.max, 2)})
         {/if}
         {beatmap.beatsPerMinute.base}BPM</span
      ><br />
      <span class="song-duration">{toMMSS(beatmap.songDuration)}</span><br />
      <br />
   </div>
   <!-- <div>
      <ul class="list-tag">
         {#each Object.entries(beatmap.difficulties) as [mode, diffs]}
            <li>
               {CharacteristicRename[mode]} [{diffs.length}]
            </li>
         {/each}
      </ul>
   </div> -->
</div>

<style lang="scss">
   @use '../../styles/_var' as *;

   .cover {
      display: inline-block;
      width: 9em;
      height: 9em;
      margin: 0.5em;
      box-shadow: -0.1875em 0.1875em 0.375em #0008;
      transition:
         transform ease 0.25s,
         box-shadow ease 0.25s;

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
      position: relative;
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
