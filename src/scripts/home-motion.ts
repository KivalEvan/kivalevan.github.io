import { prepareHeroInk } from './mobile-hero-ink-readiness';
import { playPoseSequence } from './pose-sequence';
import { startPrintTitleResolve } from './print-title-resolve';

/**
 * One-time homepage print assembly.
 *
 * Registering a root is intentionally small: future home sections can opt into
 * the same observer lifecycle once they have their own CSS motion contract.
 */
export interface HomeMotionOptions {
   /** CSS class applied while the registered root is assembling. */
   activeClass?: string;
   /** Descendant whose matching animation end restores the root's static styles. */
   completionTarget?: HTMLElement;
   /** Logical animation name, ignoring generated frame-rate suffixes; omit to accept the target's first end event. */
   completionAnimationName?: string;
   /** Safety cleanup delay in milliseconds; only used if the completion event never fires. */
   safetyTimeout?: number;
}

const HERO_SELECTOR = '.mixed-hero';
const DEFAULT_ACTIVE_CLASS = 'home-motion--playing';
const HERO_SAFETY_TIMEOUT = 5_000;
const VIEWPORT_BOTTOM_INSET = 140;
const TITLE_FPS = 12;
const TITLE_FRAME_MS = 1_000 / TITLE_FPS;
const TITLE_SCATTER_SPREADS = [1, 0.85, 0.65, 0.4, 0.18];
const TITLE_LAND_FRAME = TITLE_SCATTER_SPREADS.length;
const TITLE_DURATION_FRAMES = TITLE_LAND_FRAME + 1;
// Overlapping groups, not a left-to-right cascade. Missing beats hold the last
// position and face while neighboring letters jump. All land before 750ms.
const TITLE_SCATTER_PASSES = [
   { delay: 0, beats: [0, 1, 3, 4] },
   { delay: 2, beats: [0, 2, 4] },
   { delay: 1, beats: [0, 2, 3, 4] },
   { delay: 3, beats: [0, 1, 3] },
   { delay: 1, beats: [0, 1, 2, 4] },
   { delay: 0, beats: [0, 2, 3] },
   { delay: 3, beats: [0, 2, 4] },
   { delay: 2, beats: [0, 1, 3, 4] },
   { delay: 1, beats: [0, 2, 4] },
] as const;
const TITLE_SHAPES = ['block', 'slash', 'chip'] as const;

interface TitleScatterPose {
   frame: number;
   translate: string;
   character: string;
   shape?: (typeof TITLE_SHAPES)[number];
}

interface TitleScatterGlyph {
   glyph: HTMLElement;
   overlay: HTMLSpanElement;
   animation: Animation;
   poses: TitleScatterPose[];
   landFrame: number;
   activePose: number;
   settled: boolean;
}

/**
 * Assemble scattered letters through staggered positions and temporary faces.
 * Original text, layout slots, and printed transforms remain untouched; completion
 * or cancellation removes every overlay and restores the exact wordmark.
 */
class TitleAssembly {
   private readonly slots: TitleScatterGlyph[];
   private cancelSequence?: () => void;
   private finished = false;

   constructor(private readonly hero: HTMLElement) {
      this.slots = Array.from(hero.querySelectorAll<HTMLElement>('.poster-glyph')).map(
         (glyph, index, glyphs) => {
            // Keep the edge letters' horizontal scatter inside the poster.
            const left = index === 0 ? 0 : -0.5;
            const right = index === glyphs.length - 1 ? 0 : 0.5;
            const pass = TITLE_SCATTER_PASSES[index % TITLE_SCATTER_PASSES.length];
            const characters = Array.from(
               glyph.dataset.letter === 'I' ? '1!|' : 'HNXKEAMRW237',
            ).filter((character) => character !== glyph.dataset.letter);
            const poses: TitleScatterPose[] = pass.beats.map((beat) => {
               const spread = TITLE_SCATTER_SPREADS[beat];
               const shape =
                  Math.random() < 0.32
                     ? TITLE_SHAPES[Math.floor(Math.random() * TITLE_SHAPES.length)]
                     : undefined;
               return {
                  frame: pass.delay + beat,
                  translate: `${(left + Math.random() * (right - left)) * spread}em ${(Math.random() * 1.65 - 1.2) * spread}em`,
                  character: shape ? '' : characters[Math.floor(Math.random() * characters.length)],
                  shape,
               };
            });
            const animation = glyph.animate(
               [
                  ...poses.map((pose) => ({
                     translate: pose.translate,
                     offset: (pose.frame - pass.delay) / TITLE_DURATION_FRAMES,
                     easing: 'steps(1, end)',
                  })),
                  {
                     translate: '0 0',
                     offset: TITLE_LAND_FRAME / TITLE_DURATION_FRAMES,
                     easing: 'steps(1, end)',
                  },
                  { translate: '0 0', offset: 1 },
               ],
               {
                  duration: TITLE_DURATION_FRAMES * TITLE_FRAME_MS,
                  delay: pass.delay * TITLE_FRAME_MS,
                  fill: 'both',
               },
            );
            animation.pause();
            const overlay = document.createElement('span');
            overlay.className = 'home-title-resolve__glyph';
            overlay.setAttribute('aria-hidden', 'true');
            overlay.dataset.tone = glyph.dataset.letter === 'V' ? 'crimson' : 'paper';
            glyph.classList.add('home-title-resolve__pending');
            glyph.append(overlay);
            return {
               glyph,
               overlay,
               animation,
               poses,
               landFrame: pass.delay + TITLE_LAND_FRAME,
               activePose: -1,
               settled: false,
            };
         },
      );
      hero.classList.add('home-title-assembling');
      this.render(0);
   }

   start() {
      if (this.finished || this.cancelSequence) return;
      this.slots.forEach(({ animation }) => animation.play());
      this.cancelSequence = playPoseSequence({
         fps: TITLE_FPS,
         frames: Math.max(...this.slots.map((slot) => slot.landFrame), 0) + 1,
         onFrame: (frame) => this.render(frame),
      });
   }

   private render(frame: number) {
      this.slots.forEach((slot) => {
         if (slot.settled) return;
         if (frame >= slot.landFrame) {
            this.restore(slot);
            return;
         }
         const index = Math.max(
            0,
            slot.poses.findLastIndex((pose) => pose.frame <= frame),
         );
         if (index === slot.activePose) return;
         slot.activePose = index;
         const pose = slot.poses[index];
         slot.overlay.textContent = pose.character;
         if (pose.shape) slot.overlay.dataset.shape = pose.shape;
         else delete slot.overlay.dataset.shape;
      });
   }

   private restore(slot: TitleScatterGlyph) {
      slot.settled = true;
      slot.glyph.classList.remove('home-title-resolve__pending');
      slot.overlay.remove();
   }

   showFinal() {
      if (this.finished) return;
      this.finished = true;
      this.cancelSequence?.();
      this.slots.forEach((slot) => {
         slot.animation.cancel();
         this.restore(slot);
      });
      this.hero.classList.remove('home-title-assembling');
   }
}

interface RegisteredMotion {
   root: HTMLElement;
   activeClass: string;
   completionTarget: HTMLElement;
   completionAnimationName?: string;
   safetyTimeout: number;
   safetyTimer?: number;
   entranceFrame?: number;
   titleAssembly?: TitleAssembly;
   cancelTitleResolve?: () => void;
   onAnimationEnd?: (event: AnimationEvent) => void;
   readiness?: AbortController;
   cancelReadiness?: () => void;
}

const registrations = new Map<HTMLElement, RegisteredMotion>();
let observer: IntersectionObserver | undefined;
let motionQuery: MediaQueryList | undefined;

const motionAllowed = () => !motionQuery?.matches;

const showFinal = (registration: RegisteredMotion) => {
   registration.cancelReadiness?.();
   registration.cancelReadiness = undefined;
   registration.readiness?.abort();
   registration.readiness = undefined;
   registration.root.classList.remove('home-motion--pending');
   registration.root.removeAttribute('data-home-motion-boot');
   window.clearTimeout(registration.safetyTimer);
   if (registration.entranceFrame !== undefined) cancelAnimationFrame(registration.entranceFrame);
   registration.entranceFrame = undefined;
   registration.titleAssembly?.showFinal();
   registration.titleAssembly = undefined;
   registration.cancelTitleResolve?.();
   registration.cancelTitleResolve = undefined;
   registration.root.classList.remove('home-motion--holding');
   registration.safetyTimer = undefined;
   if (registration.onAnimationEnd) {
      registration.completionTarget.removeEventListener(
         'animationend',
         registration.onAnimationEnd,
      );
      registration.onAnimationEnd = undefined;
   }
   registration.root.classList.remove(registration.activeClass);
};

const unregister = (registration: RegisteredMotion) => {
   observer?.unobserve(registration.root);
   showFinal(registration);
   registrations.delete(registration.root);
};

const start = (registration: RegisteredMotion) => {
   if (!registration.root.matches(HERO_SELECTOR)) {
      play(registration);
      return;
   }
   if (registration.readiness) return;
   if (
      registration.root.dataset.homeMotionBoot !== 'pending' ||
      !motionAllowed() ||
      document.hidden
   ) {
      registration.root.dataset.homeMotionPlayed = 'true';
      showFinal(registration);
      return;
   }
   const controller = new AbortController();
   registration.readiness = controller;
   const cancel = () => {
      registration.root.dataset.homeMotionPlayed = 'true';
      showFinal(registration);
   };
   const onVisibility = () => {
      if (document.hidden) cancel();
   };
   window.addEventListener('resize', cancel, { once: true });
   document.addEventListener('visibilitychange', onVisibility);
   registration.cancelReadiness = () => {
      window.removeEventListener('resize', cancel);
      document.removeEventListener('visibilitychange', onVisibility);
   };
   void prepareHeroInk(registration.root, controller.signal).then((ready) => {
      if (controller.signal.aborted) return;
      if (!ready) {
         cancel();
         return;
      }
      registration.root.dataset.heroInkReady = 'true';
      play(registration);
   });
};

const play = (registration: RegisteredMotion) => {
   // A late script must not hide artwork that the fail-open timer already exposed.
   if (registration.root.dataset.homeMotionBoot === 'expired') {
      registration.root.dataset.homeMotionPlayed = 'true';
   }
   if (!motionAllowed() || registration.root.dataset.homeMotionPlayed === 'true') {
      showFinal(registration);
      return;
   }

   registration.root.dataset.homeMotionPlayed = 'true';
   registration.onAnimationEnd = (event) => {
      if (event.target !== registration.completionTarget) return;
      if (
         registration.completionAnimationName &&
         event.animationName.replace(/--\d+fps-\d+f$/, '') !== registration.completionAnimationName
      ) {
         return;
      }
      showFinal(registration);
   };
   registration.completionTarget.addEventListener('animationend', registration.onAnimationEnd);
   registration.root.classList.remove('home-motion--pending');
   registration.root.classList.add(registration.activeClass);
   if (registration.root.matches('.print-heading')) {
      const title = registration.root.querySelector<HTMLElement>('.print-heading__title');
      if (title) registration.cancelTitleResolve = startPrintTitleResolve(title);
   }
   if (registration.root.matches(HERO_SELECTOR)) {
      registration.titleAssembly = new TitleAssembly(registration.root);
      // Give the decoded first pose a paint opportunity, then start every clock
      // together. Extra reading holds make the low-cadence poses feel delayed.
      registration.root.classList.add('home-motion--holding');
      registration.entranceFrame = requestAnimationFrame(() => {
         registration.entranceFrame = requestAnimationFrame(() => {
            registration.entranceFrame = undefined;
            registration.root.classList.remove('home-motion--holding');
            registration.titleAssembly?.start();
         });
      });
      registration.root.removeAttribute('data-home-motion-boot');
   }
   registration.safetyTimer = window.setTimeout(
      () => showFinal(registration),
      registration.safetyTimeout,
   );
};

const isInViewport = (root: HTMLElement, bottomInset = VIEWPORT_BOTTOM_INSET) => {
   const rect = root.getBoundingClientRect();
   const visibleWidth = Math.max(
      0,
      Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0),
   );
   const visibleHeight = Math.max(
      0,
      Math.min(rect.bottom, window.innerHeight - bottomInset) - Math.max(rect.top, 0),
   );
   return visibleWidth > 0 && visibleHeight > 0;
};

const observe = (registration: RegisteredMotion) => {
   if (!motionAllowed()) {
      showFinal(registration);
      return;
   }

   if (!('IntersectionObserver' in window)) {
      if (registration.root.dataset.homeMotionBoot === 'pending') start(registration);
      else {
         registration.root.dataset.homeMotionPlayed = 'true';
         showFinal(registration);
      }
      return;
   }

   // Never reset content the visitor may already have seen (including restored scroll positions).
   if (
      isInViewport(registration.root, 0) &&
      registration.root.dataset.homeMotionBoot !== 'pending'
   ) {
      registration.root.dataset.homeMotionPlayed = 'true';
      showFinal(registration);
      return;
   }

   registration.root.classList.add('home-motion--pending');
   if (isInViewport(registration.root)) {
      start(registration);
      return;
   }

   observer ??= new IntersectionObserver(
      (entries) => {
         for (const entry of entries) {
            if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) continue;
            const registration = registrations.get(entry.target);
            if (!registration) continue;
            observer?.unobserve(entry.target);
            start(registration);
         }
      },
      {
         // The inset supplies the reading margin without making tall roots impossible to trigger.
         threshold: 0,
         rootMargin: `0px 0px -${VIEWPORT_BOTTOM_INSET}px 0px`,
      },
   );
   observer.observe(registration.root);
};

/**
 * Registers a homepage root with the shared one-time observer.
 * Offscreen roots wait in a transparent state; already-visible roots stay static.
 * The hero may animate on load only when its early preparation script has hidden it.
 *
 * `safetyTimeout` is milliseconds. The returned function immediately cancels
 * pending observation or animation, restores static styles, and unregisters the root.
 * Re-registering the same root is a no-op and returns a no-op cleanup function.
 */
export const registerHomeMotion = (root: HTMLElement, options: HomeMotionOptions = {}) => {
   const existing = registrations.get(root);
   if (existing) return () => undefined;

   const registration: RegisteredMotion = {
      root,
      activeClass: options.activeClass ?? DEFAULT_ACTIVE_CLASS,
      completionTarget: options.completionTarget ?? root,
      completionAnimationName: options.completionAnimationName,
      safetyTimeout: options.safetyTimeout ?? HERO_SAFETY_TIMEOUT,
   };
   registrations.set(root, registration);
   observe(registration);

   return () => unregister(registration);
};

const clearPageMotion = () => {
   observer?.disconnect();
   observer = undefined;
   registrations.forEach(showFinal);
   registrations.clear();
};

const registerRoot = (root: HTMLElement, options: HomeMotionOptions) => {
   if (root.dataset.homeMotionPlayed === 'true' || registrations.has(root)) return;
   registerHomeMotion(root, options);
};

const registerCurrentHomeMotion = () => {
   if (!motionAllowed()) return;

   const hero = document.querySelector(HERO_SELECTOR);
   // All lower motion belongs to the homepage only, even though the footer is shared.
   if (!(hero instanceof HTMLElement)) return;

   // The portrait finishes the 750ms reveal. Links can arrive with the
   // composition instead of waiting to act as its final cue.
   const portrait = hero.querySelector<HTMLElement>('.mixed-hero__portrait');
   registerRoot(hero, {
      completionTarget: portrait ?? hero,
      completionAnimationName: portrait ? 'home-portrait-reveal' : undefined,
      safetyTimeout: HERO_SAFETY_TIMEOUT,
   });

   document.querySelectorAll<HTMLElement>('.home-section .print-heading').forEach((heading) => {
      const rule = heading.querySelector<HTMLElement>('.print-heading__rule');
      registerRoot(heading, {
         completionTarget: rule ?? heading,
         completionAnimationName: rule ? 'hero-red-strike' : undefined,
      });
   });

   const video = document.querySelector<HTMLElement>('.home-section--featured .punk-video');
   if (video) {
      const cyan = video.querySelector<HTMLElement>('.punk-video__cyan');
      registerRoot(video, {
         completionTarget: cyan ?? video,
         completionAnimationName: cyan ? 'hero-blue-strike' : undefined,
      });
   }

   document
      .querySelectorAll<HTMLElement>('.home-section--skills .skills-group')
      .forEach((group) => {
         // The third pass finishes last, even when the final tag belongs to an earlier pass.
         const lastTag =
            group.querySelector<HTMLElement>('.punk-tags li:nth-child(3)') ??
            group.querySelector<HTMLElement>('.punk-tags li:last-child');
         registerRoot(group, {
            completionTarget: lastTag ?? group,
            completionAnimationName: lastTag ? 'home-label-print' : undefined,
         });
      });

   const hardware = document.querySelector<HTMLElement>('.home-section--hardware .punk-hardware');
   if (hardware) {
      hardware.querySelectorAll<HTMLElement>(':scope > div').forEach((category) => {
         registerRoot(category, {
            completionTarget: category,
            completionAnimationName: 'home-paper-wipe',
         });
      });
   }

   const footer = document.querySelector<HTMLElement>('.site-footer');
   if (footer) {
      const proof = footer.querySelector<HTMLElement>('.site-footer-proof');
      registerRoot(footer, {
         completionTarget: proof ?? footer,
         completionAnimationName: proof ? 'home-ink-reveal' : undefined,
      });
   }
};

const revealFocusedRoot = (target: Element) => {
   for (const registration of registrations.values()) {
      if (!registration.root.contains(target)) continue;
      registration.root.dataset.homeMotionPlayed = 'true';
      observer?.unobserve(registration.root);
      showFinal(registration);
   }
};

const bindHomeMotion = () => {
   motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
   motionQuery.addEventListener('change', () => {
      if (motionQuery?.matches) clearPageMotion();
   });

   document.addEventListener('focusin', (event) => {
      if (event.target instanceof Element) revealFocusedRoot(event.target);
   });

   document.addEventListener('visibilitychange', () => {
      if (!document.hidden) return;
      for (const registration of registrations.values()) {
         if (registration.root.classList.contains(registration.activeClass))
            showFinal(registration);
      }
   });

   document.addEventListener('astro:before-swap', clearPageMotion);
   // Reused route modules can warm the selected ink while the native snapshot runs.
   document.addEventListener('astro:after-swap', registerCurrentHomeMotion);
   document.addEventListener('astro:page-load', registerCurrentHomeMotion);

   registerCurrentHomeMotion();
};

if (typeof document !== 'undefined' && !document.documentElement.dataset.homeMotionBound) {
   document.documentElement.dataset.homeMotionBound = 'true';
   bindHomeMotion();
}
