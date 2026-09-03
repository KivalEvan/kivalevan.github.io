/**
 * Shared homepage-only budget for passive ambient changes.
 *
 * Each 12-second active period ends with a two-second quiet window. Outside
 * that window, passive groups are separated by at least 350 ms. Title events
 * reserve their final 500 ms so quieter controls do not cut in immediately
 * before a title change.
 */
export type AmbientEventPriority = 'title' | 'ambient' | 'control';

const ACTIVE_PERIOD_MS = 12_000;
const QUIET_WINDOW_MS = 2_000;
const MIN_EVENT_GAP_MS = 350;
const TITLE_RESERVE_MS = 500;

let periodStartedAt = 0;
let lastEventAt = Number.NEGATIVE_INFINITY;
const titleReservations = new Map<string, number>();

const now = () => performance.now();
const onHomepage = () => !!document.querySelector('.mixed-hero');

const reset = () => {
   periodStartedAt = now();
   lastEventAt = Number.NEGATIVE_INFINITY;
   titleReservations.clear();
};

const titleReservationDelay = (time: number) => {
   let delay = 0;
   titleReservations.forEach((dueAt) => {
      if (dueAt >= time && dueAt - time <= TITLE_RESERVE_MS) delay = Math.max(delay, dueAt - time);
   });
   return delay;
};

/** Returns a retry delay, or records that this passive group may run now. */
export const requestAmbientEvent = (priority: AmbientEventPriority) => {
   if (!onHomepage()) return 0;

   const time = now();
   const phase = (time - periodStartedAt) % ACTIVE_PERIOD_MS;
   if (phase >= ACTIVE_PERIOD_MS - QUIET_WINDOW_MS) return ACTIVE_PERIOD_MS - phase;

   const recentDelay = Math.max(0, MIN_EVENT_GAP_MS - (time - lastEventAt));
   const reserveDelay = priority === 'control' ? titleReservationDelay(time) : 0;
   const delay = Math.max(recentDelay, reserveDelay);
   if (delay) return delay;

   lastEventAt = time;
   return 0;
};

/** Reserves the final 500 ms before an already-scheduled title event. */
export const reserveTitleEvent = (name: string, dueAt: number) => {
   if (onHomepage()) titleReservations.set(name, dueAt);
};

export const clearTitleEventReservation = (name: string) => titleReservations.delete(name);

const bind = () => {
   reset();
   document.addEventListener('astro:before-swap', reset);
   document.addEventListener('astro:page-load', reset);
};

if (typeof document !== 'undefined' && !document.documentElement.dataset.ambientRhythmBound) {
   document.documentElement.dataset.ambientRhythmBound = 'true';
   bind();
}
