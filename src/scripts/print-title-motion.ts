import { startPrintTitleResolve } from './print-title-resolve';
import '../styles/print-title-resolve.css';

const TITLE_SELECTOR = [
   '.project-opening > header .print-heading__title',
   '.blog-opening__title',
   '.blog-post-title',
   '.commission-index__copy > header > h2',
   '.commission-hero__paper .commission-banner',
   '.estimator-header > h2',
   '.error-print > h1',
].join(', ');

const played = new WeakSet<HTMLElement>();
const active = new Map<
   HTMLElement,
   {
      dispose: () => void;
      timer: number;
      generation: number;
   }
>();
let observer: IntersectionObserver | undefined;
let registeredBody: HTMLElement | undefined;
let registrationGeneration = 0;
let navigationGeneration = 0;
let loadedNavigationGeneration = 0;
let waitingForViewTransition = false;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const finish = (title: HTMLElement, expectedGeneration?: number) => {
   const effect = active.get(title);
   if (!effect) return;
   if (expectedGeneration !== undefined && effect.generation !== expectedGeneration) return;
   window.clearTimeout(effect.timer);
   effect.dispose();
   active.delete(title);
   observer?.unobserve(title);
};

const clear = () => {
   registrationGeneration += 1;
   observer?.disconnect();
   observer = undefined;
   active.forEach((_, title) => finish(title));
   registeredBody = undefined;
};

const register = (expectedNavigationGeneration = navigationGeneration) => {
   if (
      expectedNavigationGeneration !== navigationGeneration ||
      loadedNavigationGeneration !== navigationGeneration ||
      waitingForViewTransition ||
      document.hidden
   ) {
      return;
   }
   if (registeredBody === document.body) return;
   clear();
   if (!document.body.classList.contains('print-page') || !('IntersectionObserver' in window))
      return;
   const titles = Array.from(document.querySelectorAll<HTMLElement>(TITLE_SELECTOR));
   if (reducedMotion() || document.documentElement.dataset.printMotionBoot === 'expired') {
      titles.forEach((title) => played.add(title));
      return;
   }
   const body = document.body;
   registeredBody = body;
   const generation = registrationGeneration;
   observer = new IntersectionObserver(
      (entries) => {
         entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
            const title = target as HTMLElement;
            if (generation !== registrationGeneration || registeredBody !== body) return;
            if (document.hidden || reducedMotion()) {
               if (reducedMotion()) played.add(title);
               finish(title, generation);
               return;
            }
            if (!isIntersecting || intersectionRatio < 0.15) {
               finish(title, generation);
               return;
            }
            if (played.has(title)) return;
            played.add(title);
            const dispose = startPrintTitleResolve(title);
            const timer = window.setTimeout(() => finish(title, generation), 800);
            active.set(title, { dispose, timer, generation });
         });
      },
      { threshold: 0.15 },
   );
   titles.forEach((title) => {
      if (!played.has(title)) observer?.observe(title);
   });
};

if (typeof document !== 'undefined' && !document.documentElement.dataset.printTitleMotionBound) {
   document.documentElement.dataset.printTitleMotionBound = 'true';
   document.addEventListener('astro:before-swap', (event) => {
      clear();
      navigationGeneration += 1;
      const generation = navigationGeneration;
      const viewTransition = (event as Event & { viewTransition?: { finished: Promise<unknown> } })
         .viewTransition;
      waitingForViewTransition = Boolean(viewTransition);
      if (!viewTransition) return;

      const release = () => {
         if (generation !== navigationGeneration) return;
         waitingForViewTransition = false;
         // A prior navigation may finish after a later body has loaded.
         if (loadedNavigationGeneration === generation) register(generation);
      };
      void viewTransition.finished.then(release, release);
   });
   document.addEventListener('astro:page-load', () => {
      loadedNavigationGeneration = navigationGeneration;
      register(navigationGeneration);
   });
   document.addEventListener('visibilitychange', () => {
      if (document.hidden) clear();
      else register();
   });
   window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
      clear();
      register();
   });
   window.addEventListener('resize', () => active.forEach((_, title) => finish(title)), {
      passive: true,
   });
   document.addEventListener('focusin', ({ target }) => {
      if (target instanceof Element) {
         active.forEach((_, title) => {
            if (title.contains(target)) finish(title);
         });
      }
   });
   register();
}
