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
         <p class="featured-video__subtitle">{currentVideo.subtitle}</p>
         <h3 class="featured-video__title">{currentVideo.title}</h3>
         {#if currentVideo.description}
            <p class="featured-video__description">{currentVideo.description}</p>
         {/if}
      </div>

      <div class="featured-video__actions">
         {#if featuredVideo.length > 1}
            <button
               class="featured-video__next"
               type="button"
               aria-label={`Show next featured video. Currently showing ${currentVideo.title}`}
               onclick={changeVideo}>Next video <span aria-hidden="true">→</span></button
            >
         {/if}
      </div>
   </div>
</article>

<style>
   .featured-video {
      position: relative;
      isolation: isolate;
      color: var(--color-paper);
   }

   .featured-video__media {
      position: relative;
      display: flex;
      width: 100%;
      aspect-ratio: 16 / 9;
      align-items: center;
      justify-content: center;
      isolation: isolate;
      background: var(--color-ink);
      box-shadow:
         -0.3rem 0 0 rgb(237 23 56 / 68%),
         0.3rem 0 0 color-mix(in srgb, var(--color-deep-blue) 88%, transparent);
   }

   .featured-video__media::before {
      position: absolute;
      z-index: -1;
      inset: -0.45rem -0.55rem;
      content: '';
      opacity: 0.82;
      background:
         linear-gradient(var(--color-paper), var(--color-paper)) 4% 7% / 18% 0.18rem no-repeat,
         linear-gradient(var(--color-signal-red), var(--color-signal-red)) 78% 2% / 16% 0.16rem
            no-repeat,
         linear-gradient(var(--color-deep-blue), var(--color-deep-blue)) 8% 98% / 27% 0.2rem
            no-repeat,
         linear-gradient(var(--color-signal-red), var(--color-signal-red)) 94% 88% / 0.22rem 22%
            no-repeat;
      transform: rotate(-0.35deg);
   }

   .featured-video__media::after {
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

   .featured-video__iframe {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
      background: var(--color-ink);
   }

   .featured-video__status {
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
   }

   .featured-video__status--overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      background: var(--color-ink);
   }

   .featured-video__status--empty {
      min-height: 0;
      padding: 1.5rem;
   }

   /* A single ink pass, not a measured progress indicator or an endless loader. */
   .featured-video__status:not(.featured-video__status--empty)::before,
   .featured-video__status:not(.featured-video__status--empty)::after {
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

   .featured-video__status:not(.featured-video__status--empty)::after {
      width: 5rem;
      margin-top: -1px;
      background: var(--color-signal-red);
   }

   @media (prefers-reduced-motion: no-preference) {
      .featured-video__status:not(.featured-video__status--empty)::after {
         animation: featured-print-loading var(--home-motion-reveal-duration, 620ms) steps(5, end)
            backwards;
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

   .featured-video__caption {
      position: relative;
      display: grid;
      gap: 1rem;
      margin: -0.2rem 0.65rem 0;
      padding: 1rem 1rem 0.9rem;
      isolation: isolate;
      color: var(--color-ink);
   }

   .featured-video__caption::before {
      position: absolute;
      z-index: -1;
      inset: 0;
      content: '';
      background-color: var(--color-paper);
      clip-path: polygon(0.8% 3%, 98.7% 0, 100% 90%, 97.8% 100%, 1.2% 96.5%, 0 13%);
      filter: drop-shadow(-0.22rem 0.12rem 0 rgb(237 23 56 / 44%))
         drop-shadow(0.2rem -0.1rem 0 color-mix(in srgb, var(--color-deep-blue) 62%, transparent));
   }

	.featured-video__caption::after {
      position: absolute;
      z-index: 0;
      inset: 0.2rem 0.5rem;
      content: '';
      background: var(--color-ink);
      mask-image: url('../assets/ink/scratch-field-1.svg');
      mask-position: center;
      mask-repeat: no-repeat;
		mask-size: 115% 150%;
		opacity: 0.18;
      pointer-events: none;
      transform: rotate(-0.4deg);
   }

   .featured-video__details,
   .featured-video__actions {
      position: relative;
      z-index: 1;
   }

   .featured-video__subtitle {
      margin: 0;
      color: color-mix(in srgb, var(--color-signal-red) 72%, var(--color-ink));
      font-family: var(--font-mono);
      font-size: 0.875rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      line-height: 1.45;
      text-transform: uppercase;
   }

   .featured-video__title {
      margin: 0.2rem 0 0;
      color: var(--color-ink);
      font-family: var(--font-display);
      font-size: clamp(1.5rem, 4vw, 2rem);
      font-weight: 800;
      line-height: 1;
      text-shadow: none;
   }

   .featured-video__description {
      max-width: 65ch;
      margin: 0.55rem 0 0;
      color: var(--color-ink);
      font-family: var(--font-sans);
      font-size: 1rem;
      line-height: 1.5;
      text-shadow: none;
   }

   .featured-video__subtitle {
      text-shadow: none;
   }

   .featured-video__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
   }

   .featured-video__next {
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
      transition:
         color var(--duration-fast) ease,
         background-color var(--duration-fast) ease,
         box-shadow var(--duration-fast) ease;
   }

   .featured-video__next:hover {
      color: var(--color-ink);
      background: var(--color-paper);
      box-shadow:
         -0.18rem 0 0 var(--color-signal-red),
         0.18rem 0 0 var(--color-deep-blue);
   }

   .featured-video__next:focus-visible {
      outline: 2px solid var(--color-signal-cyan);
      outline-offset: 3px;
   }

   @media (min-width: 48rem) {
      .featured-video__caption {
         grid-template-columns: minmax(0, 1fr) auto;
         align-items: start;
         padding-inline: 1.35rem;
      }

      .featured-video__actions {
         justify-content: flex-end;
      }
   }

   @media (prefers-reduced-motion: reduce) {
      .featured-video__next {
         transition: none;
      }
   }
</style>
