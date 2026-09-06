/**
 * Bake InkCollision's eight original impressions into transparent, colored plates.
 * Node 22+; use an existing Playwright module (no packages are installed):
 * node scripts/generate-mobile-collision-groups.mjs --playwright /path/to/playwright/index.mjs
 * --url http://localhost:4321 reuses a local Astro server; otherwise this process
 * starts and stops its own server. --browser selects a Chromium executable.
 * --output overrides the output directory (matching filenames are replaced).
 * Regenerate after changing the component or masters. Chromium preserves SVG
 * filter overflow, masks and blend order on transparency, without caller motion.
 * Ratios cover measured interior openings: 0.49–2.28 at 320–767px viewport widths.
 * The longest side is 960px; decoded RGBA is at most 3.69 MB per selected plate.
 * WebP quality 90 retains lossless alpha. This trades download bytes for less live
 * compositing, not a download reduction; only the selected ratio is displayed.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const { values } = parseArgs({
   options: {
      playwright: { type: 'string' },
      browser: { type: 'string' },
      url: { type: 'string' },
      output: { type: 'string' },
   },
});
const root = fileURLToPath(new URL('../', import.meta.url));
const output = values.output
   ? resolve(values.output)
   : resolve(root, 'src/assets/ink/mobile-collision-groups');
const ratios = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.125, 1.25, 1.5, 1.75, 2, 2.5];
let server;
let browser;
try {
   let url;
   if (values.url) {
      url = new URL(values.url);
      if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
         throw new Error('Use a local Astro dev server URL.');
   } else {
      const { dev } = await import('astro');
      server = await dev({ root, server: { host: '127.0.0.1', port: 0 } });
      url = new URL(`http://127.0.0.1:${server.address.port}`);
   }
   const { chromium } = await import(
      values.playwright ? pathToFileURL(resolve(values.playwright)).href : 'playwright'
   );
   browser = await chromium.launch({ executablePath: values.browser });
   const page = await browser.newPage({
      viewport: { width: 1440, height: 1440 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
   });
   await page.goto(new URL('/project/', url).href);
   const markup = await page.locator('.ink-collision').evaluate((element) => {
      const clone = element.cloneNode(true);
      clone.className = 'ink-collision';
      clone.querySelector('.ink-collision__mobile')?.remove();
      if (clone.querySelectorAll('.ink-collision__layer').length !== 8)
         throw new Error('Expected all eight original impressions.');
      return clone.outerHTML;
   });
   const source = await readFile(resolve(root, 'src/components/visual/InkCollision.astro'), 'utf8');
   const css = source
      .split('<style>')[1]
      .split('</style>')[0]
      .replaceAll(':global(svg)', 'svg')
      .replaceAll('../../assets/', new URL('/src/assets/', url).href);
   // Navigate away from Astro's document to close its live-reload connection.
   // setContent alone leaves Vite running and an asset write can reload mid-bake.
   const captureUrl = new URL('/__collision-bake', url).href;
   await page.route(captureUrl, (route) =>
      route.fulfill({
         contentType: 'text/html',
         body: `<style>html,body{margin:0;background:transparent}${css}</style>${markup}`,
      }),
   );
   await page.goto(captureUrl);
   await mkdir(output, { recursive: true });
   for (const ratio of ratios) {
      const width = Math.round(960 * Math.min(1, ratio));
      const height = Math.round(960 / Math.max(1, ratio));
      await page.locator('.ink-collision').evaluate(
         (element, size) => {
            element.style.cssText = `inset:32px auto auto 32px;width:${size.width}px;height:${size.height}px`;
         },
         { width, height },
      );
      // Warm the masked paint, including URL assets. The 32px transparent margin
      // isolates the capture; the original root still clips its own SVG overflow.
      await page.screenshot({ omitBackground: true });
      const png = await page.screenshot({
         omitBackground: true,
         clip: { x: 32, y: 32, width, height },
      });
      const webp = await sharp(png).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toBuffer();
      const name = `collision-${String(ratio).replace('.', '-')}.webp`;
      await writeFile(resolve(output, name), webp);
      console.log(
         `${name}: ${width}×${height}; ${webp.length} bytes; RGBA ${width * height * 4} bytes; sha256 ${createHash('sha256').update(webp).digest('hex')}`,
      );
   }
} finally {
   await browser?.close();
   await server?.stop();
}
