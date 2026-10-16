/**
 * Homepage event budget retained for title glitches. The one-second pose
 * schedulers bypass this budget so groups cannot delay each other's cadence.
 *
 * Each 12-second active period ends with a two-second quiet window. Outside
 * that window, title glitches are separated by at least 350 ms.
 */
const ACTIVE_PERIOD_MS = 12_000;
const QUIET_WINDOW_MS = 2_000;
const MIN_EVENT_GAP_MS = 350;

let periodStartedAt = 0;
let lastEventAt = Number.NEGATIVE_INFINITY;

const now = () => performance.now();
const onHomepage = () => !!document.querySelector('.mixed-hero');

const reset = () => {
   periodStartedAt = now();
   lastEventAt = Number.NEGATIVE_INFINITY;
};

/** Returns a retry delay, or records that a title glitch may run now. */
export const requestAmbientEvent = () => {
   if (!onHomepage()) return 0;

   const time = now();
   const phase = (time - periodStartedAt) % ACTIVE_PERIOD_MS;
   if (phase >= ACTIVE_PERIOD_MS - QUIET_WINDOW_MS) return ACTIVE_PERIOD_MS - phase;

   const delay = Math.max(0, MIN_EVENT_GAP_MS - (time - lastEventAt));
   if (delay) return delay;

   lastEventAt = time;
   return 0;
};

const bind = () => {
   reset();
   document.addEventListener('astro:before-swap', reset);
   document.addEventListener('astro:page-load', reset);
};

if (typeof document !== 'undefined' && !document.documentElement.dataset.ambientRhythmBound) {
   document.documentElement.dataset.ambientRhythmBound = 'true';
   bind();
}
