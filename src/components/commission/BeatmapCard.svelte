<script lang="ts">
   import type { BeatmapDetails } from '../../utils/beatmap';
   import { round } from '../../utils/misc';

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

   function linkLabel(link: string, fallback: string): string {
      if (link === 'BeatSaver') return 'View on BeatSaver';
      if (link === 'WebViewer') return 'Open web viewer';
      return fallback;
   }

   let { beatmap }: { beatmap: BeatmapDetails } = $props();
</script>

<article class="beatmap-card flex w-full items-start gap-1 border-t border-[#29466b] pt-3 tabular-nums sm:gap-2">
   <a
      class="m-1 block size-[6rem] shrink-0 overflow-hidden border border-[#6883ad] shadow-[-0.1875em_0.1875em_0.375em_#0008] transition duration-200 ease-out hover:scale-105 hover:border-[#ed1738] hover:shadow-[-0.125em_0.125em_0.5em_#000f] focus-visible:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6883ad] sm:m-2 sm:size-[8em] md:size-[9em]"
      href={beatmap.link['BeatSaver'].url}
      aria-label={`View ${beatmap.songName} on BeatSaver`}
   >
      <img
         class="size-full object-cover"
         alt={`${beatmap.songName} cover art`}
         src={`/assets/img/cover/${beatmap.coverImage}`}
         width={256}
         height={256}
         loading="lazy"
         decoding="async"
      />
   </a>
   <div class="m-1 min-w-0 flex-1 self-stretch break-words text-sm sm:m-2 sm:text-base">
      {#each Object.entries(beatmap.link) as [link, destination], index}
         <a
            class="mr-1 inline-flex min-h-[44px] items-center px-0.5 font-['Big_Shoulders_Display'] text-lg font-extrabold uppercase tracking-wide text-[#ecebe6] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6883ad]"
            href={destination.url}>{linkLabel(link, destination.name)}</a
         >
         {#if index !== Object.entries(beatmap.link).length - 1}
            <span aria-hidden="true">|</span>
         {/if}
      {/each}
      <br />
      <h4 class="m-0 font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase leading-[.9] tracking-tight sm:text-4xl">
         {beatmap.songName} <span class="font-normal">{beatmap.songSubName}</span>
      </h4>
      <span class="text-sm sm:text-base md:text-lg">{beatmap.songAuthorName}</span><br />
      <span>
         <strong>BPM:</strong> {beatmap.beatsPerMinute.base}
         {#if beatmap.beatsPerMinute.base !== beatmap.beatsPerMinute.min || beatmap.beatsPerMinute.base !== beatmap.beatsPerMinute.max}
            (range {round(beatmap.beatsPerMinute.min, 2)}–{round(beatmap.beatsPerMinute.max, 2)})
         {/if}
      </span><br />
      <span><strong>Length:</strong> {toMMSS(beatmap.songDuration)}</span><br />
      <br />
   </div>
</article>
