import '../styles/print-title-resolve.scss';

const CHARACTERS = ['H', 'N', 'X', 'K', 'E', 'A'];
const TITLE_FPS = 12;
const TITLE_FRAME_MS = 1_000 / TITLE_FPS;
const RESOLVE_FRAMES = 9;
// Match the homepage's whole-frame holds, without its poster-specific artwork.
// Change and settle frame numbers are distinct for every slot.
const PASSES = [
   { changes: [0, 1, 2, 3], settle: 4 },
   { changes: [], settle: 2 },
   { changes: [1, 2, 3, 4, 5], settle: 6 },
   { changes: [1, 2, 3, 4, 5, 6, 8], settle: 9 },
   { changes: [3, 4], settle: 5 },
   { changes: [], settle: 3 },
   { changes: [1, 2, 3], settle: 5 },
   { changes: [1, 2, 3, 4, 5], settle: 7 },
   { changes: [2, 3, 5, 6], settle: 8 },
];
const STABLE_CHARACTER = /^[\s\p{P}\p{S}]$/u;

const segments = (text: string) =>
   'Segmenter' in Intl
      ? Array.from(new Intl.Segmenter().segment(text), ({ segment }) => segment)
      : Array.from(text);

interface Word {
   text: string;
   width: number;
   letters: { text: string; width: number }[];
}

interface Source {
   text: Text;
   words: Word[];
   singleLine: boolean;
}

/**
 * Resolves a visible heading's characters in place without a separate text overlay.
 * Measured word and letter widths preserve wrapping; an accessible label preserves
 * the heading's name while its visual characters change. Nested markup is retained.
 *
 * @param title Heading whose current font and layout are ready to measure.
 * @returns Idempotent cleanup restoring original text-node identities and label.
 */
export const startPrintTitleResolve = (title: HTMLElement): (() => void) => {
   const document = title.ownerDocument;
   const view = document.defaultView;
   if (!view) return () => undefined;

   const sources: Source[] = [];
   const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
   let text: Text | null;
   while ((text = walker.nextNode() as Text | null)) {
      const parent = text.parentElement;
      if (!parent || !text.data.trim()) continue;
      const hidden = parent.closest('[aria-hidden="true"], script, style, template');
      if (hidden && title.contains(hidden)) continue;
      const words: Word[] = [];
      const lineTops = new Set<number>();
      let offset = 0;
      for (const part of text.data.split(/(\s+)/u).filter(Boolean)) {
         const range = document.createRange();
         range.setStart(text, offset);
         range.setEnd(text, offset + part.length);
         const rects = Array.from(range.getClientRects());
         // Do not change a word that the browser already breaks across lines.
         if (!/^\s+$/u.test(part) && new Set(rects.map((rect) => rect.top)).size > 1) {
            return () => undefined;
         }
         if (!/^\s+$/u.test(part)) rects.forEach((rect) => lineTops.add(rect.top));
         const width = range.getBoundingClientRect().width;
         const letters = segments(part).map((letter) => {
            range.setStart(text!, offset);
            range.setEnd(text!, offset + letter.length);
            offset += letter.length;
            return { text: letter, width: range.getBoundingClientRect().width };
         });
         words.push({ text: part, width, letters });
      }
      sources.push({ text, words, singleLine: lineTops.size === 1 });
   }
   if (!sources.length) return () => undefined;

   const label = title.getAttribute('aria-label');
   // Atomic word slots change the browser's intrinsic inline-size calculation.
   // Keep the already-laid-out heading width while those slots are present so
   // fit-content and balanced headings cannot contract or reflow.
   const width = title.style.getPropertyValue('width');
   const widthPriority = title.style.getPropertyPriority('width');
   title.style.setProperty('width', `${title.getBoundingClientRect().width}px`);
   if (label === null) title.setAttribute('aria-label', title.textContent?.trim() ?? '');
   const wrappers: { wrapper: HTMLSpanElement; text: Text }[] = [];
   const slots: {
      element: HTMLSpanElement;
      final: string;
      pass?: number;
      settled: boolean;
   }[] = [];
   for (const source of sources) {
      const wrapper = document.createElement('span');
      wrapper.setAttribute('aria-hidden', 'true');
      if (source.singleLine) wrapper.style.whiteSpace = 'nowrap';
      for (const word of source.words) {
         if (/^\s+$/u.test(word.text)) {
            wrapper.append(document.createTextNode(word.text));
            continue;
         }
         const wordElement = document.createElement('span');
         wordElement.className = 'print-title-resolve__word';
         wordElement.style.width = `${word.width}px`;
         const total = word.letters.reduce((sum, letter) => sum + letter.width, 0);
         for (const letter of word.letters) {
            const glyph = document.createElement('span');
            glyph.className = 'print-title-resolve__letter';
            // Normalize tiny Range kerning overlaps so the word keeps its exact width.
            glyph.style.width = `${total ? (letter.width / total) * word.width : 0}px`;
            glyph.textContent = letter.text;
            wordElement.append(glyph);
            if (!STABLE_CHARACTER.test(letter.text))
               slots.push({ element: glyph, final: letter.text, settled: false });
         }
         wrapper.append(wordElement);
      }
      source.text.replaceWith(wrapper);
      wrappers.push({ wrapper, text: source.text });
   }

   let cleaned = false;
   let animationFrame: number | undefined;
   let resizeObserver: ResizeObserver | undefined;
   const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      if (animationFrame !== undefined) view.cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
      resizeObserver?.disconnect();
      view.removeEventListener('resize', cleanup);
      document.fonts?.removeEventListener('loadingdone', cleanup);
      wrappers.forEach(({ wrapper, text }) => wrapper.replaceWith(text));
      if (width) title.style.setProperty('width', width, widthPriority);
      else title.style.removeProperty('width');
      if (label === null) title.removeAttribute('aria-label');
   };

   const compact = view.matchMedia('(max-width: 47.99rem)').matches;
   const startedAt = view.performance.now();
   let previousFrame = -1;
   const update = (timestamp: number) => {
      if (cleaned) return;
      const frame = Math.max(0, Math.floor((timestamp - startedAt) / TITLE_FRAME_MS));
      // Restore original text directly on the last frame, without a second glyph write.
      if (frame >= RESOLVE_FRAMES) {
         cleanup();
         return;
      }
      if (frame !== previousFrame) {
         previousFrame = frame;
         slots.forEach((slot, index) => {
            if (slot.settled) return;
            const { element, final } = slot;
            const { changes, settle } = PASSES[index % PASSES.length];
            if (frame >= settle) {
               element.textContent = final;
               slot.settled = true;
               return;
            }
            if (!changes.length) return;
            // Only the latest due pose is visible, even after missed browser frames.
            const pass = changes.findLastIndex(
               (change, pass) => change <= frame && (!compact || pass % 2 === 0),
            );
            if (pass < 0 || pass === slot.pass) return;
            slot.pass = pass;
            element.textContent =
               final.toUpperCase() === 'I'
                  ? Math.random() < 0.5
                     ? 'I'
                     : '1'
                  : CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
         });
      }
      animationFrame = view.requestAnimationFrame(update);
   };
   view.addEventListener('resize', cleanup, { once: true });
   document.fonts?.addEventListener('loadingdone', cleanup);
   if ('ResizeObserver' in view) {
      let observed = false;
      resizeObserver = new ResizeObserver(() => {
         if (observed) cleanup();
         observed = true;
      });
      resizeObserver.observe(title);
   }
   update(startedAt);
   return cleanup;
};
