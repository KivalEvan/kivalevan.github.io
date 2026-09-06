/**
 * Bake full hero planes, including shared masks and local material, from masters.
 * Node 22+, installed sharp, Playwright Chromium. --playwright /path/to/index.mjs
 * Optional --browser, --url (local dev server), --output. Owns a server otherwise.
 * --widths and --times accept comma-separated partial updates to an existing bake.
 * Regenerate after artwork, palette, geometry, or entrance CSS changes.
 * Color uses WebP quality 90; alpha is lossless, at one pixel per CSS pixel.
 * Times start AFTER home-motion's unchanged 280ms hold. Intermediate omitted
 * poses hold the preceding retained pose; no runtime clipping or crossfading.
 */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import sharp from 'sharp';

const { values } = parseArgs({
   options: {
      playwright: { type: 'string' },
      browser: { type: 'string' },
      url: { type: 'string' },
      output: { type: 'string' },
      widths: { type: 'string' },
      times: { type: 'string' },
   },
});
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(values.output ?? resolve(root, 'src/assets/ink/mobile-hero-planes'));
const times = [
   0, 82.08, 119.52, 123.12, 164.16, 205.2, 245, 275, 310, 375, 410, 480, 540, 600, 730,
];
const captureTimes = values.times ? values.times.split(',').map(Number) : times;
if (captureTimes.some((time) => !times.includes(time)))
   throw Error('Capture times must be retained poses.');
const widths = values.widths
   ? values.widths.split(',').map(Number)
   : [320, 360, 375, 390, 410, 430, 500, 600, 684, 767];
if (widths.some((width) => !Number.isInteger(width) || width < 320 || width > 767))
   throw Error('Widths must be comma-separated integers between 320 and 767.');
const planes = {
   back: '.mixed-hero__art--back',
   mid: '.mixed-hero__midground',
   fore: '.mixed-hero__foreground',
   front: '.mixed-hero__foreground',
};
const manifest = { definitionContext: 'first-document-svg-viewports', times, variants: {} };
// Partial runs add registrations or selected poses. Palette, material, and
// authored animation edits require a full run (omit --widths and --times).
if (values.widths || values.times) {
   const previous = JSON.parse(await readFile(resolve(output, 'planes.json'), 'utf8'));
   if (previous.definitionContext !== manifest.definitionContext)
      throw Error('Definition context changed: run a full bake.');
   if (!values.times && JSON.stringify(previous.times) !== JSON.stringify(times))
      throw Error('Timing changed: run a full bake.');
   manifest.variants = previous.variants;
}
let server, browser;
try {
   let url;
   if (values.url) {
      url = new URL(values.url);
      if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
         throw Error('Use a local server.');
   } else {
      const { dev } = await import('astro');
      server = await dev({ root, server: { host: '127.0.0.1', port: 0 } });
      url = new URL(`http://127.0.0.1:${server.address.port}`);
   }
   const { chromium } = await import(
      values.playwright ? pathToFileURL(resolve(values.playwright)).href : 'playwright'
   );
   browser = await chromium.launch({
      executablePath: values.browser,
      args: [
         '--disable-dev-shm-usage',
         '--use-gl=angle',
         '--use-angle=swiftshader',
         '--enable-unsafe-swiftshader',
      ],
   });
   const page = await browser.newPage({ deviceScaleFactor: 1, javaScriptEnabled: false });
   const capture = await browser.newPage({ deviceScaleFactor: 1 });
   const captureUrl = new URL('/__hero-plane-bake', url).href;
   await capture.route(captureUrl, (route) =>
      route.fulfill({ contentType: 'text/html', body: '<body></body>' }),
   );
   await capture.goto(captureUrl);
   await mkdir(output, { recursive: true });
   for (const width of widths)
      for (const height of [844, 1100]) {
         await page.setViewportSize({ width, height });
         await page.goto(url.href);
         await page.evaluate(() => {
            document.querySelectorAll('[data-mobile-hero-plane]').forEach((n) => n.remove());
            document
               .querySelectorAll('[data-hero-plane-source]')
               .forEach((n) => n.removeAttribute('data-hero-plane-source'));
            const hero = document.querySelector('.mixed-hero');
            delete hero.dataset.homeMotionBoot;
            hero.classList.add('home-motion--playing', 'home-motion--holding');
            // Backwards-fill effects disappear from getAnimations after their
            // endpoint. Keep references so every plane can rewind all effects.
            window.heroBakeAnimations = hero.getAnimations({ subtree: true });
            window.heroBakeAnimations.forEach((a) => {
               a.pause();
               a.currentTime = 0;
            });
         });
         await page.screenshot();
         // SVG fragment IDs are document-global. The first definition may live
         // in the portrait or another ink plane and use that SVG's viewport.
         // Preserve those ordered contexts; a plane-only clone changes the art.
         const definitionContexts = await page.evaluate(() => {
            return [...document.querySelectorAll('svg')]
               .filter((svg) => svg.querySelector(':scope > defs'))
               .map((svg) => {
                  const clone = svg.cloneNode(true);
                  [...clone.children].forEach((child) => {
                     if (child.tagName !== 'defs') child.remove();
                  });
                  const originals = [svg, ...svg.querySelectorAll('defs, defs *')];
                  const copies = [clone, ...clone.querySelectorAll('defs, defs *')];
                  originals.forEach((node, index) => {
                     const style = getComputedStyle(node);
                     copies[index].setAttribute(
                        'style',
                        [...style]
                           .map(
                              (key) =>
                                 `${key}:${style.getPropertyValue(key).replaceAll(location.href.split('#')[0] + '#', '#')};`,
                           )
                           .join(''),
                     );
                  });
                  Object.assign(clone.style, {
                     position: 'absolute',
                     left: '0',
                     top: '0',
                     margin: '0',
                     animation: 'none',
                  });
                  // Authored mobile-hidden impressions must stay without a
                  // viewport. Keep duplicates in DOM order: do not activate a
                  // hidden first definition or discard a later active context.
                  if (!svg.getClientRects().length) clone.style.display = 'none';
                  return clone.outerHTML;
               })
               .join('');
         });
         const previousVariant = manifest.variants[`${width}-${height}`];
         const variant = (manifest.variants[`${width}-${height}`] = {});
         for (const [plane, selector] of Object.entries(planes)) {
            if (height === 1100 && plane !== 'back') {
               variant[plane] = manifest.variants[`${width}-844`][plane];
               continue;
            }
            const frames = [];
            let previous;
            if (values.times) {
               const entry = previousVariant?.[plane]
                  ?.filter((frame) => frame.file && frame.time < captureTimes[0])
                  .at(-1);
               if (entry) previous = { entry, webp: await readFile(resolve(output, entry.file)) };
            }
            for (const time of captureTimes) {
               await page.evaluate(
                  (time) =>
                     window.heroBakeAnimations.forEach((a) => {
                        a.pause();
                        a.currentTime = time + 0.01;
                     }),
                  time,
               );
               const source = await page.locator(selector).evaluate((element, plane) => {
                  const styleText = (node, pseudo) => {
                     const s = getComputedStyle(node, pseudo);
                     return [...s]
                        .map(
                           (k) =>
                              `${k}:${s.getPropertyValue(k).replaceAll(location.href.split('#')[0] + '#', '#')};`,
                        )
                        .join('');
                  };
                  const clone = element.cloneNode(true);
                  const nodes = [element, ...element.querySelectorAll('*')];
                  const copies = [clone, ...clone.querySelectorAll('*')];
                  nodes.forEach((node, i) => {
                     copies[i].setAttribute('style', styleText(node));
                     for (const pseudo of ['::before', '::after']) {
                        if (['none', 'normal'].includes(getComputedStyle(node, pseudo).content))
                           continue;
                        const layer = document.createElement('span');
                        layer.style.cssText = styleText(node, pseudo);
                        layer.style.animation = 'none';
                        if (pseudo === '::before') copies[i].prepend(layer);
                        else copies[i].append(layer);
                     }
                     copies[i].style.animation = 'none';
                     copies[i].style.transition = 'none';
                  });
                  if (plane === 'fore') clone.querySelector('.mixed-hero__black-vein').remove();
                  if (plane === 'front')
                     [...clone.children].forEach((n) => {
                        if (!n.classList.contains('mixed-hero__black-vein')) n.remove();
                     });
                  const bounds = element.getBoundingClientRect();
                  // Definitions already have their original ordered viewports
                  // in the capture document; do not register cloned duplicates.
                  clone.querySelectorAll('defs').forEach((node) => node.remove());
                  const margin = 200;
                  Object.assign(clone.style, {
                     position: 'absolute',
                     inset: 'auto',
                     left: `${margin}px`,
                     top: `${margin}px`,
                     width: `${bounds.width}px`,
                     height: `${bounds.height}px`,
                     margin: '0',
                  });
                  return {
                     markup: clone.outerHTML,
                     width: bounds.width,
                     height: bounds.height,
                     margin,
                  };
               }, plane);
               await capture.setViewportSize({
                  width: Math.ceil(source.width + 400),
                  height: Math.ceil(source.height + 400),
               });
               await capture.setContent(
                  `<style>html,body{margin:0;background:transparent}</style>${definitionContexts}${source.markup}`,
               );
               await capture.evaluate(async () => {
                  const urls = new Set();
                  document.querySelectorAll('*').forEach((n) => {
                     const s = getComputedStyle(n);
                     for (const key of ['maskImage', 'backgroundImage'])
                        for (const m of s[key].matchAll(/url\("([^"]+)"\)/g))
                           if (!m[1].includes('#')) urls.add(m[1]);
                  });
                  await Promise.all(
                     [...urls].map(async (url) => {
                        const img = new Image();
                        img.src = url;
                        await img.decode();
                     }),
                  );
               });
               await capture.screenshot({ omitBackground: true });
               const png = await capture.screenshot({ omitBackground: true });
               const { data, info } = await sharp(png)
                  .ensureAlpha()
                  .raw()
                  .toBuffer({ resolveWithObject: true });
               let left = info.width,
                  top = info.height,
                  right = -1,
                  bottom = -1;
               for (let y = 0; y < info.height; y++)
                  for (let x = 0; x < info.width; x++)
                     if (data[(y * info.width + x) * 4 + 3]) {
                        left = Math.min(left, x);
                        top = Math.min(top, y);
                        right = Math.max(right, x);
                        bottom = Math.max(bottom, y);
                     }
               if (right < 0) {
                  frames.push({ time, empty: true });
                  continue;
               }
               if (left < 2 || top < 2 || right >= info.width - 2 || bottom >= info.height - 2)
                  throw Error(`${plane}: increase overscan`);
               left -= 2;
               top -= 2;
               right += 2;
               bottom += 2;
               const crop = { left, top, width: right - left + 1, height: bottom - top + 1 };
               const webp = await sharp(png)
                  .extract(crop)
                  .webp({ quality: 90, alphaQuality: 100, effort: 4 })
                  .toBuffer();
               if (
                  previous?.webp.equals(webp) &&
                  previous.entry.left === (left - source.margin) / source.width &&
                  previous.entry.top === (top - source.margin) / source.height
               ) {
                  frames.push({ ...previous.entry, time });
                  continue;
               }
               const file = `${plane}-${width}-${height}-${time}.webp`;
               await writeFile(resolve(output, file), webp);
               const entry = {
                  time,
                  file,
                  width: crop.width,
                  height: crop.height,
                  bytes: webp.length,
                  left: (left - source.margin) / source.width,
                  top: (top - source.margin) / source.height,
                  scaleX: crop.width / source.width,
                  scaleY: crop.height / source.height,
               };
               frames.push(entry);
               previous = { webp, entry };
            }
            variant[plane] = values.times
               ? [
                    ...new Map(
                       [...(previousVariant?.[plane] ?? []), ...frames]
                          .filter((frame) => times.includes(frame.time))
                          .map((frame) => [frame.time, frame]),
                    ).values(),
                 ].sort((a, b) => a.time - b.time)
               : frames;
            console.log(
               width,
               height,
               plane,
               new Set(frames.map((f) => f.file).filter(Boolean)).size,
            );
         }
      }
   const manifestPath = resolve(output, 'planes.json');
   for (const variant of Object.values(manifest.variants)) {
      for (const frames of Object.values(variant)) {
         if (
            frames.length !== times.length ||
            frames.some((frame, index) => frame.time !== times[index])
         )
            throw Error(
               'Partial bake is missing a retained pose. Run the missing times or a full bake.',
            );
      }
   }
   await writeFile(`${manifestPath}.tmp`, JSON.stringify(manifest, null, 2) + '\n');
   await rename(`${manifestPath}.tmp`, manifestPath);
} finally {
   await browser?.close();
   await server?.stop();
}
