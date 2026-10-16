/** Passive motion belongs to the completed hero title; lower-page artwork stays still. */
import { requestAmbientEvent } from './ambient-rhythm';
import { playPoseSequence } from './pose-sequence';

const MOBILE_QUERY = '(max-width: 47.99rem)';

interface AmbientRoot {
   root: HTMLElement;
   title?: HTMLElement;
   visible: boolean;
   titleVisible: boolean;
   observer: MutationObserver;
   titleTimer?: number;
   titleOrigins?: Map<HTMLElement, string>;
   glitchTimer?: number;
   cancelGlitchSequence?: () => void;
   glitch?: { glyph: HTMLElement; overlay: HTMLSpanElement };
}

let registrations = new Map<HTMLElement, AmbientRoot>();
let visibilityObserver: IntersectionObserver | undefined;
let motionQuery: MediaQueryList | undefined;

const supported = () =>
   typeof IntersectionObserver !== 'undefined' && typeof Element.prototype.animate === 'function';

const rootBlocked = (root: HTMLElement) =>
   root.matches('.home-motion--pending, .home-motion--playing') ||
   root.dataset.homeMotionBoot === 'pending';

const rootAllowed = (registration: AmbientRoot) =>
   !motionQuery?.matches &&
   !document.hidden &&
   registration.visible &&
   !rootBlocked(registration.root);

const titleAllowed = (registration: AmbientRoot) =>
   !!registration.title &&
   rootAllowed(registration) &&
   registration.titleVisible &&
   !registration.root.classList.contains('home-title-assembling');

const restoreGlitch = (registration: AmbientRoot) => {
   registration.cancelGlitchSequence?.();
   registration.cancelGlitchSequence = undefined;
   registration.glitch?.glyph.classList.remove('home-title-resolve__pending');
   registration.glitch?.overlay.remove();
   registration.glitch = undefined;
};

const clearTitle = (registration: AmbientRoot) => {
   window.clearTimeout(registration.titleTimer);
   window.clearTimeout(registration.glitchTimer);
   registration.glitchTimer = undefined;
   restoreGlitch(registration);
   registration.titleTimer = undefined;
   registration.titleOrigins?.forEach((origin, glyph) => {
      if (origin) glyph.style.setProperty('--title-idle-transform', origin);
      else glyph.style.removeProperty('--title-idle-transform');
      if (!glyph.style.length) glyph.removeAttribute('style');
   });
   registration.titleOrigins = undefined;
};

const randomBetween = (minimum: number, maximum: number) =>
   minimum + Math.floor(Math.random() * (maximum - minimum + 1));

const scheduleTitle = (registration: AmbientRoot) => {
   if (!titleAllowed(registration) || registration.titleTimer !== undefined) return;
   const compact = window.matchMedia(MOBILE_QUERY).matches;
   const delay = 1_000;
   const attempt = () => {
      registration.titleTimer = undefined;
      if (!registration.title || !titleAllowed(registration)) return;
      const distance = compact ? 2 : 4;
      const rotation = compact ? 1 : 2;
      const candidates = Array.from(
         registration.title.querySelectorAll<HTMLElement>(
            '.poster-glyph:not(.home-title-resolve__pending)',
         ),
      );
      const count = Math.min(candidates.length, randomBetween(compact ? 1 : 2, compact ? 2 : 4));
      registration.titleOrigins ??= new Map();
      for (let index = 0; index < count; index++) {
         const [glyph] = candidates.splice(randomBetween(0, candidates.length - 1), 1);
         if (!registration.titleOrigins.has(glyph)) {
            registration.titleOrigins.set(
               glyph,
               glyph.style.getPropertyValue('--title-idle-transform'),
            );
         }
         const x = randomBetween(-distance, distance);
         const y = Math.random() < 0.5 ? -distance : distance;
         const angle = (Math.random() < 0.5 ? -rotation : rotation) * (0.5 + Math.random() * 0.5);
         // Keep the masked glyph's pose in one transform; separate properties can
         // produce intermediate repaints in Firefox even without a second tick.
         glyph.style.setProperty(
            '--title-idle-transform',
            `translate(${x}px, ${y}px) rotate(${angle}deg)`,
         );
      }
      scheduleTitle(registration);
   };
   registration.titleTimer = window.setTimeout(attempt, delay);
};

const scheduleGlitch = (registration: AmbientRoot) => {
   if (!titleAllowed(registration) || registration.glitchTimer !== undefined || registration.glitch)
      return;
   const compact = window.matchMedia(MOBILE_QUERY).matches;
   const delay = randomBetween(compact ? 14_000 : 9_000, compact ? 24_000 : 17_000);
   const attempt = () => {
      registration.glitchTimer = undefined;
      if (!registration.title || !titleAllowed(registration)) return;
      const retryAfter = requestAmbientEvent();
      if (retryAfter) {
         registration.glitchTimer = window.setTimeout(attempt, retryAfter);
         return;
      }
      const glyphs = Array.from(registration.title.querySelectorAll<HTMLElement>('.poster-glyph'));
      if (!glyphs.length) return;
      const glyph = glyphs[randomBetween(0, glyphs.length - 1)];
      const overlay = document.createElement('span');
      overlay.className = 'home-title-resolve__glyph';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('data-home-ambient-glitch', '');
      overlay.dataset.tone = glyph.dataset.letter === 'V' ? 'crimson' : 'paper';
      const alphabet = glyph.dataset.letter === 'I' ? '1!' : 'HNXKEAMRW237';
      const characters = Array.from(alphabet).filter(
         (character) => character !== glyph.dataset.letter,
      );
      const firstCharacter = randomBetween(0, characters.length - 1);
      // Keep the replacement in its fixed slot without changing authored text or the held pose.
      glyph.append(overlay);
      glyph.classList.add('home-title-resolve__pending');
      registration.glitch = { glyph, overlay };
      registration.cancelGlitchSequence = playPoseSequence({
         fps: 12,
         frames: 2,
         onFrame: (frame) => {
            if (!titleAllowed(registration)) {
               restoreGlitch(registration);
               return;
            }
            overlay.textContent = characters[(firstCharacter + frame) % characters.length];
         },
         onFinish: () => {
            restoreGlitch(registration);
            scheduleGlitch(registration);
         },
      });
   };
   registration.glitchTimer = window.setTimeout(attempt, delay);
};

const reconcile = (registration: AmbientRoot) => {
   if (titleAllowed(registration)) {
      scheduleTitle(registration);
      scheduleGlitch(registration);
   } else clearTitle(registration);
};

const dispose = () => {
   visibilityObserver?.disconnect();
   visibilityObserver = undefined;
   registrations.forEach((registration) => {
      registration.observer.disconnect();
      clearTitle(registration);
   });
   registrations.clear();
};

const registerCurrentPage = () => {
   const hero = document.querySelector('.mixed-hero');
   if (hero instanceof HTMLElement && registrations.has(hero)) {
      return;
   }
   dispose();
   if (!supported() || !(hero instanceof HTMLElement)) {
      return;
   }
   const title = hero.querySelector<HTMLElement>('.mixed-hero__title .punk-title__text');
   if (!title) return;
   const observer = new IntersectionObserver(
      (entries) => {
         entries.forEach((entry) => {
            for (const registration of registrations.values()) {
               if (entry.target === registration.root) registration.visible = entry.isIntersecting;
               if (entry.target === registration.title)
                  registration.titleVisible = entry.isIntersecting;
               if (entry.target === registration.root || entry.target === registration.title)
                  reconcile(registration);
            }
         });
      },
      { threshold: 0 },
   );
   visibilityObserver = observer;

   const registration: AmbientRoot = {
      root: hero,
      title,
      visible: false,
      titleVisible: false,
      observer: new MutationObserver(() => reconcile(registration)),
   };
   registrations.set(hero, registration);
   registration.observer.observe(hero, {
      attributes: true,
      attributeFilter: ['class', 'data-home-motion-boot'],
   });
   observer.observe(hero);
   observer.observe(title);
};

const bind = () => {
   motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
   motionQuery.addEventListener('change', () => {
      registrations.forEach(reconcile);
   });
   window.matchMedia(MOBILE_QUERY).addEventListener('change', () => {
      registrations.forEach((registration) => {
         clearTitle(registration);
         reconcile(registration);
      });
   });
   document.addEventListener('visibilitychange', () => registrations.forEach(reconcile));
   document.addEventListener('astro:before-swap', dispose);
   document.addEventListener('astro:page-load', registerCurrentPage);
   registerCurrentPage();
};

if (typeof document !== 'undefined' && !document.documentElement.dataset.homeAmbientBound) {
   document.documentElement.dataset.homeAmbientBound = 'true';
   bind();
}
