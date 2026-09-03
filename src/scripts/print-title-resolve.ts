const CHARACTERS = ['H', 'N', 'X', 'K', 'E', 'A'];
// Match the homepage's uneven print cadence, without its poster-specific artwork.
const PASSES = [
   { changes: [20, 70, 125, 180], settle: 245 },
   { changes: [], settle: 105 },
   { changes: [85, 125, 170, 220, 290], settle: 345 },
   { changes: [40, 85, 135, 190, 250, 310, 380, 455], settle: 520 },
   { changes: [160, 225], settle: 300 },
   { changes: [], settle: 195 },
   { changes: [35, 110, 205], settle: 270 },
   { changes: [55, 95, 140, 190, 240, 320], settle: 390 },
   { changes: [145, 205, 270, 340], settle: 450 },
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
   const slots: { element: HTMLSpanElement; final: string }[] = [];
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
               slots.push({ element: glyph, final: letter.text });
         }
         wrapper.append(wordElement);
      }
      source.text.replaceWith(wrapper);
      wrappers.push({ wrapper, text: source.text });
   }

   let cleaned = false;
   const timers = new Set<number>();
   let resizeObserver: ResizeObserver | undefined;
   const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      timers.forEach((timer) => view.clearTimeout(timer));
      timers.clear();
      resizeObserver?.disconnect();
      view.removeEventListener('resize', cleanup);
      document.fonts?.removeEventListener('loadingdone', cleanup);
      wrappers.forEach(({ wrapper, text }) => wrapper.replaceWith(text));
      if (width) title.style.setProperty('width', width, widthPriority);
      else title.style.removeProperty('width');
      if (label === null) title.removeAttribute('aria-label');
   };

   const later = (callback: () => void, delay: number) => {
      const timer = view.setTimeout(() => {
         timers.delete(timer);
         callback();
      }, delay);
      timers.add(timer);
   };
   const compact = view.matchMedia('(max-width: 47.99rem)').matches;
   slots.forEach(({ element, final }, index) => {
      const { changes, settle } = PASSES[index % PASSES.length];
      const substitute = () => {
         element.textContent =
            final.toUpperCase() === 'I'
               ? Math.random() < 0.5
                  ? 'I'
                  : '1'
               : CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
      };
      if (changes.length) substitute();
      changes.forEach((time, pass) => {
         if (!compact || pass % 2 === 0) later(substitute, time * 1.4);
      });
      later(() => {
         element.textContent = final;
      }, settle * 1.4);
   });
   later(cleanup, 730);
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
   return cleanup;
};
