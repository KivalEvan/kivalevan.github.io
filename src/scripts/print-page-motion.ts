import { getPrintMotionTargets } from './print-motion-targets';
import './print-title-motion';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

let entranceFrame: number | undefined;
const pendingEntrances = new Set<HTMLElement>();
let registeredBody: HTMLElement | undefined;
const activeEntrances = new Map<HTMLElement, Animation[]>();
const registeredTargets = new Set<HTMLElement>();
const entranceStarted = new WeakSet<HTMLElement>();
const entranceCompleted = new WeakSet<HTMLElement>();

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
   pendingEntrances.clear();
   activeEntrances.forEach((animations) => animations.forEach((animation) => animation.cancel()));
   activeEntrances.clear();
   registeredTargets.forEach((target) => {
      target.removeAttribute('data-print-motion-entrance');
      target.removeAttribute('data-print-motion-prepared');
   });
   registeredTargets.clear();
};

const finishEntrance = (target: HTMLElement, animations: Animation[]) => {
   entranceCompleted.add(target);
   activeEntrances.delete(target);
   pendingEntrances.delete(target);
   target.removeAttribute('data-print-motion-entrance');
   target.removeAttribute('data-print-motion-prepared');
   animations.forEach((animation) => animation.cancel());
};

const startEntrance = (target: HTMLElement) => {
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
   Promise.all(animations.map((animation) => animation.finished)).then(
      () => finishEntrance(target, animations),
      () => finishEntrance(target, animations),
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
            activeEntrances.get(target)?.forEach((animation) => animation.cancel());
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
         activeEntrances.get(root)?.forEach((animation) => animation.cancel());
         entranceCompleted.add(root);
         root.removeAttribute('data-print-motion-entrance');
         root.removeAttribute('data-print-motion-prepared');
         pendingEntrances.delete(root);
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
