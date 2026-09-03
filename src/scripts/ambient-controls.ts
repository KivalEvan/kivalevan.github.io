/**
 * Holds subtle, independent poses on idle navigation and social controls without
 * replacing their authored transform (including hover scales).
 */
import { requestAmbientEvent } from './ambient-rhythm';

export {};

const TARGET_SELECTOR = [
   '.punk-nav__link',
   '.punk-head__home-link',
   '.mixed-hero__socials a',
   '.mixed-hero__socials button',
   '.site-footer-links a',
   '.site-footer-links button',
   '.site-footer-support a',
   '.print-page .print-action',
].join(', ');
const MOBILE_QUERY = '(max-width: 47.99rem)';
const BLOCKED_MOTION_SELECTOR =
   '.home-motion--pending, .home-motion--playing, .home-motion--holding, [data-home-motion-boot="pending"]';

interface PropertyOrigin {
   value: string;
   priority: string;
}

interface Control {
   visible: boolean;
   origin?: {
      translate: PropertyOrigin;
      rotate: PropertyOrigin;
      cut: PropertyOrigin;
   };
}

const controls = new Map<HTMLElement, Control>();
let visibilityObserver: IntersectionObserver | undefined;
let mutationObserver: MutationObserver | undefined;
let motionQuery: MediaQueryList | undefined;
let mobileQuery: MediaQueryList | undefined;
let timer: number | undefined;

const randomBetween = (minimum: number, maximum: number) =>
   minimum + Math.floor(Math.random() * (maximum - minimum + 1));

const clearTimer = () => {
   window.clearTimeout(timer);
   timer = undefined;
};

const restoreProperty = (target: HTMLElement, property: string, origin: PropertyOrigin) => {
   if (origin.value) target.style.setProperty(property, origin.value, origin.priority);
   else target.style.removeProperty(property);
};

const restore = (target: HTMLElement, control: Control) => {
   if (!control.origin) return;
   restoreProperty(target, 'translate', control.origin.translate);
   restoreProperty(target, 'rotate', control.origin.rotate);
   restoreProperty(target, '--print-ambient-cut', control.origin.cut);
   if (!target.style.length) target.removeAttribute('style');
   control.origin = undefined;
};

const motionBlocked = (target: HTMLElement) => !!target.closest(BLOCKED_MOTION_SELECTOR);

const canHoldPose = (target: HTMLElement, control: Control) =>
   target.isConnected &&
   control.visible &&
   !target.matches(':disabled, [hidden]') &&
   !motionBlocked(target) &&
   !motionQuery?.matches &&
   !document.hidden;

const interacting = (target: HTMLElement) => target.matches(':hover, :focus, :focus-within');

const eligibleControls = () =>
   Array.from(controls).filter(
      ([target, control]) => canHoldPose(target, control) && !interacting(target),
   );

const applyPose = (target: HTMLElement, control: Control) => {
   if (!control.origin) {
      control.origin = {
         translate: {
            value: target.style.getPropertyValue('translate'),
            priority: target.style.getPropertyPriority('translate'),
         },
         rotate: {
            value: target.style.getPropertyValue('rotate'),
            priority: target.style.getPropertyPriority('rotate'),
         },
         cut: {
            value: target.style.getPropertyValue('--print-ambient-cut'),
            priority: target.style.getPropertyPriority('--print-ambient-cut'),
         },
      };
   }

   const compact = mobileQuery?.matches;
   const rotation = randomBetween(compact ? -4 : -7, compact ? 4 : 7) / 10;
   const x = randomBetween(-10, 10) / 10;
   const y = randomBetween(-10, 10) / 10;
   // Individual transform properties compose with the authored transform and hover scale.
   target.style.setProperty('translate', `${x}px ${y}px`);
   target.style.setProperty('rotate', `${rotation}deg`);
   if (target.matches('.print-page .print-action')) {
      // Idle edge cuts stay outside the label; the active interaction owns its own override.
      target.style.setProperty(
         '--print-ambient-cut',
         `polygon(${randomBetween(0, 3)}% ${randomBetween(1, 6)}%, 32% ${randomBetween(0, 4)}%, 67% ${randomBetween(1, 5)}%, ${randomBetween(97, 100)}% 0, 100% ${randomBetween(93, 98)}%, 67% ${randomBetween(95, 100)}%, 31% ${randomBetween(94, 99)}%, 0 ${randomBetween(94, 99)}%)`,
      );
   }
};

const schedule = () => {
   if (timer !== undefined || !eligibleControls().length) return;
   const compact = mobileQuery?.matches;
   const delay = randomBetween(compact ? 1_800 : 1_400, compact ? 3_000 : 2_400);
   const attempt = () => {
      timer = undefined;
      const candidates = eligibleControls();
      if (!candidates.length) return;
      const retryAfter = requestAmbientEvent('control');
      if (retryAfter) {
         timer = window.setTimeout(attempt, retryAfter);
         return;
      }
      const count = Math.min(candidates.length, randomBetween(1, 2));
      for (let index = 0; index < count; index++) {
         const selected = candidates.splice(randomBetween(0, candidates.length - 1), 1)[0];
         applyPose(selected[0], selected[1]);
      }
      schedule();
   };
   timer = window.setTimeout(attempt, delay);
};

const reconcile = () => {
   controls.forEach((control, target) => {
      // Interaction deliberately retains the current pose to keep the hit target stable.
      if (!canHoldPose(target, control)) restore(target, control);
   });
   if (eligibleControls().length) schedule();
   else clearTimer();
};

const dispose = () => {
   clearTimer();
   visibilityObserver?.disconnect();
   visibilityObserver = undefined;
   mutationObserver?.disconnect();
   mutationObserver = undefined;
   controls.forEach((control, target) => restore(target, control));
   controls.clear();
};

const registerCurrentPage = () => {
   dispose();
   if (typeof IntersectionObserver === 'undefined') return;

   visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
         const control = controls.get(entry.target as HTMLElement);
         if (control) control.visible = entry.isIntersecting;
      });
      reconcile();
   });

   document.querySelectorAll<HTMLElement>(TARGET_SELECTOR).forEach((target) => {
      controls.set(target, { visible: false });
      visibilityObserver?.observe(target);
   });

   if (!controls.size) return;
   mutationObserver = new MutationObserver(reconcile);
   mutationObserver.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'hidden', 'disabled', 'data-home-motion-boot'],
   });
};

const bind = () => {
   motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
   mobileQuery = window.matchMedia(MOBILE_QUERY);
   motionQuery.addEventListener('change', reconcile);
   mobileQuery.addEventListener('change', () => {
      clearTimer();
      schedule();
   });
   document.addEventListener('visibilitychange', reconcile);
   document.addEventListener('pointerover', reconcile, { passive: true });
   document.addEventListener('pointerout', reconcile, { passive: true });
   document.addEventListener('focusin', reconcile);
   document.addEventListener('focusout', reconcile);
   document.addEventListener('astro:before-swap', dispose);
   document.addEventListener('astro:page-load', registerCurrentPage);
   registerCurrentPage();
};

if (typeof document !== 'undefined' && !document.documentElement.dataset.ambientControlsBound) {
   document.documentElement.dataset.ambientControlsBound = 'true';
   bind();
}
