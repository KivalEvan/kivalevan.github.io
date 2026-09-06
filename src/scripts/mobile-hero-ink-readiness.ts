const MOBILE_QUERY = '(max-width: 47.99rem)';
const READINESS_BUDGET = 1_200;

/**
 * Decode only the CSS-selected ink registration and portrait before entrance.
 * Resolves false on failure, cancellation, or the existing bootstrap's expiry;
 * callers must expose the static composition rather than replay a missed pose.
 * The caller owns the signal through the entire entrance (including resize).
 */
export const prepareHeroInk = (hero: HTMLElement, signal: AbortSignal): Promise<boolean> => {
   return new Promise((resolve) => {
      let settled = false;
      const finish = (ready: boolean) => {
         if (settled) return;
         settled = true;
         window.clearTimeout(timer);
         observer.disconnect();
         signal.removeEventListener('abort', cancel);
         document.removeEventListener('print-page-motion-ready', check);
         resolve(ready);
      };
      const cancel = () => finish(false);
      let decoded = false;
      const check = () => {
         if (signal.aborted || !hero.isConnected || hero.dataset.homeMotionBoot !== 'pending') {
            finish(false);
         } else if (decoded && document.documentElement.dataset.printMotionWait !== 'true') {
            finish(true);
         }
      };
      const timer = window.setTimeout(cancel, READINESS_BUDGET);
      const observer = new MutationObserver(check);
      observer.observe(hero, { attributes: true, attributeFilter: ['data-home-motion-boot'] });
      signal.addEventListener('abort', cancel, { once: true });
      document.addEventListener('print-page-motion-ready', check);

      const images: HTMLImageElement[] = [];
      if (window.matchMedia(MOBILE_QUERY).matches) {
         const registrations = Array.from(
            hero.querySelectorAll<HTMLElement>('[data-hero-plane-viewport]'),
         ).filter((plane) => getComputedStyle(plane).display !== 'none');
         const frames = registrations.flatMap((plane) =>
            Array.from(plane.querySelectorAll<HTMLElement>('[data-hero-frame-src]')),
         );
         // Request the static fallback first, then every distinct state in this registration.
         frames.sort(
            (a, b) => Number(b.hasAttribute('data-final')) - Number(a.hasAttribute('data-final')),
         );
         for (const url of new Set(frames.map((frame) => frame.dataset.heroFrameSrc!))) {
            const image = new Image();
            image.fetchPriority = 'low';
            image.src = url;
            images.push(image);
         }
      }
      const portraits = hero.querySelectorAll<HTMLImageElement>(
         '[data-mobile-core] img, [data-mobile-decoration] img',
      );
      images.unshift(...portraits);
      Promise.all(images.map((image) => image.decode())).then(() => {
         decoded = true;
         check();
      }, cancel);
      check();
   });
};
