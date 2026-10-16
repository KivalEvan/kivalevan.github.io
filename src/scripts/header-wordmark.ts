import type {
   TransitionBeforePreparationEvent,
   TransitionBeforeSwapEvent,
} from 'astro:transitions/client';
import { playPoseSequence } from './pose-sequence';

const LETTER_FPS = 12;
const EXIT_FRAMES = 4;
const EXIT_FADE_DURATION = (EXIT_FRAMES * 1_000) / LETTER_FPS;
const REVEAL_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const entered = new WeakSet<HTMLElement>();
const navigations = new WeakMap<AbortSignal, number>();
let generation = 0;
let navigating = false;
let leavingForHome = false;
let departingBody: HTMLElement | undefined;
let body: HTMLElement | undefined;
let link: HTMLElement | null = null;
let wordmark: HTMLElement | null = null;
let animation: Animation | undefined;
let cancelScramble: (() => void) | undefined;
let observer: IntersectionObserver | undefined;
let frame: number | undefined;
let pendingEntrance = false;
let preparation: { target: HTMLElement; body: HTMLElement; timer: number } | undefined;

const clearPreparation = () => {
   if (!preparation) return;
   window.clearTimeout(preparation.timer);
   entered.add(preparation.body);
   preparation.target.style.removeProperty('opacity');
   if (!preparation.target.style.length) preparation.target.removeAttribute('style');
   preparation = undefined;
};

const cancelMotion = () => {
   if (frame !== undefined) cancelAnimationFrame(frame);
   frame = undefined;
   pendingEntrance = false;
   cancelScramble?.();
   cancelScramble = undefined;
   animation?.cancel();
   animation = undefined;
};

const settle = () => {
   cancelMotion();
   clearPreparation();
};

const dispose = () => {
   settle();
   observer?.disconnect();
   body = undefined;
   link = null;
   wordmark = null;
};

const available = (leaving = false) => {
   if (
      !link?.isConnected ||
      !wordmark ||
      body !== document.body ||
      (navigating && !leaving) ||
      document.documentElement.hasAttribute('data-astro-transition') ||
      (document.documentElement.hasAttribute('data-print-motion-wait') && !leaving) ||
      reducedMotion.matches ||
      document.hidden
   )
      return false;
   const bounds = link.getBoundingClientRect();
   return (
      bounds.width > 0 &&
      bounds.height > 0 &&
      bounds.bottom > 0 &&
      bounds.top < window.innerHeight &&
      bounds.right > 0 &&
      bounds.left < window.innerWidth
   );
};

const play = (leaving = false, erase?: Animation) => {
   if (!available(leaving) || !wordmark || animation || cancelScramble) return;
   if (pendingEntrance) settle();
   const slots = Array.from(wordmark.querySelectorAll<HTMLElement>('.punk-head__glyph')).map(
      (glyph) => {
         const overlay = document.createElement('span');
         overlay.className = 'punk-head__reveal-letter';
         overlay.setAttribute('aria-hidden', 'true');
         if (!leaving) glyph.classList.add('punk-head__glyph--revealing');
         glyph.append(overlay);
         const characters = Array.from(
            glyph.dataset.letter === 'I' ? '1!|' : REVEAL_CHARACTERS,
         ).filter((character) => character !== glyph.dataset.letter);
         return { glyph, overlay, characters, settled: false };
      },
   );
   for (let index = slots.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [slots[index], slots[randomIndex]] = [slots[randomIndex], slots[index]];
   }
   const restore = () => {
      slots.forEach(({ glyph, overlay }) => {
         glyph.classList.remove('punk-head__glyph--revealing');
         overlay.remove();
      });
   };
   if (!leaving) {
      const cancelSequence = playPoseSequence({
         fps: LETTER_FPS,
         frames: slots.length + 1,
         onFrame: (frame) => {
            slots.forEach((slot, index) => {
               if (slot.settled) return;
               if (frame > index) {
                  slot.settled = true;
                  slot.glyph.classList.remove('punk-head__glyph--revealing');
                  slot.overlay.remove();
                  return;
               }
               slot.overlay.textContent =
                  slot.characters[Math.floor(Math.random() * slot.characters.length)];
            });
         },
         onFinish: () => {
            restore();
            cancelScramble = undefined;
         },
      });
      cancelScramble = () => {
         cancelSequence();
         restore();
      };
      // Temporary faces are ready before the snapshot hold is removed.
      clearPreparation();
      return;
   }
   const token = generation;
   const fade = wordmark.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: EXIT_FADE_DURATION,
      easing: 'ease-out',
      fill: 'both',
   });
   fade.id = 'header-wordmark-out';
   if (typeof erase?.startTime === 'number') {
      // Sharing the start time avoids a new animation's pending-play delay.
      fade.startTime = erase.startTime;
   } else {
      const elapsed = typeof erase?.currentTime === 'number' ? erase.currentTime : 0;
      fade.currentTime = Math.min(elapsed, EXIT_FADE_DURATION);
   }
   animation = fade;
   cancelScramble = restore;
   let previousPose = -1;
   const paintExit = () => {
      // Follow the fade's native clock so a late start event skips overdue faces.
      const pose = Math.floor((Number(fade.currentTime ?? 0) * LETTER_FPS) / 1_000);
      if (pose >= EXIT_FRAMES) {
         frame = undefined;
         restore();
         cancelScramble = undefined;
         return;
      }
      if (pose !== previousPose) {
         previousPose = pose;
         const scrambledCount = Math.ceil((slots.length * (pose + 1)) / (EXIT_FRAMES - 1));
         slots.forEach((slot, index) => {
            if (index >= scrambledCount) return;
            slot.glyph.classList.add('punk-head__glyph--revealing');
            slot.overlay.textContent =
               slot.characters[Math.floor(Math.random() * slot.characters.length)];
         });
      }
      frame = requestAnimationFrame(paintExit);
   };
   paintExit();
   void fade.finished.catch(() => {
      if (token === generation && animation === fade) settle();
   });
};

const register = () => {
   if (body === document.body) return;
   // Register the new document without exposing its prepared wordmark.
   cancelMotion();
   observer?.disconnect();
   body = document.body;
   wordmark = null;
   // The equally sized, invisible homepage slot is deliberately never registered.
   link = body.querySelector<HTMLElement>('.punk-head__home-link');
   if (!link) return;
   wordmark = link.querySelector<HTMLElement>('.punk-head__wordmark');
   if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
         if (entries.some((entry) => !entry.isIntersecting)) settle();
      });
      observer.observe(link);
   }
};

const enter = () => {
   register();
   if (!body || entered.has(body) || pendingEntrance || !available()) return;
   entered.add(body);
   pendingEntrance = true;
   const token = generation;
   const targetBody = body;
   const requested = performance.now();
   // No bootstrap hiding. Late fonts/modules leave the already-visible wordmark alone.
   void document.fonts.ready.then(() => {
      if (token !== generation || targetBody !== document.body || !pendingEntrance) return;
      if (performance.now() - requested > 1_000 || !available()) {
         settle();
         return;
      }
      frame = requestAnimationFrame(() => {
         frame = requestAnimationFrame(() => {
            frame = undefined;
            pendingEntrance = false;
            if (token === generation && targetBody === document.body) play();
         });
      });
   });
};

document.addEventListener('astro:before-preparation', (event) => {
   const { signal, to } = event as TransitionBeforePreparationEvent;
   const token = ++generation;
   navigations.set(signal, token);
   navigating = true;
   leavingForHome = (to.pathname.replace(/\/+$/, '') || '/') === '/';
   departingBody = document.body;
   settle();
   signal.addEventListener(
      'abort',
      () => {
         if (token !== generation) return;
         navigating = false;
         leavingForHome = false;
         settle();
         register();
      },
      { once: true },
   );
});
document.addEventListener('animationstart', (event) => {
   if (
      leavingForHome &&
      departingBody === document.body &&
      event.animationName === 'print-page-ink-out' &&
      event.target instanceof HTMLElement &&
      event.target.matches('main[data-print-exit]')
   ) {
      const erase = event.target
         .getAnimations()
         .find(
            (animation) =>
               animation instanceof CSSAnimation &&
               animation.animationName === 'print-page-ink-out',
         );
      // The start event can arrive several held poses into the page's clock.
      // Align the wordmark with that clock instead of adding a delayed exit.
      play(true, erase);
   }
});
document.addEventListener('astro:before-swap', (event) => {
   const wasVisible = !!document.querySelector('.punk-head__home-link');
   dispose();
   const transition = event as TransitionBeforeSwapEvent;
   const token = navigations.get(transition.signal);
   const incoming = transition.newDocument.body;
   const incomingWordmark = incoming.querySelector<HTMLElement>(
      '.punk-head__home-link .punk-head__wordmark',
   );
   // Interior routes keep the wordmark visible, so there is nothing to reveal.
   if (wasVisible || !incomingWordmark || reducedMotion.matches || document.hidden) {
      entered.add(incoming);
   } else {
      // Both the native snapshot and the first live frame must start hidden.
      incomingWordmark.style.opacity = '0';
      preparation = {
         target: incomingWordmark,
         body: incoming,
         timer: window.setTimeout(clearPreparation, 1_000),
      };
   }
   const finished = () => {
      if (token !== generation || incoming !== document.body) return;
      navigating = false;
      leavingForHome = false;
      // Let Astro release its transition marker in the same promise turn first.
      queueMicrotask(() => {
         if (token === generation && incoming === document.body) enter();
      });
   };
   // page-load alone does not own the browser's snapshot lifetime.
   void transition.viewTransition.finished.then(finished, finished);
});
document.addEventListener('astro:page-load', enter);
document.addEventListener('print-page-motion-ready', () => {
   // Failed loaders can restore the old page without a swap or an aborted signal.
   if (navigating && departingBody === document.body) {
      navigating = false;
      leavingForHome = false;
      settle();
      register();
      return;
   }
   if (!navigating) enter();
});
document.addEventListener('visibilitychange', () => {
   if (document.hidden) settle();
});
reducedMotion.addEventListener('change', settle);
window.addEventListener('resize', settle, { passive: true });
window.addEventListener('pagehide', dispose);
window.addEventListener('pageshow', register);
register();
// A first-time module loaded after the swap missed the finished promise. Keep that
// page static rather than replaying inside an in-flight browser snapshot.
if (document.documentElement.hasAttribute('data-astro-transition')) entered.add(document.body);
if (document.readyState !== 'complete') enter();
