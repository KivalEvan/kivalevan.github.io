let pendingBody: HTMLElement | undefined;
let focusFrame: number | undefined;

const cancelFocus = () => {
   if (focusFrame !== undefined) cancelAnimationFrame(focusFrame);
   focusFrame = undefined;
};

const focusNavigationTarget = () => {
   let hash: string;
   try {
      hash = decodeURIComponent(window.location.hash.slice(1));
   } catch {
      // An invalid URL fragment has no focus target, but must not break navigation.
      return;
   }
   const target = document.getElementById(hash || 'main-content');
   if (!(target instanceof HTMLElement)) return;

   if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
   target.focus({ preventScroll: true });
};

const scheduleFocus = (frames = 1) => {
   cancelFocus();
   const body = document.body;
   const focus = () => {
      focusFrame = undefined;
      if (body !== document.body) return;
      if (--frames > 0) focusFrame = requestAnimationFrame(focus);
      else focusNavigationTarget();
   };
   focusFrame = requestAnimationFrame(focus);
};

if (!document.documentElement.dataset.navigationFocusBound) {
   document.documentElement.dataset.navigationFocusBound = 'true';
   document.addEventListener('astro:before-preparation', () => {
      cancelFocus();
      pendingBody = undefined;
   });
   document.addEventListener('astro:after-swap', () => {
      cancelFocus();
      pendingBody = document.body;
   });
   document.addEventListener('astro:page-load', () => {
      if (pendingBody !== document.body) return;
      pendingBody = undefined;
      scheduleFocus();
   });
   document.addEventListener('click', (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)
         return;
      const source = event.target;
      if (!(source instanceof Element)) return;
      const anchor = source.closest('a[href^="#"]');
      if (
         !(anchor instanceof HTMLAnchorElement) ||
         anchor.hasAttribute('download') ||
         (anchor.target && anchor.target !== '_self')
      ) {
         return;
      }
      // Astro prevents the native click while updating the hash itself. Wait for
      // that update rather than treating defaultPrevented as a canceled navigation.
      scheduleFocus(2);
   });
   window.addEventListener('hashchange', () => scheduleFocus());
}
