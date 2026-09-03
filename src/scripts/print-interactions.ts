/**
 * Randomizes active interactive print backgrounds until hover and keyboard focus both end.
 * The CSS custom property is consumed exclusively by each control's background pseudo-element.
 */

const TARGET_SELECTOR = [
   '.punk-nav__link',
   '.mixed-hero__socials :is(a, button)',
   '.site-footer-links :is(a, button)',
   '.site-footer-support a',
   '.print-page .print-action',
].join(', ');
const CUT_PROPERTY = '--print-interaction-cut';

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

const point = (x: number, y: number) => `${x}% ${y}%`;

// Each side stays near its edge so the x=8..92, y=20..80 text-safe core remains uncut.
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

const animateActiveShape = (target: HTMLElement, interaction: Interaction) => {
   if (motionQuery?.matches || document.hidden || interaction.origin) return;
   interaction.origin = {
      value: target.style.getPropertyValue(CUT_PROPERTY),
      priority: target.style.getPropertyPriority(CUT_PROPERTY),
   };
   const snap = () => {
      const rect = target.getBoundingClientRect();
      if (
         !target.isConnected ||
         target.matches(':disabled, [hidden]') ||
         motionQuery?.matches ||
         document.hidden ||
         rect.bottom <= 0 ||
         rect.top >= window.innerHeight ||
         !(interaction.hovered || interaction.focusVisible)
      ) {
         restore(target, interaction);
         return;
      }
      target.style.setProperty(CUT_PROPERTY, createTornCut());
      interaction.timer = window.setTimeout(snap, randomBetween(750, 1_250));
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
      if (motionQuery?.matches || document.hidden) restore(target, interaction);
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
   document.addEventListener('astro:before-swap', clearAll);
};

if (typeof document !== 'undefined' && !document.documentElement.dataset.printInteractionsBound) {
   document.documentElement.dataset.printInteractionsBound = 'true';
   bind();
}
