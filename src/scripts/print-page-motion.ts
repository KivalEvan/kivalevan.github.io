import { getPrintMotionTargets } from './print-motion-targets';
import './print-title-motion';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const INK_READINESS_BUDGET = 1_200;

let entranceFrame: number | undefined;
const pendingEntrances = new Set<HTMLElement>();
let registeredBody: HTMLElement | undefined;
const activeEntrances = new Map<HTMLElement, Animation[]>();
const registeredTargets = new Set<HTMLElement>();
const entranceStarted = new WeakSet<HTMLElement>();
const entranceCompleted = new WeakSet<HTMLElement>();
const inkReadiness = new Map<HTMLElement, () => void>();

const motionAllowed = () =>
   !window.matchMedia(REDUCED_MOTION).matches &&
   !document.hidden &&
   document.body.classList.contains('print-page');

const hashTarget = () => {
   try {
      return document.getElementById(decodeURIComponent(location.hash.slice(1)));
   } catch {
      return null;
   }
};

const clear = () => {
   registeredBody = undefined;
   if (entranceFrame !== undefined) window.cancelAnimationFrame(entranceFrame);
   entranceFrame = undefined;
   inkReadiness.forEach((cancel) => cancel());
   inkReadiness.clear();
   pendingEntrances.clear();
   activeEntrances.forEach((animations) => animations.forEach((animation) => animation.cancel()));
   activeEntrances.clear();
   registeredTargets.forEach((target) => {
      target.removeAttribute('data-print-motion-entrance');
      target.removeAttribute('data-print-motion-prepared');
   });
   registeredTargets.clear();
};

const finishEntrance = (target: HTMLElement, animations = activeEntrances.get(target) ?? []) => {
   inkReadiness.get(target)?.();
   inkReadiness.delete(target);
   entranceCompleted.add(target);
   activeEntrances.delete(target);
   pendingEntrances.delete(target);
   if (registeredBody === document.body && target.isConnected && document.body.contains(target)) {
      target.removeAttribute('data-print-motion-entrance');
      target.removeAttribute('data-print-motion-prepared');
   }
   animations.forEach((animation) => animation.cancel());
};

const playEntrance = (target: HTMLElement) => {
   if (entranceStarted.has(target) || !motionAllowed()) return;
   // Expired or already-exposed bootstrap content must never be hidden for a late module.
   if (target.dataset.printMotionPrepared !== 'pending') return;
   entranceStarted.add(target);
   target.dataset.printMotionEntrance = '';
   // CSS targets decorative impressions only. Reading paper, text, screenshots,
   // and form controls never inherit a root-level clip or transform.
   const animations = target
      .getAnimations({ subtree: true })
      .filter(
         (animation) =>
            animation instanceof CSSAnimation &&
            animation.animationName.startsWith('print-material-'),
      );
   activeEntrances.set(target, animations);
   const finish = () => {
      // Cancellation can settle after disposal or a new route registration.
      if (activeEntrances.get(target) === animations) finishEntrance(target, animations);
   };
   Promise.all(animations.map((animation) => animation.finished)).then(finish, finish);
};

const selectedMobileInk = (target: HTMLElement) => {
   const urls = new Set<string>();
   for (const plate of target.querySelectorAll<HTMLElement>('.ink-collision__mobile')) {
      const style = getComputedStyle(plate);
      // Bootstrap visibility is intentionally hidden; display/layout determine
      // whether this CSS-selected plate is rendered, including hidden ancestors.
      if (style.display === 'none' || !plate.getClientRects().length) continue;
      const url = style.backgroundImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1];
      if (url) urls.add(url);
   }
   return [...urls].sort();
};

const startEntrance = (target: HTMLElement) => {
   if (entranceStarted.has(target) || inkReadiness.has(target) || !motionAllowed()) return;
   if (target.dataset.printMotionPrepared !== 'pending') return;
   const urls = selectedMobileInk(target);
   if (!urls.length) {
      playEntrance(target);
      return;
   }

   const current = () =>
      inkReadiness.get(target) === cancel &&
      registeredBody === document.body &&
      registeredTargets.has(target) &&
      target.isConnected &&
      document.body.contains(target);
   const sourceChanged = () => selectedMobileInk(target).join('\n') !== urls.join('\n');
   const cancel = () => {
      window.clearTimeout(timer);
      observer.disconnect();
   };
   const settle = (ready: boolean) => {
      if (!current()) {
         cancel();
         if (inkReadiness.get(target) === cancel) {
            inkReadiness.delete(target);
            pendingEntrances.delete(target);
         }
         return;
      }
      const bounds = target.getBoundingClientRect();
      if (
         !ready ||
         !motionAllowed() ||
         target.dataset.printMotionPrepared !== 'pending' ||
         sourceChanged() ||
         bounds.bottom <= 0 ||
         bounds.top >= window.innerHeight
      ) {
         finishEntrance(target);
         return;
      }
      window.clearTimeout(timer);
      // Keep the source observer until animation completion: a new aspect-ratio
      // plate must not pop into an entrance that is already underway.
      playEntrance(target);
   };
   const observer = new ResizeObserver(() => {
      if (!current() || sourceChanged()) settle(false);
   });
   const timer = window.setTimeout(() => settle(false), INK_READINESS_BUDGET);
   inkReadiness.set(target, cancel);
   target.querySelectorAll<HTMLElement>('.ink-collision__mobile').forEach((plate) => {
      observer.observe(plate);
   });
   // Decode only this entering group's rendered sources, never the variant list
   // or below-fold groups. Navigation and content do not await decorative ink.
   const images = urls.map((url) => {
      const image = new Image();
      image.src = url;
      return image.decode();
   });
   Promise.all(images).then(
      () => settle(true),
      () => settle(false),
   );
};

// Use the unchanged content box to reveal its decorative overflow, once per scroll frame.
const checkEntrances = () => {
   if (entranceFrame !== undefined || !pendingEntrances.size || !motionAllowed()) return;
   entranceFrame = window.requestAnimationFrame(() => {
      entranceFrame = undefined;
      pendingEntrances.forEach((target) => {
         const bounds = target.getBoundingClientRect();
         if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
            startEntrance(target);
         } else {
            if (inkReadiness.has(target) || activeEntrances.has(target)) finishEntrance(target);
         }
      });
   });
};

const registerCurrentPage = () => {
   if (registeredBody === document.body) return;
   clear();
   if (!motionAllowed() || !('CSSAnimation' in window) || !('getAnimations' in Element.prototype))
      return;
   registeredBody = document.body;
   if (document.documentElement.dataset.printMotionBoot === 'pending') {
      document.documentElement.dataset.printMotionBoot = 'ready';
   }

   getPrintMotionTargets().forEach((target) => {
      registeredTargets.add(target);
      if (!entranceStarted.has(target) && !entranceCompleted.has(target)) {
         // Only the pre-paint bootstrap may arm a reveal. This avoids a late
         // controller clipping a route snapshot the visitor has already seen.
         if (target.dataset.printMotionPrepared !== 'pending') return;
         pendingEntrances.add(target);
      }
   });

   checkEntrances();
};

if (typeof document !== 'undefined' && !document.documentElement.dataset.printPageMotionBound) {
   document.documentElement.dataset.printPageMotionBound = 'true';
   document.addEventListener('astro:before-swap', clear);
   document.addEventListener('astro:page-load', () => {
      if (!document.documentElement.dataset.printMotionWait) registerCurrentPage();
   });
   document.addEventListener('print-page-motion-ready', registerCurrentPage);
   window.addEventListener('scroll', checkEntrances, { passive: true });
   window.addEventListener('resize', checkEntrances, { passive: true });
   document.addEventListener('visibilitychange', () => {
      if (document.hidden) clear();
      else registerCurrentPage();
   });
   const revealTarget = (target: Element) => {
      registeredTargets.forEach((root) => {
         if (!root.contains(target)) return;
         finishEntrance(root);
      });
   };
   document.addEventListener('focusin', (event) => {
      if (event.target instanceof Element) revealTarget(event.target);
   });
   window.addEventListener('hashchange', () => {
      const target = hashTarget();
      if (target) revealTarget(target);
   });
   window.matchMedia(REDUCED_MOTION).addEventListener('change', () => {
      clear();
      registerCurrentPage();
   });
   registerCurrentPage();
   const initialHashTarget = hashTarget();
   if (initialHashTarget) revealTarget(initialHashTarget);
}
