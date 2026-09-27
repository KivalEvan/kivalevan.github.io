<script lang="ts">
   import { onMount } from 'svelte';
   import _featuredVideo from '../data/featuredVideo.json';

   interface FeaturedVideo {
      title: string;
      subtitle: string;
      description: string;
      src: string;
   }

   const featuredVideo = _featuredVideo as FeaturedVideo[];
   const fallbackVideo: FeaturedVideo = {
      title: 'Featured video',
      subtitle: 'Not available right now',
      description: 'I do not have a featured video to show right now.',
      src: '',
   };
   const videos = featuredVideo.length > 0 ? featuredVideo : [fallbackVideo];
   let index = $state(0);
   let videoReady = $state(false);
   let videoLoaded = $state(false);
   let currentVideo = $derived(videos[index] ?? fallbackVideo);
   let watchUrl = $derived(
      currentVideo.src.replace('www.youtube-nocookie.com/embed/', 'www.youtube.com/watch?v='),
   );

   onMount(() => {
      videoReady = true;
   });

   function changeVideo() {
      if (featuredVideo.length < 2) return;
      videoReady = false;
      videoLoaded = false;
      index = (index + 1) % featuredVideo.length;
      requestAnimationFrame(() => {
         videoReady = true;
      });
   }
</script>

<article class="featured-video">
   <div class="featured-video__media">
      {#if currentVideo.src}
         {#if videoReady}
            <iframe
               class="featured-video__iframe"
               src={currentVideo.src}
               title={currentVideo.title}
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowfullscreen
               loading="lazy"
               onload={() => (videoLoaded = true)}
            ></iframe>
            {#if !videoLoaded}
               <p class="featured-video__status featured-video__status--overlay" role="status">
                  Loading featured video…
               </p>
            {/if}
         {:else}
            <p class="featured-video__status" role="status">Loading featured video…</p>
         {/if}
      {:else}
         <p class="featured-video__status featured-video__status--empty" role="status">
            No featured video is available.
         </p>
      {/if}
   </div>

   <div class="featured-video__caption">
      <div class="featured-video__details" aria-live="polite" aria-atomic="true">
         <h3 class="featured-video__title">{currentVideo.title}</h3>
         <p class="featured-video__subtitle">{currentVideo.subtitle}</p>
         {#if currentVideo.description}
            <p class="featured-video__description">{currentVideo.description}</p>
         {/if}
      </div>

      <div class="featured-video__actions">
         {#if watchUrl}
            <a
               class="featured-video__watch"
               href={watchUrl}
               target="_blank"
               rel="noopener noreferrer"
            >
               Watch on YouTube <span class="sr-only">(opens in a new tab)</span>
            </a>
         {/if}
         {#if featuredVideo.length > 1}
            <button
               class="featured-video__next"
               type="button"
               disabled={!videoReady}
               aria-label={`Show next featured video. Currently showing ${currentVideo.title}`}
               onclick={changeVideo}>Next video <span aria-hidden="true">→</span></button
            >
         {/if}
      </div>
   </div>
</article>

<style lang="scss">
   .featured-video {
      position: relative;
      isolation: isolate;
      color: var(--color-paper);

      &__media {
         position: relative;
         display: flex;
         width: 100%;
         aspect-ratio: 16 / 9;
         align-items: center;
         justify-content: center;
         isolation: isolate;
         background: var(--color-ink);
         border: 1px solid color-mix(in srgb, var(--color-paper) 35%, transparent);

         &::before {
            position: absolute;
            z-index: -1;
            inset: -0.45rem -0.55rem;
            content: '';
            opacity: 0.82;
            background:
               linear-gradient(var(--color-paper), var(--color-paper)) 4% 7% / 18% 0.18rem no-repeat,
               linear-gradient(var(--color-signal-red), var(--color-signal-red)) 78% 2% / 16%
                  0.16rem no-repeat,
               linear-gradient(var(--color-deep-blue), var(--color-deep-blue)) 8% 98% / 27% 0.2rem
                  no-repeat,
               linear-gradient(var(--color-signal-red), var(--color-signal-red)) 94% 88% / 0.22rem
                  22% no-repeat;
         }

         &::after {
            position: absolute;
            z-index: -1;
            right: 7%;
            bottom: -0.32rem;
            width: 34%;
            height: 0.12rem;
            content: '';
            background: var(--color-paper);
            opacity: 0.55;
            transform: rotate(1.5deg);
         }
      }

      &__iframe {
         display: block;
         width: 100%;
         height: 100%;
         border: 0;
         background: var(--color-ink);
      }

      &__status {
         position: relative;
         display: flex;
         width: 100%;
         height: 100%;
         min-height: 12rem;
         align-items: center;
         justify-content: center;
         margin: 0;
         padding: 1rem;
         color: var(--color-paper);
         text-align: center;
         font-family: var(--font-mono);
         font-size: 0.875rem;

         &--overlay {
            position: absolute;
            inset: 0;
            z-index: 1;
            pointer-events: none;
            background: var(--color-ink);
         }

         &--empty {
            min-height: 0;
            padding: 1.5rem;
         }
      }

      /* A single ink pass, not a measured progress indicator or an endless loader. */
      &__status:not(.featured-video__status--empty) {
         &::before,
         &::after {
            content: '';
            position: absolute;
            top: calc(50% + 1.3rem);
            left: calc(50% - 4rem);
            width: 8rem;
            height: 0.35rem;
            background: var(--color-ink-petrol);
            mask: url('../assets/ink/organic-drag-2.svg') center / 100% 100% no-repeat;
            opacity: 0.7;
            pointer-events: none;
         }

         &::after {
            width: 5rem;
            margin-top: -1px;
            background: var(--color-signal-red);
         }
      }

      @media (prefers-reduced-motion: no-preference) {
         &__status:not(.featured-video__status--empty)::after {
            animation: featured-print-loading 583.3333333ms steps(7, end) backwards;
         }
      }

      @keyframes featured-print-loading {
         from {
            clip-path: inset(0 100% 0 0);
         }
         to {
            clip-path: inset(0);
         }
      }

      &__caption {
         position: relative;
         display: grid;
         gap: 1rem;
         margin: 0.65rem 0 0;
         padding: 1.2rem 1.25rem 1.35rem;
         isolation: isolate;
         color: var(--color-ink);

         &::before {
            position: absolute;
            z-index: -1;
            inset: 0;
            content: '';
            background-color: var(--color-paper);
            clip-path: var(
               --print-paper-cut,
               polygon(0.8% 3%, 98.7% 0, 100% 90%, 97.8% 100%, 1.2% 96.5%, 0 13%)
            );
         }

         &::after {
            position: absolute;
            z-index: 0;
            inset: auto 0.5rem 0.2rem;
            height: 0.4rem;
            content: '';
            background: var(--color-ink);
            mask-image: url('../assets/ink/scratch-field-1.svg');
            mask-position: center;
            mask-repeat: no-repeat;
            mask-size: 115% 150%;
            opacity: 0.4;
            pointer-events: none;
            transform: rotate(-0.4deg);
         }
      }

      &__details,
      &__actions {
         position: relative;
         z-index: 1;
      }

      &__subtitle {
         margin: 0.5rem 0 0;
         color: color-mix(in srgb, var(--color-signal-red) 72%, var(--color-ink));
         font-family: var(--font-mono);
         font-size: 0.72rem;
         font-weight: 700;
         letter-spacing: 0.06em;
         line-height: 1.45;
         text-transform: uppercase;
      }

      &__title {
         margin: 0;
         color: var(--color-ink);
         font-family: var(--font-display);
         font-size: clamp(1.5rem, 4vw, 2.5rem);
         font-weight: 800;
         line-height: 1;
         text-shadow: none;
      }

      &__description {
         max-width: 65ch;
         margin: 0.55rem 0 0;
         color: var(--color-ink);
         font-family: var(--font-sans);
         font-size: 1rem;
         line-height: 1.5;
         text-shadow: none;
      }

      &__subtitle {
         text-shadow: none;
      }

      &__actions {
         display: flex;
         flex-wrap: wrap;
         align-items: center;
         gap: 0.5rem 1rem;
      }

      &__watch {
         display: inline-flex;
         min-height: 44px;
         align-items: center;
         color: var(--color-ink);
         font-size: 0.875rem;
         text-decoration: underline;
         text-underline-offset: 0.2em;
         text-shadow: none;

         &:hover {
            text-decoration-thickness: 2px;
         }

         &:focus-visible {
            outline: 2px solid var(--color-ink-petrol);
            outline-offset: 3px;
         }
      }

      &__next {
         display: inline-flex;
         min-height: 44px;
         cursor: pointer;
         align-items: center;
         gap: 0.35rem;
         border: 1px solid var(--color-ink);
         padding: 0.55rem 0.75rem;
         color: var(--color-paper);
         background: var(--color-ink);
         font-family: var(--font-mono);
         font-size: 0.875rem;
         font-weight: 700;
         line-height: 1.2;
         transition: none;

         &:hover {
            color: var(--color-ink);
            background: var(--color-paper);
            box-shadow:
               -0.18rem 0 0 var(--color-signal-red),
               0.18rem 0 0 var(--color-deep-blue);
         }

         &:disabled {
            cursor: wait;
            color: var(--color-paper);
            background: var(--color-ink);
            box-shadow: none;
            opacity: 0.65;
         }

         &:focus-visible {
            outline: 2px solid var(--color-signal-cyan);
            outline-offset: 3px;
         }
      }

      @media (min-width: 48rem) {
         &__caption {
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: start;
            padding-inline: 1.35rem;
         }

         &__actions {
            justify-content: flex-end;
         }
      }

      @media (prefers-reduced-motion: reduce) {
         &__next {
            transition: none;
         }
      }
   }
</style>
