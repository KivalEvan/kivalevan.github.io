import { getPrintMotionTargets } from './print-motion-targets';
import './print-title-motion';
const PASSIVE_HEADING_SELECTOR = [
   '.print-heading',
   '.blog-opening__title',
   '.blog-post-title',
   '.commission-index__copy > header > h2',
   '.commission-hero__paper .commission-banner',
   '.estimator-header > h2',
   '.error-print > h1',
].join(', ');
const DECOR_SELECTOR = [
   '.project-opening',
   '.blog-opening',
   '.blog-post-header',
   '.commission-index__sheet',
   '.commission-hero__paper',
   '.estimator-header',
   '.error-print',
].join(', ');
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const POSE_PROPERTIES = [
   '--print-registration-x',
   '--print-registration-y',
   '--print-registration-rotate',
   '--print-ink-x',
   '--print-ink-y',
] as const;

interface PropertyOrigin {
   value: string;
   priority: string;
}

let entranceFrame: number | undefined;
const pendingEntrances = new Set<HTMLElement>();
let passiveObserver: IntersectionObserver | undefined;
let timer: number | undefined;
let cycleStartedAt: number | undefined;
let registeredBody: HTMLElement | undefined;
const activeEntrances = new Map<HTMLElement, Animation[]>();
const visibleHeadings = new Set<HTMLElement>();
const visibleDecor = new Set<HTMLElement>();
const registeredTargets = new Set<HTMLElement>();
const origins = new Map<HTMLElement, Map<(typeof POSE_PROPERTIES)[number], PropertyOrigin>>();
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

const captureOrigin = (target: HTMLElement) => {
   if (origins.has(target)) return;
   origins.set(
      target,
      new Map(
         POSE_PROPERTIES.map((property) => [
            property,
            {
               value: target.style.getPropertyValue(property),
               priority: target.style.getPropertyPriority(property),
            },
         ]),
      ),
   );
};

const restorePose = (target: HTMLElement) => {
   const origin = origins.get(target);
   if (!origin) return;
   origin.forEach(({ value, priority }, property) => {
      if (value) target.style.setProperty(property, value, priority);
      else target.style.removeProperty(property);
   });
   if (!target.style.length) target.removeAttribute('style');
   origins.delete(target);
};

const clear = () => {
   registeredBody = undefined;
   window.clearTimeout(timer);
   timer = undefined;
   cycleStartedAt = undefined;
   if (entranceFrame !== undefined) window.cancelAnimationFrame(entranceFrame);
   entranceFrame = undefined;
   pendingEntrances.clear();
   passiveObserver?.disconnect();
   passiveObserver = undefined;
   activeEntrances.forEach((animations) => animations.forEach((animation) => animation.cancel()));
   activeEntrances.clear();
   registeredTargets.forEach((target) => {
      restorePose(target);
      target.removeAttribute('data-print-motion-entrance');
      target.removeAttribute('data-print-motion-prepared');
      target.removeAttribute('data-print-motion-passive');
      target.removeAttribute('data-print-motion-decor');
   });
   registeredTargets.clear();
   visibleHeadings.clear();
   visibleDecor.clear();
};

const schedulePose = () => {
   if (timer !== undefined || !motionAllowed() || (!visibleHeadings.size && !visibleDecor.size))
      return;
   const now = performance.now();
   cycleStartedAt ??= now;
   const eventAt = now + 1800 + Math.random() * 1200;
   timer = window.setTimeout(
      () => {
         timer = undefined;
         if (!motionAllowed()) return;
         // No new poses in the last two seconds of each twelve-second cycle.
         if ((performance.now() - (cycleStartedAt ?? now)) % 12_000 >= 10_000) {
            schedulePose();
            return;
         }
         const candidates = Array.from(visibleHeadings).filter(
            (heading) => !heading.matches(':hover, :focus-within'),
         );
         const heading = candidates[Math.floor(Math.random() * candidates.length)];
         if (heading) {
            captureOrigin(heading);
            heading.style.setProperty(
               '--print-registration-x',
               Math.random() > 0.5 ? '1px' : '-1px',
            );
            heading.style.setProperty(
               '--print-registration-y',
               Math.random() > 0.5 ? '1px' : '-1px',
            );
            heading.style.setProperty(
               '--print-registration-rotate',
               Math.random() > 0.5 ? '0.35deg' : '-0.35deg',
            );
         }
         const decor = Array.from(visibleDecor).filter(
            (target) => !target.matches(':hover, :focus-within'),
         );
         const ink = decor[Math.floor(Math.random() * decor.length)];
         if (ink) {
            captureOrigin(ink);
            ink.style.setProperty('--print-ink-x', Math.random() > 0.5 ? '1px' : '-1px');
            ink.style.setProperty('--print-ink-y', Math.random() > 0.5 ? '1px' : '-1px');
         }
         schedulePose();
      },
      Math.max(350, eventAt - now),
   );
};

const startEntrance = (target: HTMLElement, delay: number) => {
   if (entranceStarted.has(target) || !motionAllowed()) return;
   // Expired or already-exposed bootstrap content must never be hidden for a late module.
   if (target.dataset.printMotionPrepared !== 'pending') return;
   entranceStarted.add(target);
   const animations = [
      target.animate(
         [
            {
               clipPath:
                  'polygon(-10% -10%, -10% -10%, -10% 8%, -10% 22%, -10% 37%, -10% 46%, -10% 63%, -10% 71%, -10% 88%, -10% 110%, -10% 110%)',
               offset: 0,
            },
            {
               clipPath:
                  'polygon(-10% -10%, 9% -10%, 18% 8%, 4% 22%, 22% 37%, 8% 46%, 17% 63%, 2% 71%, 12% 88%, 5% 110%, -10% 110%)',
               offset: 0.1,
            },
            {
               clipPath:
                  'polygon(-10% -10%, 25% -10%, 34% 8%, 19% 22%, 42% 37%, 23% 46%, 31% 63%, 15% 71%, 28% 88%, 19% 110%, -10% 110%)',
               offset: 0.2,
            },
            {
               clipPath:
                  'polygon(-10% -10%, 43% -10%, 48% 8%, 37% 22%, 52% 37%, 44% 46%, 47% 63%, 29% 71%, 39% 88%, 31% 110%, -10% 110%)',
               offset: 0.32,
            },
            {
               clipPath:
                  'polygon(-10% -10%, 62% -10%, 56% 8%, 68% 22%, 59% 37%, 60% 46%, 54% 63%, 44% 71%, 50% 88%, 45% 110%, -10% 110%)',
               offset: 0.44,
            },
            {
               clipPath:
                  'polygon(-10% -10%, 77% -10%, 72% 8%, 79% 22%, 65% 37%, 73% 46%, 61% 63%, 66% 71%, 58% 88%, 62% 110%, -10% 110%)',
               offset: 0.56,
            },
            {
               clipPath:
                  'polygon(-10% -10%, 88% -10%, 81% 8%, 89% 22%, 78% 37%, 84% 46%, 72% 63%, 79% 71%, 69% 88%, 75% 110%, -10% 110%)',
               offset: 0.68,
            },
            {
               clipPath:
                  'polygon(-10% -10%, 94% -10%, 89% 8%, 96% 22%, 84% 37%, 91% 46%, 79% 63%, 87% 71%, 73% 88%, 80% 110%, -10% 110%)',
               offset: 0.8,
            },
            {
               clipPath:
                  'polygon(-10% -10%, 103% -10%, 98% 8%, 104% 22%, 96% 37%, 101% 46%, 94% 63%, 99% 71%, 91% 88%, 97% 110%, -10% 110%)',
               offset: 0.9,
            },
            {
               clipPath:
                  'polygon(-10% -10%, 110% -10%, 110% 8%, 110% 22%, 110% 37%, 110% 46%, 110% 63%, 110% 71%, 110% 88%, 110% 110%, -10% 110%)',
               offset: 1,
            },
         ].map((frame) => ({ ...frame, easing: 'steps(1, end)' })),
         // Keep the final full plate through cleanup; backwards alone would briefly
         // restore the bootstrap mask at completion.
         // Match the outgoing snapshot's duration and held-pose offsets.
         { duration: 420, delay, easing: 'linear', fill: 'both' },
      ),
   ];
   activeEntrances.set(target, animations);
   Promise.all(animations.map((animation) => animation.finished)).then(
      () => {
         entranceCompleted.add(target);
         activeEntrances.delete(target);
         target.removeAttribute('data-print-motion-entrance');
         target.removeAttribute('data-print-motion-prepared');
         animations.forEach((animation) => animation.cancel());
         pendingEntrances.delete(target);
      },
      () => {
         activeEntrances.delete(target);
         target.removeAttribute('data-print-motion-entrance');
         target.removeAttribute('data-print-motion-prepared');
         entranceCompleted.add(target);
         pendingEntrances.delete(target);
      },
   );
};

// A clipped plate has no IntersectionObserver intersection. Measure its unchanged
// layout box instead, once per scroll frame, until its entrance is complete.
const checkEntrances = () => {
   if (entranceFrame !== undefined || !pendingEntrances.size || !motionAllowed()) return;
   entranceFrame = window.requestAnimationFrame(() => {
      entranceFrame = undefined;
      let visibleIndex = 0;
      pendingEntrances.forEach((target) => {
         const bounds = target.getBoundingClientRect();
         if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
            startEntrance(target, Math.min(visibleIndex++, 2) * 90);
         } else {
            activeEntrances.get(target)?.forEach((animation) => animation.cancel());
         }
      });
   });
};

const registerCurrentPage = () => {
   if (registeredBody === document.body) return;
   clear();
   if (!motionAllowed() || !('IntersectionObserver' in window)) return;
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
         target.dataset.printMotionEntrance = '';
         pendingEntrances.add(target);
      }
   });

   checkEntrances();

   passiveObserver = new IntersectionObserver(
      (entries) => {
         entries.forEach((entry) => {
            const target = entry.target as HTMLElement;
            const visible = target.hasAttribute('data-print-motion-decor')
               ? visibleDecor
               : visibleHeadings;
            if (entry.isIntersecting) visible.add(target);
            else {
               visible.delete(target);
               restorePose(target);
            }
         });
         schedulePose();
      },
      { threshold: 0.1 },
   );
   document.querySelectorAll<HTMLElement>(PASSIVE_HEADING_SELECTOR).forEach((target) => {
      registeredTargets.add(target);
      target.dataset.printMotionPassive = '';
      passiveObserver?.observe(target);
   });
   document.querySelectorAll<HTMLElement>(DECOR_SELECTOR).forEach((target) => {
      registeredTargets.add(target);
      target.dataset.printMotionDecor = '';
      passiveObserver?.observe(target);
   });
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
