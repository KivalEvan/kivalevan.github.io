/**
 * Gives existing paper labels an individual resting cut. Interactive backgrounds
 * keep their separate hover/focus poses without moving the text or hit target.
 */

import type { TransitionBeforeSwapEvent } from 'astro:transitions/client';

const TARGET_SELECTOR = [
   '.punk-nav__link',
   '.mixed-hero__socials :is(a, button)',
   '.site-footer-links :is(a, button)',
   '.site-footer-support a',
   '.print-page .print-action',
].join(', ');
const CUT_PROPERTY = '--print-interaction-cut';
const PAPER_CUT_PROPERTY = '--print-paper-cut';
const PAPER_SELECTOR = [
   TARGET_SELECTOR,
   '.punk-hardware h3',
   '.punk-tags li',
   '.featured-video__caption',
   '.print-page .commission-rate-panel h3',
].join(', ');

interface PropertyOrigin {
   value: string;
   priority: string;
}

interface Interaction {
   hovered: boolean;
   focusVisible: boolean;
   timer?: number;
   origin?: PropertyOrigin;
}

const interactions = new Map<HTMLElement, Interaction>();
let motionQuery: MediaQueryList | undefined;

const randomBetween = (minimum: number, maximum: number) =>
   minimum + Math.floor(Math.random() * (maximum - minimum + 1));

const edgeCoordinate = (value: number, depth: number) => {
   if (value === 0 || value === 100 || (value > 10 && value < 90)) return `${value}%`;
   const inset = value < 50 ? value : 100 - value;
   const cut = `min(${inset}%, ${(inset * depth).toFixed(2)}rem)`;
   return value < 50 ? cut : `calc(100% - ${cut})`;
};

const point = (x: number, y: number) => `${edgeCoordinate(x, 0.05)} ${edgeCoordinate(y, 0.03)}`;

// Bound edge damage by both percentage and type size, so long or wrapped labels
// keep their paper under the text without measuring or changing their layout.
const createTornCut = () => {
   const top = [
      point(0, randomBetween(1, 8)),
      point(randomBetween(12, 25), randomBetween(0, 6)),
      point(randomBetween(35, 48), randomBetween(2, 9)),
      point(randomBetween(56, 70), randomBetween(0, 7)),
      point(randomBetween(78, 91), randomBetween(1, 8)),
      point(100, randomBetween(0, 7)),
   ];
   const right = [
      point(randomBetween(94, 100), randomBetween(12, 25)),
      point(randomBetween(92, 100), randomBetween(34, 47)),
      point(randomBetween(94, 100), randomBetween(55, 68)),
      point(randomBetween(92, 100), randomBetween(76, 89)),
   ];
   const bottom = [
      point(100, randomBetween(93, 100)),
      point(randomBetween(76, 90), randomBetween(92, 100)),
      point(randomBetween(57, 71), randomBetween(94, 100)),
      point(randomBetween(35, 49), randomBetween(92, 100)),
      point(randomBetween(13, 27), randomBetween(94, 100)),
      point(0, randomBetween(92, 100)),
   ];
   const left = [
      point(randomBetween(0, 8), randomBetween(77, 90)),
      point(randomBetween(0, 6), randomBetween(56, 69)),
      point(randomBetween(0, 8), randomBetween(34, 48)),
      point(randomBetween(0, 6), randomBetween(12, 25)),
   ];

   return `polygon(${[...top, ...right, ...bottom, ...left].join(', ')})`;
};

const preparePaperCuts = (root: ParentNode = document) => {
   root.querySelectorAll<HTMLElement>(PAPER_SELECTOR).forEach((target) => {
      if (target.closest('.cv-document') || target.style.getPropertyValue(PAPER_CUT_PROPERTY))
         return;
      target.style.setProperty(PAPER_CUT_PROPERTY, createTornCut());
   });
};

const restore = (target: HTMLElement, interaction: Interaction) => {
   window.clearTimeout(interaction.timer);
   interaction.timer = undefined;
   if (!interaction.origin) return;

   if (interaction.origin.value) {
      target.style.setProperty(CUT_PROPERTY, interaction.origin.value, interaction.origin.priority);
   } else target.style.removeProperty(CUT_PROPERTY);
   if (!target.style.length) target.removeAttribute('style');
   interaction.origin = undefined;
};

const prune = (target: HTMLElement, interaction: Interaction) => {
   if (!interaction.hovered && !interaction.focusVisible && !interaction.origin)
      interactions.delete(target);
};

const cancel = (target: HTMLElement, interaction: Interaction) => {
   restore(target, interaction);
   prune(target, interaction);
};

const canAnimateShape = (target: HTMLElement, interaction: Interaction) => {
   if (
      !target.isConnected ||
      target.matches(':disabled, [hidden]') ||
      motionQuery?.matches ||
      document.hidden ||
      !(interaction.hovered || interaction.focusVisible)
   )
      return false;

   const rect = target.getBoundingClientRect();
   return rect.bottom > 0 && rect.top < window.innerHeight;
};

const animateActiveShape = (target: HTMLElement, interaction: Interaction) => {
   if (interaction.origin || !canAnimateShape(target, interaction)) return;
   interaction.origin = {
      value: target.style.getPropertyValue(CUT_PROPERTY),
      priority: target.style.getPropertyPriority(CUT_PROPERTY),
   };
   const snap = () => {
      interaction.timer = undefined;
      if (!canAnimateShape(target, interaction)) {
         restore(target, interaction);
         return;
      }
      target.style.setProperty(CUT_PROPERTY, createTornCut());
      interaction.timer = window.setTimeout(snap, 1_000);
   };
   snap();
};

const targetFor = (node: EventTarget | null) => {
   if (!(node instanceof Element)) return undefined;
   const target = node.closest<HTMLElement>(TARGET_SELECTOR);
   return target && !target.matches(':disabled, [hidden]') ? target : undefined;
};

const update = (target: HTMLElement, channel: 'hovered' | 'focusVisible', active: boolean) => {
   const interaction = interactions.get(target) ?? {
      hovered: false,
      focusVisible: false,
   };
   const wasActive = interaction.hovered || interaction.focusVisible;
   interaction[channel] = active;
   const isActive = interaction.hovered || interaction.focusVisible;
   interactions.set(target, interaction);

   if (!wasActive && isActive) animateActiveShape(target, interaction);
   if (!isActive) cancel(target, interaction);
};

const clearAll = () => {
   interactions.forEach((interaction, target) => restore(target, interaction));
   interactions.clear();
};

const reconcileActive = () => {
   interactions.forEach((interaction, target) => {
      if (!target.isConnected) {
         restore(target, interaction);
         interactions.delete(target);
         return;
      }
      if (!canAnimateShape(target, interaction)) restore(target, interaction);
      else animateActiveShape(target, interaction);
   });
};

const bind = () => {
   motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
   motionQuery.addEventListener('change', reconcileActive);

   document.addEventListener('pointerover', (event) => {
      if (event.pointerType === 'touch') return;
      const target = targetFor(event.target);
      if (target && !(event.relatedTarget instanceof Node && target.contains(event.relatedTarget)))
         update(target, 'hovered', true);
   });
   document.addEventListener('pointerout', (event) => {
      if (event.pointerType === 'touch') return;
      const target = targetFor(event.target);
      if (target && !(event.relatedTarget instanceof Node && target.contains(event.relatedTarget)))
         update(target, 'hovered', false);
   });
   document.addEventListener('focusin', (event) => {
      const target = targetFor(event.target);
      if (target) update(target, 'focusVisible', target.matches(':focus-visible'));
   });
   document.addEventListener('focusout', (event) => {
      const target = targetFor(event.target);
      if (target && !(event.relatedTarget instanceof Node && target.contains(event.relatedTarget)))
         update(target, 'focusVisible', false);
   });
   document.addEventListener('visibilitychange', reconcileActive);
   document.addEventListener('scroll', reconcileActive, { capture: true, passive: true });
   document.addEventListener('astro:before-swap', (event) => {
      clearAll();
      // Prepare the incoming DOM before paint; keep each resting cut for its lifetime.
      preparePaperCuts((event as TransitionBeforeSwapEvent).newDocument);
   });
   document.addEventListener('astro:page-load', () => preparePaperCuts());
   preparePaperCuts();
};

if (typeof document !== 'undefined' && !document.documentElement.dataset.printInteractionsBound) {
   document.documentElement.dataset.printInteractionsBound = 'true';
   bind();
}
