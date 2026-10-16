import type {
   TransitionBeforePreparationEvent,
   TransitionBeforeSwapEvent,
} from 'astro:transitions/client';
import { getPrintMotionTargets, PRINT_MOTION_BOOT_TIMEOUT } from './print-motion-targets';
import './navigation-focus';

// This controller owns the handoff between pages. Each page's motion controller
// retains ownership of its entrance and static fallback.
if (!document.documentElement.dataset.siteNavigationBound) {
   const printNavigations = new WeakMap<AbortSignal, { generation: number; enabled: boolean }>();
   let printTransitionGeneration = 0;
   let printBootGeneration = 0;
   let printBootTimer: number | undefined;
   let exitingPage: HTMLElement | undefined;
   let loadingTimer: number | undefined;
   let loadingPage: HTMLElement | undefined;

   const clearPageLoading = () => {
      window.clearTimeout(loadingTimer);
      loadingTimer = undefined;
      loadingPage?.removeAttribute('aria-busy');
      loadingPage = undefined;
      const status = document.getElementById('page-loading-status');
      if (status) status.textContent = '';
   };

   const clearPrintExit = () => {
      exitingPage?.removeAttribute('data-print-exit');
      exitingPage?.style.removeProperty('--print-exit-top');
      exitingPage?.style.removeProperty('--print-exit-unit');
      if (exitingPage && !exitingPage.style.length) exitingPage.removeAttribute('style');
      exitingPage = undefined;
   };

   const clearPrintTransition = () => {
      document.documentElement.removeAttribute('data-print-transition');
   };

   const exposePreparedPrint = (bootId: string) => {
      window.clearTimeout(printBootTimer);
      printBootTimer = undefined;
      if (document.documentElement.dataset.printMotionBootId !== bootId) return;
      if (document.documentElement.dataset.printMotionBoot !== 'pending') return;
      document.documentElement.dataset.printMotionBoot = 'expired';
      getPrintMotionTargets(document).forEach((target) =>
         target.removeAttribute('data-print-motion-prepared'),
      );
   };

   const armPreparedMotion = () => {
      window.clearTimeout(printBootTimer);
      const hero = document.querySelector<HTMLElement>('.mixed-hero');
      if (hero?.dataset.homeMotionBoot === 'pending') {
         printBootTimer = window.setTimeout(() => {
            if (hero.isConnected && hero.dataset.homeMotionBoot === 'pending') {
               hero.dataset.homeMotionBoot = 'expired';
            }
         }, PRINT_MOTION_BOOT_TIMEOUT);
         return;
      }
      if (
         !document.body.classList.contains('print-page') ||
         window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
         document.documentElement.dataset.printMotionBoot !== 'pending'
      ) {
         return;
      }
      const bootId = document.documentElement.dataset.printMotionBootId;
      if (!bootId) return;
      printBootTimer = window.setTimeout(
         () => exposePreparedPrint(bootId),
         PRINT_MOTION_BOOT_TIMEOUT,
      );
   };

   const prepareIncomingMotion = (nextDocument: Document) => {
      const hero = nextDocument.querySelector<HTMLElement>('.mixed-hero');
      if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
         // Astro can reuse the homepage script on return. Prepare the new hero
         // before its snapshot instead of relying on the inline bootstrap to rerun.
         hero.dataset.homeMotionBoot = 'pending';
      }
      if (
         !nextDocument.body.classList.contains('print-page') ||
         window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
         return;
      }
      nextDocument.documentElement.dataset.printMotionBootId = String(++printBootGeneration);
      nextDocument.documentElement.dataset.printMotionBoot = 'pending';
      getPrintMotionTargets(nextDocument).forEach((target) =>
         target.setAttribute('data-print-motion-prepared', 'pending'),
      );
   };

   document.addEventListener('astro:before-preparation', (event) => {
      clearPrintExit();
      clearPageLoading();
      const transitionEvent = event as TransitionBeforePreparationEvent;
      const generation = ++printTransitionGeneration;
      // Cached routes need no flashing indicator; slow loads retain the usable page.
      loadingTimer = window.setTimeout(() => {
         if (generation !== printTransitionGeneration || transitionEvent.signal.aborted) return;
         loadingPage = document.querySelector('main') ?? undefined;
         loadingPage?.setAttribute('aria-busy', 'true');
         const status = document.getElementById('page-loading-status');
         if (status) status.textContent = 'Loading page…';
      }, 200);
      const targetPath = transitionEvent.to.pathname.replace(/\/+$/, '') || '/';
      const pendingPrintTransition =
         (document.body.classList.contains('print-page') ||
            !!document.querySelector('.mixed-hero')) &&
         targetPath !== '/cv';
      // A skipped native transition can still swap after the next preparation.
      // Keep its eligibility and cleanup generation tied to its own navigation.
      printNavigations.set(transitionEvent.signal, { generation, enabled: pendingPrintTransition });
      if (
         pendingPrintTransition &&
         !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
         document.documentElement.dataset.printTransition = transitionEvent.direction;
         document.documentElement.dataset.printMotionWait = 'true';
      } else {
         clearPrintTransition();
         document.documentElement.removeAttribute('data-print-motion-wait');
      }
      const cancelNavigation = () => {
         if (generation !== printTransitionGeneration) return;
         clearPageLoading();
         clearPrintExit();
         clearPrintTransition();
         document.documentElement.removeAttribute('data-print-motion-wait');
         document.dispatchEvent(new Event('print-page-motion-ready'));
      };
      transitionEvent.signal.addEventListener('abort', cancelNavigation, { once: true });
      const originalLoader = transitionEvent.loader;
      transitionEvent.loader = async () => {
         // Load first: a slow or failed request must leave the old page usable.
         try {
            await originalLoader();
         } catch (error) {
            // Failed loaders do not reach the swap/finish events that normally
            // release the old page. Restore it without swallowing the error.
            cancelNavigation();
            throw error;
         } finally {
            if (generation === printTransitionGeneration) clearPageLoading();
         }
         if (transitionEvent.defaultPrevented) cancelNavigation();
         if (
            !pendingPrintTransition ||
            transitionEvent.signal.aborted ||
            transitionEvent.defaultPrevented ||
            document.hidden ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            !(
               transitionEvent.newDocument.body.classList.contains('print-page') ||
               transitionEvent.newDocument.querySelector('.mixed-hero')
            )
         )
            return;

         const page = document.querySelector('main');
         if (!(page instanceof HTMLElement)) return;
         exitingPage = page;
         // Size the cuts to the visible page, not a long document's full height.
         page.style.setProperty('--print-exit-top', `${-page.getBoundingClientRect().top}px`);
         page.style.setProperty('--print-exit-unit', `${window.innerHeight / 100}px`);
         page.dataset.printExit = '';
         const erase = page
            .getAnimations()
            .find(
               (animation) =>
                  animation instanceof CSSAnimation &&
                  animation.animationName === 'print-page-ink-out',
            );
         // Hold the final black pose until swap. Removing the marker on
         // abort, reduced motion, or a hidden tab cancels this wait safely.
         if (erase) await erase.finished.catch(() => undefined);
      };
   });
   document.addEventListener('astro:before-swap', (event) => {
      const transitionEvent = event as TransitionBeforeSwapEvent;
      prepareIncomingMotion(transitionEvent.newDocument);
      const navigation = printNavigations.get(transitionEvent.signal);
      const printTransition =
         navigation?.enabled &&
         (transitionEvent.newDocument.body.classList.contains('print-page') ||
            !!transitionEvent.newDocument.querySelector('.mixed-hero')) &&
         !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!printTransition) {
         clearPrintTransition();
         document.documentElement.removeAttribute('data-print-motion-wait');
         return;
      }
      transitionEvent.newDocument.documentElement.dataset.printTransition =
         transitionEvent.direction;
      transitionEvent.newDocument.documentElement.dataset.printMotionWait = 'true';
      const finishPrintTransition = () => {
         if (navigation.generation !== printTransitionGeneration) return;
         clearPrintTransition();
         document.documentElement.removeAttribute('data-print-motion-wait');
         document.dispatchEvent(new Event('print-page-motion-ready'));
      };
      // The old page is already black before the browser captures it.
      // A skipped native transition rejects ready, but still must fail open.
      transitionEvent.viewTransition.ready.catch(finishPrintTransition);
      transitionEvent.viewTransition.finished.then(finishPrintTransition, finishPrintTransition);
   });
   document.addEventListener('astro:after-swap', () => {
      clearPrintExit();
      armPreparedMotion();
   });
   armPreparedMotion();
   document.documentElement.dataset.siteNavigationBound = 'true';
   window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', clearPrintExit);
   document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearPrintExit();
   });
}
