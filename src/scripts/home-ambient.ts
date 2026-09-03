/** Passive, additive movement for homepage ink accents and the completed hero title. */
import {
   clearTitleEventReservation,
   requestAmbientEvent,
   reserveTitleEvent,
} from './ambient-rhythm';
import { createStripPolygons } from './strip-shapes';

const ROOTS = [
   {
      selector: '.mixed-hero',
      targets: ['.mixed-hero__red-tangle', '.mixed-hero__blue-tangle'],
      interval: 14_000,
      title: '.mixed-hero__title .punk-title__text',
   },
   {
      selector: '.punk-video',
      targets: ['.punk-video__red', '.punk-video__navy'],
      interval: 19_000,
      strips: true,
   },
   {
      selector: '.skills-group--tools',
      targets: [],
      interval: 19_000,
      strips: true,
      tags: true,
   },
   {
      selector: '.skills-group--topics',
      targets: [],
      interval: 19_000,
      tags: true,
   },
] as const;

const MOBILE_QUERY = '(max-width: 47.99rem)';
const STRIP_LAYER_CLASS = 'home-ambient-strips';
const STRIP_LAYER_ACTIVE_CLASS = 'home-ambient-strips-active';
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

interface AmbientRoot {
   root: HTMLElement;
   targets: HTMLElement[];
   title?: HTMLElement;
   interval: number;
   visible: boolean;
   titleVisible: boolean;
   observer: MutationObserver;
   decorTimer?: number;
   decorStopTimer?: number;
   decorAnimation?: Animation;
   titleTimer?: number;
   titleOrigins?: Map<HTMLElement, { translate: string; rotate: string }>;
   glitchTimer?: number;
   glitchRestoreTimer?: number;
   glitch?: { glyph: HTMLElement; overlay: HTMLSpanElement };
   strips: boolean;
   stripTimer?: number;
   stripLayer?: SVGSVGElement;
   tags: HTMLElement[];
   tagTimer?: number;
   tagOrigins?: Map<HTMLElement, { rotate: string; clipPath: string }>;
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
   !registration.root.classList.contains('home-title-resolving');

const clearDecor = (registration: AmbientRoot) => {
   window.clearTimeout(registration.decorTimer);
   window.clearTimeout(registration.decorStopTimer);
   registration.decorTimer = undefined;
   registration.decorStopTimer = undefined;
   registration.decorAnimation?.cancel();
   registration.decorAnimation = undefined;
};

const restoreGlitch = (registration: AmbientRoot) => {
   window.clearTimeout(registration.glitchRestoreTimer);
   registration.glitchRestoreTimer = undefined;
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
      glyph.style.translate = origin.translate;
      glyph.style.rotate = origin.rotate;
      if (!glyph.style.length) glyph.removeAttribute('style');
   });
   registration.titleOrigins = undefined;
   clearTitleEventReservation('title');
   clearTitleEventReservation('glitch');
};

const randomBetween = (minimum: number, maximum: number) =>
   minimum + Math.floor(Math.random() * (maximum - minimum + 1));

const scheduleDecor = (registration: AmbientRoot) => {
   if (
      !registration.targets.length ||
      !rootAllowed(registration) ||
      registration.decorTimer !== undefined ||
      registration.decorAnimation
   )
      return;
   const attempt = () => {
      registration.decorTimer = undefined;
      if (!rootAllowed(registration)) return;
      const retryAfter = requestAmbientEvent('ambient');
      if (retryAfter) {
         registration.decorTimer = window.setTimeout(attempt, retryAfter);
         return;
      }
      const compact = window.matchMedia(MOBILE_QUERY).matches;
      const candidates = compact ? registration.targets.slice(0, 1) : registration.targets;
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      const distance = compact ? 1 : 2;
      const x = Math.random() < 0.5 ? -distance : distance;
      const y = Math.random() < 0.5 ? -distance : distance;
      registration.decorAnimation = target.animate(
         [
            { transform: 'translate(0, 0)', composite: 'add' },
            { transform: `translate(${x}px, ${y}px)`, composite: 'add', offset: 0.42 },
            { transform: 'translate(0, 0)', composite: 'add' },
         ],
         { duration: 900, easing: 'steps(2, end)', fill: 'none' },
      );
      registration.decorStopTimer = window.setTimeout(() => {
         registration.decorAnimation?.cancel();
         registration.decorAnimation = undefined;
         registration.decorStopTimer = undefined;
         scheduleDecor(registration);
      }, 900);
   };
   registration.decorTimer = window.setTimeout(attempt, registration.interval);
};

const scheduleTitle = (registration: AmbientRoot) => {
   if (!titleAllowed(registration) || registration.titleTimer !== undefined) return;
   const compact = window.matchMedia(MOBILE_QUERY).matches;
   const delay = randomBetween(compact ? 1_400 : 900, compact ? 2_400 : 1_800);
   const attempt = () => {
      registration.titleTimer = undefined;
      if (!registration.title || !titleAllowed(registration)) return;
      const retryAfter = requestAmbientEvent('title');
      if (retryAfter) {
         reserveTitleEvent('title', performance.now() + retryAfter);
         registration.titleTimer = window.setTimeout(attempt, retryAfter);
         return;
      }
      clearTitleEventReservation('title');
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
         const x = randomBetween(-distance, distance);
         const y = Math.random() < 0.5 ? -distance : distance;
         const angle = (Math.random() < 0.5 ? -rotation : rotation) * (0.5 + Math.random() * 0.5);
         if (!registration.titleOrigins.has(glyph)) {
            registration.titleOrigins.set(glyph, {
               translate: glyph.style.translate,
               rotate: glyph.style.rotate,
            });
         }
         // Both properties change in one paint, with no transition or reset-to-origin frame.
         // Independent transforms preserve the glyph's authored transform and cannot accumulate.
         glyph.style.translate = `${x}px ${y}px`;
         glyph.style.rotate = `${angle}deg`;
      }
      scheduleTitle(registration);
   };
   reserveTitleEvent('title', performance.now() + delay);
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
      const retryAfter = requestAmbientEvent('title');
      if (retryAfter) {
         reserveTitleEvent('glitch', performance.now() + retryAfter);
         registration.glitchTimer = window.setTimeout(attempt, retryAfter);
         return;
      }
      clearTitleEventReservation('glitch');
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
      overlay.textContent = characters[randomBetween(0, characters.length - 1)];
      // Reuse the entrance's fixed-slot treatment without changing authored text or the held pose.
      glyph.append(overlay);
      glyph.classList.add('home-title-resolve__pending');
      registration.glitch = { glyph, overlay };
      registration.glitchRestoreTimer = window.setTimeout(
         () => {
            restoreGlitch(registration);
            scheduleGlitch(registration);
         },
         randomBetween(120, compact ? 170 : 200),
      );
   };
   reserveTitleEvent('glitch', performance.now() + delay);
   registration.glitchTimer = window.setTimeout(attempt, delay);
};

const clearStrips = (registration: AmbientRoot) => {
   window.clearTimeout(registration.stripTimer);
   registration.stripTimer = undefined;
   if (registration.root.classList.contains(STRIP_LAYER_ACTIVE_CLASS)) {
      registration.root.classList.remove(STRIP_LAYER_ACTIVE_CLASS);
   }
   registration.stripLayer?.remove();
   registration.stripLayer = undefined;
};

const createStripLayer = () => {
   const layer = document.createElementNS(SVG_NAMESPACE, 'svg');
   layer.classList.add(STRIP_LAYER_CLASS);
   layer.setAttribute('viewBox', '0 0 640 120');
   layer.setAttribute('preserveAspectRatio', 'xMidYMid meet');
   layer.setAttribute('aria-hidden', 'true');
   layer.setAttribute('focusable', 'false');
   return layer;
};

const renderStrips = (registration: AmbientRoot) => {
   const layer = registration.stripLayer ?? createStripLayer();
   const polygons = createStripPolygons().map((points) => {
      const polygon = document.createElementNS(SVG_NAMESPACE, 'polygon');
      polygon.setAttribute('points', points);
      return polygon;
   });

   // replaceChildren completes before the browser can paint, so the layer never
   // exposes the transparent frame caused by a freshly rasterized CSS mask.
   layer.replaceChildren(...polygons);
   if (!registration.stripLayer) {
      registration.stripLayer = layer;
      registration.root.append(layer);
      registration.root.classList.add(STRIP_LAYER_ACTIVE_CLASS);
   }
};

const scheduleStrips = (registration: AmbientRoot) => {
   if (!registration.strips || !rootAllowed(registration) || registration.stripTimer !== undefined)
      return;
   const compact = window.matchMedia(MOBILE_QUERY).matches;
   const delay = randomBetween(compact ? 1_600 : 1_100, compact ? 3_000 : 2_200);
   const attempt = () => {
      registration.stripTimer = undefined;
      if (!rootAllowed(registration)) return;
      const retryAfter = requestAmbientEvent('ambient');
      if (retryAfter) {
         registration.stripTimer = window.setTimeout(attempt, retryAfter);
         return;
      }
      renderStrips(registration);
      scheduleStrips(registration);
   };
   registration.stripTimer = window.setTimeout(attempt, delay);
};

const clearTags = (registration: AmbientRoot) => {
   window.clearTimeout(registration.tagTimer);
   registration.tagTimer = undefined;
   registration.tagOrigins?.forEach((origin, tag) => {
      tag.style.rotate = origin.rotate;
      tag.style.clipPath = origin.clipPath;
      if (!tag.style.length) tag.removeAttribute('style');
   });
   registration.tagOrigins = undefined;
};

const scheduleTags = (registration: AmbientRoot) => {
   if (
      !registration.tags.length ||
      !rootAllowed(registration) ||
      registration.tagTimer !== undefined
   )
      return;
   const compact = window.matchMedia(MOBILE_QUERY).matches;
   const delay = randomBetween(compact ? 1_400 : 850, compact ? 2_400 : 1_700);
   const attempt = () => {
      registration.tagTimer = undefined;
      if (!rootAllowed(registration)) return;
      const retryAfter = requestAmbientEvent('ambient');
      if (retryAfter) {
         registration.tagTimer = window.setTimeout(attempt, retryAfter);
         return;
      }
      const candidates = registration.tags.filter((tag) => {
         const rect = tag.getBoundingClientRect();
         return (
            rect.bottom > 0 &&
            rect.top < window.innerHeight &&
            !tag.matches(':hover, :focus-within')
         );
      });
      const count = Math.min(candidates.length, randomBetween(compact ? 1 : 2, compact ? 2 : 4));
      registration.tagOrigins ??= new Map();
      for (let index = 0; index < count; index++) {
         const [tag] = candidates.splice(randomBetween(0, candidates.length - 1), 1);
         if (!registration.tagOrigins.has(tag)) {
            registration.tagOrigins.set(tag, {
               rotate: tag.style.rotate,
               clipPath: tag.style.clipPath,
            });
         }
         // Shallow edge changes stay inside the existing padding, away from the label.
         tag.style.clipPath = `polygon(${randomBetween(0, 3)}% ${randomBetween(1, 7)}%, ${randomBetween(94, 99)}% 0, 100% ${randomBetween(78, 94)}%, ${randomBetween(93, 98)}% 100%, ${randomBetween(0, 3)}% ${randomBetween(92, 99)}%)`;
         tag.style.rotate = `${randomBetween(-12, 12) / (compact ? 16 : 10)}deg`;
      }
      scheduleTags(registration);
   };
   registration.tagTimer = window.setTimeout(attempt, delay);
};

const reconcile = (registration: AmbientRoot) => {
   if (rootAllowed(registration)) {
      scheduleDecor(registration);
      scheduleStrips(registration);
      scheduleTags(registration);
   } else {
      clearDecor(registration);
      clearStrips(registration);
      clearTags(registration);
   }

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
      clearDecor(registration);
      clearTitle(registration);
      clearStrips(registration);
      clearTags(registration);
   });
   registrations.clear();
};

const registerCurrentPage = () => {
   const hero = document.querySelector('.mixed-hero');
   if (hero instanceof HTMLElement && registrations.has(hero)) {
      return;
   }
   dispose();
   if (!supported() || !document.querySelector('.mixed-hero')) {
      return;
   }
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

   ROOTS.forEach((definition) => {
      const { selector, targets: targetSelectors, interval } = definition;
      const titleSelector = 'title' in definition ? definition.title : undefined;
      const root = document.querySelector(selector);
      if (!(root instanceof HTMLElement)) return;
      const targets = targetSelectors
         .map((targetSelector) => root.querySelector<HTMLElement>(targetSelector))
         .filter((target): target is HTMLElement => target instanceof HTMLElement);
      const strips = 'strips' in definition && definition.strips;
      const tags =
         'tags' in definition && definition.tags
            ? Array.from(root.querySelectorAll<HTMLElement>('.punk-tags li'))
            : [];
      if (!targets.length && !strips && !tags.length) return;
      const title = titleSelector
         ? (root.querySelector<HTMLElement>(titleSelector) ?? undefined)
         : undefined;
      const registration: AmbientRoot = {
         root,
         targets,
         title,
         interval,
         strips,
         tags,
         visible: false,
         titleVisible: !title,
         observer: new MutationObserver(() => reconcile(registration)),
      };
      registrations.set(root, registration);
      registration.observer.observe(root, {
         attributes: true,
         attributeFilter: ['class', 'data-home-motion-boot'],
      });
      observer.observe(root);
      if (title) observer.observe(title);
   });
};

const bind = () => {
   motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
   motionQuery.addEventListener('change', () => {
      registrations.forEach(reconcile);
   });
   window.matchMedia(MOBILE_QUERY).addEventListener('change', () => {
      registrations.forEach((registration) => {
         clearDecor(registration);
         clearTitle(registration);
         clearStrips(registration);
         clearTags(registration);
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
