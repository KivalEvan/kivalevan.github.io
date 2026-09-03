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
   /** Optional animation name required from `completionTarget`; omit to accept its first end event. */
   completionAnimationName?: string;
   /** Safety cleanup delay in milliseconds; only used if the completion event never fires. */
   safetyTimeout?: number;
}

const HERO_SELECTOR = '.mixed-hero';
const DEFAULT_ACTIVE_CLASS = 'home-motion--playing';
const HERO_SAFETY_TIMEOUT = 5_000;
const VIEWPORT_BOTTOM_INSET = 140;
const HERO_READING_PAUSE = 280;
const TITLE_ENTRANCE_DELAY = 160;
const TITLE_RESOLVE_TIME_SCALE = 1.4;
// Per-slot change times and final print time, in milliseconds after title activation.
// Empty change lists print directly; the others use deliberately uneven bursts.
const TITLE_RESOLVE_PASSES = [
   { changes: [20, 70, 125, 180], settle: 245 },
   { changes: [], settle: 105 },
   { changes: [85, 125, 170, 220, 290], settle: 345 },
   { changes: [40, 85, 135, 190, 250, 310, 380, 455], settle: 520 },
   { changes: [160, 225], settle: 300 },
   { changes: [], settle: 195 },
   { changes: [35, 110, 205], settle: 270 },
   { changes: [55, 95, 140, 190, 240, 320], settle: 390 },
   { changes: [145, 205, 270, 340], settle: 450 },
];
const TITLE_CHARACTERS = ['H', 'N', 'X', 'K', 'E', 'A'];

interface TitleResolveGlyph {
   glyph: HTMLElement;
   overlay: HTMLSpanElement;
}

/**
 * Temporarily covers the authored title glyphs without changing their text or
 * geometry. Removing the controller always restores the exact static wordmark.
 */
class TitleResolve {
   private readonly glyphs: TitleResolveGlyph[];
   private readonly timers = new Set<number>();

   constructor(private readonly hero: HTMLElement) {
      this.glyphs = Array.from(hero.querySelectorAll<HTMLElement>('.poster-glyph')).map((glyph) => {
         const overlay = document.createElement('span');
         overlay.className = 'home-title-resolve__glyph';
         overlay.setAttribute('aria-hidden', 'true');
         overlay.dataset.tone = glyph.dataset.letter === 'V' ? 'crimson' : 'paper';
         glyph.classList.add('home-title-resolve__pending');
         glyph.append(overlay);
         return { glyph, overlay };
      });
      hero.classList.add('home-title-resolving');
   }

   start() {
      const compact = window.matchMedia('(max-width: 47.99rem)').matches;
      this.glyphs.forEach(({ glyph, overlay }, index) => {
         const { changes, settle } = TITLE_RESOLVE_PASSES[index % TITLE_RESOLVE_PASSES.length];
         changes.forEach((time, pass) => {
            if (compact && pass % 2 === 1) return;
            const character = this.placeholder(glyph, index + pass * (compact ? 1 : 2));
            this.later(() => {
               // Worn ink blocks interrupt substitutions, never resolved letters.
               const block = (index === 2 && pass === 2) || (index === 7 && pass === 0);
               overlay.toggleAttribute('data-block', block);
               overlay.textContent = block ? '' : character;
            }, time * TITLE_RESOLVE_TIME_SCALE);
         });
         this.later(() => {
            glyph.classList.remove('home-title-resolve__pending');
            overlay.remove();
         }, settle * TITLE_RESOLVE_TIME_SCALE);
      });
      this.later(
         () => this.showFinal(),
         Math.max(...TITLE_RESOLVE_PASSES.map(({ settle }) => settle)) * TITLE_RESOLVE_TIME_SCALE,
      );
   }

   showFinal() {
      this.timers.forEach((timer) => window.clearTimeout(timer));
      this.timers.clear();
      this.hero.classList.remove('home-title-resolving');
      this.glyphs.forEach(({ glyph, overlay }) => {
         glyph.classList.remove('home-title-resolve__pending');
         overlay.remove();
      });
   }

   private later(callback: () => void, delay: number) {
      let timer = 0;
      timer = window.setTimeout(() => {
         this.timers.delete(timer);
         callback();
      }, delay);
      this.timers.add(timer);
   }

   private placeholder(glyph: HTMLElement, pass: number) {
      // Keep the narrow I slot narrow too; never recenter a wider symbol within it.
      if (glyph.dataset.letter === 'I') return pass % 2 ? 'I' : '1';
      return TITLE_CHARACTERS[pass % TITLE_CHARACTERS.length];
   }
}

interface RegisteredMotion {
   root: HTMLElement;
   activeClass: string;
   completionTarget: HTMLElement;
   completionAnimationName?: string;
   safetyTimeout: number;
   safetyTimer?: number;
   entranceTimer?: number;
   titleStartTimer?: number;
   titleResolve?: TitleResolve;
   onAnimationEnd?: (event: AnimationEvent) => void;
}

const registrations = new Map<HTMLElement, RegisteredMotion>();
let observer: IntersectionObserver | undefined;
let motionQuery: MediaQueryList | undefined;

const motionAllowed = () => !motionQuery?.matches;

const showFinal = (registration: RegisteredMotion) => {
   registration.root.classList.remove('home-motion--pending');
   registration.root.removeAttribute('data-home-motion-boot');
   window.clearTimeout(registration.safetyTimer);
   window.clearTimeout(registration.entranceTimer);
   window.clearTimeout(registration.titleStartTimer);
   registration.titleResolve?.showFinal();
   registration.titleResolve = undefined;
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
         event.animationName !== registration.completionAnimationName
      ) {
         return;
      }
      showFinal(registration);
   };
   registration.completionTarget.addEventListener('animationend', registration.onAnimationEnd);
   registration.root.classList.remove('home-motion--pending');
   registration.root.classList.add(registration.activeClass);
   if (registration.root.matches(HERO_SELECTOR)) {
      registration.titleResolve = new TitleResolve(registration.root);
      // Hold the first print state briefly so the initial assembly is perceptible.
      registration.root.classList.add('home-motion--holding');
      registration.entranceTimer = window.setTimeout(() => {
         registration.root.classList.remove('home-motion--holding');
      }, HERO_READING_PAUSE);
      registration.titleStartTimer = window.setTimeout(
         () => registration.titleResolve?.start(),
         HERO_READING_PAUSE + TITLE_ENTRANCE_DELAY,
      );
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

   const finalStamp = hero.querySelector<HTMLElement>('.mixed-hero__socials li:last-child');
   registerRoot(hero, {
      completionTarget: finalStamp ?? hero,
      completionAnimationName: finalStamp ? 'home-social-print-up-left' : undefined,
      safetyTimeout: HERO_SAFETY_TIMEOUT,
   });

   document.querySelectorAll<HTMLElement>('.home-section .print-heading').forEach((heading) => {
      const title = heading.querySelector<HTMLElement>('.print-heading__title');
      registerRoot(heading, {
         completionTarget: title ?? heading,
         completionAnimationName: title ? 'home-print-reveal' : undefined,
      });
   });

   const video = document.querySelector<HTMLElement>('.home-section--featured .punk-video');
   if (video) {
      const caption = video.querySelector<HTMLElement>('.featured-video__caption');
      registerRoot(video, {
         completionTarget: caption ?? video,
         completionAnimationName: caption ? 'home-stamp-in' : undefined,
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
            completionAnimationName: lastTag ? 'home-stamp-in' : undefined,
         });
      });

   const hardware = document.querySelector<HTMLElement>('.home-section--hardware .punk-hardware');
   if (hardware) {
      registerRoot(hardware, {
         completionTarget: hardware,
         completionAnimationName: 'home-paper-wipe',
      });
      hardware.querySelectorAll<HTMLElement>(':scope > div').forEach((category) => {
         registerRoot(category, {
            completionTarget: category,
            completionAnimationName: 'home-stamp-in',
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

   document.addEventListener('astro:before-swap', clearPageMotion);
   document.addEventListener('astro:page-load', registerCurrentHomeMotion);

   registerCurrentHomeMotion();
};

if (typeof document !== 'undefined' && !document.documentElement.dataset.homeMotionBound) {
   document.documentElement.dataset.homeMotionBound = 'true';
   bindHomeMotion();
}
