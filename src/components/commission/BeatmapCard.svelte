<script lang="ts">
   import type { BeatmapDetails } from '../../data/beatmap';
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
   const links = $derived(Object.entries(beatmap.link));
</script>

<article class="beatmap-card">
   <a
      class="beatmap-card__cover"
      href={beatmap.link['BeatSaver'].url}
      aria-label={`View ${beatmap.songName} on BeatSaver`}
   >
      <img
         class="beatmap-card__image"
         alt={`${beatmap.songName} cover art`}
         src={`/assets/img/cover/${beatmap.coverImage}`}
         width={256}
         height={256}
         loading="lazy"
         decoding="async"
      />
   </a>
   <div class="beatmap-card__details">
      {#each links as [link, destination], index}
         <a class="beatmap-card__link" href={destination.url}>{linkLabel(link, destination.name)}</a
         >
         {#if index !== links.length - 1}
            <span aria-hidden="true">|</span>
         {/if}
      {/each}
      <br />
      <h4 class="beatmap-card__title">
         {beatmap.songName} <span class="beatmap-card__subtitle">{beatmap.songSubName}</span>
      </h4>
      <span class="beatmap-card__artist">{beatmap.songAuthorName}</span><br />
      <span>
         <strong>BPM:</strong>
         {beatmap.beatsPerMinute.base}
         {#if beatmap.beatsPerMinute.base !== beatmap.beatsPerMinute.min || beatmap.beatsPerMinute.base !== beatmap.beatsPerMinute.max}
            (range {round(beatmap.beatsPerMinute.min, 2)}-{round(beatmap.beatsPerMinute.max, 2)})
         {/if}
      </span><br />
      <span><strong>Length:</strong> {toMMSS(beatmap.songDuration)}</span><br />
      <br />
   </div>
</article>

<style lang="scss">
   @layer layout {
      .beatmap-card {
         display: flex;
         width: 100%;
         align-items: flex-start;
         gap: 0.25rem;
         padding-top: 0.75rem;
         border-top: 1px solid #29466b;
         font-variant-numeric: tabular-nums;

         @media (min-width: 40rem) {
            gap: 0.5rem;
         }

         &__cover {
            display: block;
            width: 6rem;
            height: 6rem;
            flex-shrink: 0;
            overflow: hidden;
            margin: 0.25rem;
            border: 1px solid #6883ad;
            box-shadow: -0.1875em 0.1875em 0.375em #0008;
            transition-property:
               color, background-color, border-color, outline-color, text-decoration-color, fill,
               stroke, opacity, box-shadow, transform, translate, scale, rotate, filter,
               backdrop-filter, display, content-visibility, overlay, pointer-events;
            transition-duration: 200ms;
            transition-timing-function: cubic-bezier(0, 0, 0.2, 1);

            &:hover {
               transform: scale(1.05);
               border-color: #ed1738;
               box-shadow: -0.125em 0.125em 0.5em #000f;
            }

            &:focus-visible {
               transform: scale(1.05);
               outline: 2px solid #6883ad;
               outline-offset: 4px;
            }

            @media (min-width: 40rem) {
               width: 8em;
               height: 8em;
               margin: 0.5rem;
            }

            @media (min-width: 48rem) {
               width: 9em;
               height: 9em;
            }
         }

         &__image {
            width: 100%;
            height: 100%;
            object-fit: cover;
         }

         &__details {
            min-width: 0;
            flex: 1;
            align-self: stretch;
            margin: 0.25rem;
            overflow-wrap: break-word;
            font-size: 0.875rem;
            line-height: calc(1.25 / 0.875);

            @media (min-width: 40rem) {
               margin: 0.5rem;
               font-size: 1rem;
               line-height: 1.5;
            }
         }

         &__link {
            display: inline-flex;
            min-height: 44px;
            align-items: center;
            margin-right: 0.25rem;
            padding-inline: 0.125rem;
            color: #ecebe6;
            font-family: 'Big Shoulders Display', sans-serif;
            font-size: 1.125rem;
            font-weight: 800;
            line-height: calc(1.75 / 1.125);
            letter-spacing: 0.025em;
            text-transform: uppercase;

            &:hover {
               color: #fff;
            }

            &:focus-visible {
               outline: 2px solid #6883ad;
               outline-offset: 2px;
            }
         }

         &__title {
            margin: 0;
            font-family: 'Big Shoulders Display', sans-serif;
            font-size: 1.875rem;
            font-weight: 800;
            line-height: 0.9;
            letter-spacing: -0.025em;
            text-transform: uppercase;

            @media (min-width: 40rem) {
               font-size: 2.25rem;
            }
         }

         &__subtitle {
            font-weight: 400;
         }

         &__artist {
            font-size: 0.875rem;
            line-height: calc(1.25 / 0.875);

            @media (min-width: 40rem) {
               font-size: 1rem;
               line-height: 1.5;
            }

            @media (min-width: 48rem) {
               font-size: 1.125rem;
               line-height: calc(1.75 / 1.125);
            }
         }
      }
   }
</style>
