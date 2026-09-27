/**
 * Bake full hero planes, including shared masks and local material, from masters.
 * Node 22+, installed sharp, Playwright Chromium. --playwright /path/to/index.mjs
 * Optional --browser, --url (local dev server), --output. Owns a server otherwise.
 * --widths accepts comma-separated partial updates to an existing static bake.
 * Regenerate after artwork, palette, or geometry changes, not entrance timing.
 * Lossless WebP preserves colored edges at three pixels per CSS pixel.
 * Each registration has four final plates. CSS owns the held-pose entrance,
 * so mobile no longer downloads a separate image for every animation frame.
 */
import { mkdir, readFile, readdir, rename, unlink, writeFile } from 'node:fs/promises';
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
   },
});
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(values.output ?? resolve(root, 'src/assets/ink/mobile-hero-planes'));
const screenshotTimeout = 120_000;
const rasterScale = 3;
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
const manifest = {
   definitionContext: 'first-document-svg-viewports',
   encoding: 'static-plates',
   rasterScale,
   variants: {},
};
// Partial runs update registrations. Palette and material edits need a full bake.
if (values.widths) {
   const previous = JSON.parse(await readFile(resolve(output, 'planes.json'), 'utf8'));
   if (
      previous.definitionContext !== manifest.definitionContext ||
      previous.encoding !== manifest.encoding ||
      previous.rasterScale !== manifest.rasterScale
   )
      throw Error('Definition context, plate encoding, or raster scale changed: run a full bake.');
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
   await mkdir(output, { recursive: true });
   for (const width of widths) {
      // Bound Chromium's raster-resource lifetime during a full software-rendered bake.
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
      const capture = await browser.newPage({ deviceScaleFactor: rasterScale });
      const captureUrl = new URL('/__hero-plane-bake', url).href;
      await capture.route(captureUrl, (route) =>
         route.fulfill({ contentType: 'text/html', body: '<body></body>' }),
      );
      await capture.goto(captureUrl);
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
            hero.classList.remove('home-motion--playing', 'home-motion--holding');
         });
         await page.screenshot({ timeout: screenshotTimeout });
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
         const variant = (manifest.variants[`${width}-${height}`] = {});
         for (const [plane, selector] of Object.entries(planes)) {
            if (height === 1100 && plane !== 'back') {
               variant[plane] = manifest.variants[`${width}-844`][plane];
               continue;
            }
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
            let png;
            try {
               await capture.screenshot({ omitBackground: true, timeout: screenshotTimeout });
               png = await capture.screenshot({
                  omitBackground: true,
                  timeout: screenshotTimeout,
               });
            } catch (cause) {
               throw Error(`Capture failed: ${width}x${height} ${plane}`, {
                  cause,
               });
            }
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
            if (right < 0) throw Error(`Empty final plate: ${width}x${height} ${plane}`);
            // Alpha bounds are device pixels; registration remains in CSS pixels.
            const gutter = 2 * rasterScale;
            if (
               left < gutter ||
               top < gutter ||
               right >= info.width - gutter ||
               bottom >= info.height - gutter
            )
               throw Error(`${plane}: increase overscan`);
            left -= gutter;
            top -= gutter;
            right += gutter;
            bottom += gutter;
            const crop = { left, top, width: right - left + 1, height: bottom - top + 1 };
            const webp = await sharp(png)
               .extract(crop)
               .webp({ lossless: true, effort: 6 })
               .toBuffer();
            const file = `${plane}-${width}-${height}-static.webp`;
            await writeFile(resolve(output, file), webp);
            const entry = {
               file,
               width: crop.width,
               height: crop.height,
               bytes: webp.length,
               left: (left / rasterScale - source.margin) / source.width,
               top: (top / rasterScale - source.margin) / source.height,
               scaleX: crop.width / rasterScale / source.width,
               scaleY: crop.height / rasterScale / source.height,
            };
            variant[plane] = [entry];
            console.log(`${width}x${height} ${plane}: ${webp.length} bytes`);
         }
      }
      await browser.close();
      browser = undefined;
   }
   const manifestPath = resolve(output, 'planes.json');
   for (const variant of Object.values(manifest.variants)) {
      for (const frames of Object.values(variant)) {
         if (frames.length !== 1 || !frames[0].file)
            throw Error('Each registration must contain one final plate. Run a full bake.');
      }
   }
   await writeFile(`${manifestPath}.tmp`, JSON.stringify(manifest, null, 2) + '\n');
   await rename(`${manifestPath}.tmp`, manifestPath);
   const usedFiles = new Set(
      Object.values(manifest.variants).flatMap((variant) =>
         Object.values(variant).flatMap((frames) => frames.flatMap((frame) => frame.file ?? [])),
      ),
   );
   for (const file of await readdir(output)) {
      if (file.endsWith('.webp') && !usedFiles.has(file)) await unlink(resolve(output, file));
   }
} finally {
   await browser?.close();
   await server?.stop();
}
