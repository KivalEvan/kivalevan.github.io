/**
 * Bake the core and its eight isolated background decorations with Chromium.
 * Start Astro dev, then run with Node 22+ and an existing Playwright installation:
 *   node scripts/generate-mobile-portrait.mjs --playwright /path/to/playwright/index.mjs --url http://localhost:4321
 * --browser selects Chromium; --output changes the core file's output path.
 * decoration.webp and its registration/source-hash JSON are written beside that file.
 * No packages are installed. sharp is supplied by the existing Astro installation.
 * The isolated browser closes on success or failure. No source masters are changed.
 * Regenerate after changing masters, masks, filters, colors, or portrait/hero geometry.
 * Keep the core separate: every decoration paints at z-index 1–5, below its z-index 6.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import sharp from 'sharp';

const { values } = parseArgs({
   options: {
      playwright: { type: 'string' },
      browser: { type: 'string' },
      url: { type: 'string', default: 'http://localhost:4321' },
      output: { type: 'string' },
   },
});
const url = new URL(values.url);
if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
   throw new Error('Use a local Astro dev server URL.');
}
const output = values.output
   ? resolve(values.output)
   : fileURLToPath(new URL('../src/assets/img/mobile-portrait/core.webp', import.meta.url));
const { chromium } = await import(
   values.playwright ? pathToFileURL(resolve(values.playwright)).href : 'playwright'
);
const browser = await chromium.launch({ executablePath: values.browser });
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

// Freeze computed paint before detaching from the page: currentColor, inherited
// variables, SVG presentation attributes, and stacking order all belong to the master.
async function captureDecoration(page) {
   await page.goto(url.href);
   return page.evaluate(async () => {
      await document.fonts.ready;
      let figure = document.querySelector('.media-portrait');
      const freeze = document.createElement('style');
      freeze.textContent =
         '.media-portrait,.media-portrait *{transition:none!important;animation:none!important}';
      document.head.append(freeze);
      figure.removeAttribute('data-mobile-portrait');
      figure.querySelectorAll('[data-mobile-decoration]').forEach((node) => node.remove());
      figure.querySelectorAll('source').forEach((node) => node.remove());
      figure
         .querySelectorAll('[data-mobile-core]')
         .forEach((node) => node.removeAttribute('data-mobile-core'));
      await Promise.all([...figure.querySelectorAll('img')].map((image) => image.decode()));
      if (
         [...figure.querySelectorAll('img')].some(
            (image) => !image.currentSrc.includes('kival_evan'),
         )
      ) {
         throw new Error('Expected original Avatar masters for decoration capture.');
      }
      const core = figure.querySelector('.media-portrait__plate--core');
      const coreZ = Number(getComputedStyle(core).zIndex);
      const children = [...figure.children].filter((child) => child !== core);
      if (
         children.length !== 8 ||
         children.some((child) => Number(getComputedStyle(child).zIndex) >= coreZ)
      ) {
         throw new Error(
            'The eight decorations must paint behind the core; revisit plane separation.',
         );
      }
      const style = getComputedStyle(figure);
      const width = parseFloat(style.width);
      const height = parseFloat(style.height);
      const contract = {
         figure: {
            width,
            height,
            mask: style.mask,
            filter: style.filter,
            clipPath: style.clipPath,
         },
         coreZ,
         children: children.map((child) => {
            const s = getComputedStyle(child);
            return {
               class: child.className,
               zIndex: s.zIndex,
               color: s.color,
               opacity: s.opacity,
               blend: s.mixBlendMode,
               transform: s.transform,
               mask: s.mask,
               filter: s.filter,
               left: s.left,
               top: s.top,
               width: s.width,
               height: s.height,
            };
         }),
      };
      // The core never enters the decoration image. Only its two authored offset
      // copies remain, blending against the isolated decoration, not the core.
      core.remove();
      const properties = [
         'position',
         'inset',
         'width',
         'height',
         'min-width',
         'min-height',
         'max-width',
         'max-height',
         'display',
         'overflow',
         'transform',
         'transform-origin',
         'opacity',
         'z-index',
         'isolation',
         'mask',
         'filter',
         'clip-path',
         'color',
         'mix-blend-mode',
         'object-fit',
         'object-position',
      ];
      const nodes = [figure, ...figure.querySelectorAll('div,img,picture,svg')];
      const styles = nodes.map((node) => {
         const s = getComputedStyle(node);
         return properties.map((property) => [property, s.getPropertyValue(property)]);
      });
      nodes.forEach((node, index) =>
         styles[index].forEach(([property, value]) => node.style.setProperty(property, value)),
      );
      const sourceFigure = figure;
      figure = sourceFigure.cloneNode(true);
      sourceFigure.classList.remove('media-portrait');
      const pad = { x: width * 0.3, y: height * 0.3 };
      Object.assign(figure.style, {
         position: 'absolute',
         margin: '0',
         left: pad.x + 'px',
         top: pad.y + 'px',
         transform: 'none',
      });
      // Retain preceding SVG definitions. Several masters share fragment IDs;
      // percentage mask geometry resolves in the original definition's viewport.
      // Removing that DOM would silently change the borrowed mask's paint.
      document.body.append(figure);
      const isolate = document.createElement('style');
      isolate.textContent =
         'body *{visibility:hidden!important}body defs,body defs *,.media-portrait,.media-portrait *{visibility:visible!important}astro-dev-toolbar{display:none!important}';
      document.head.append(isolate);
      document.documentElement.style.cssText = 'background:transparent!important';
      document.body.style.cssText = 'margin:0;background:transparent!important';
      document.querySelectorAll('astro-dev-toolbar').forEach((node) => node.remove());
      return {
         ...contract,
         pad,
         captureWidth: Math.ceil(width * 1.6),
         captureHeight: Math.ceil(height * 1.6),
      };
   });
}

async function writeDecoration() {
   const viewport = { width: 430, height: 844 };
   const page = await browser.newPage({
      viewport,
      deviceScaleFactor: 2,
      reducedMotion: 'reduce',
   });
   try {
      await page.routeWebSocket('**', (socket) => socket.close());
      const contract = await captureDecoration(page);
      const scale = Math.min(2, 1000 / contract.figure.width);
      await page.evaluate(
         () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
      );
      await page.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}' });
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setDefaultBackgroundColorOverride', {
         color: { r: 0, g: 0, b: 0, a: 0 },
      });
      const capture = await cdp.send('Page.captureScreenshot', {
         format: 'png',
         captureBeyondViewport: true,
         clip: {
            x: 0,
            y: 0,
            width: contract.captureWidth,
            height: contract.captureHeight,
            scale,
         },
      });
      const png = Buffer.from(capture.data, 'base64');
      await cdp.detach();
      const trimmed = await sharp(png)
         .trim({ background: '#00000000', threshold: 0 })
         .png()
         .toBuffer({ resolveWithObject: true });
      const canvas = await sharp(png).metadata();
      const cropLeft = -trimmed.info.trimOffsetLeft;
      const cropTop = -trimmed.info.trimOffsetTop;
      if (
         cropLeft <= 0 ||
         cropTop <= 0 ||
         cropLeft + trimmed.info.width >= canvas.width ||
         cropTop + trimmed.info.height >= canvas.height
      ) {
         throw new Error(
            'Decoration reaches the capture boundary; increase overscan before baking.',
         );
      }
      const encoded = await sharp(trimmed.data)
         .webp({ quality: 95, alphaQuality: 100, effort: 6 })
         .toBuffer();
      const image = await sharp(encoded).metadata();
      if (!image.hasAlpha) throw new Error('Decoration capture lost alpha.');
      const file = 'decoration.webp';
      const outputPath = resolve(dirname(output), file);
      await writeFile(outputPath, encoded);
      const sources = [
         'scripts/generate-mobile-portrait.mjs',
         'src/components/visual/InkPortrait.astro',
         'src/components/Avatar.astro',
         'src/pages/index.astro',
         'src/styles/tailwind.css',
         'src/assets/img/avatar/kival_evan.jpg',
         ...[
            'organic-drag-1',
            'organic-drag-2',
            'pigment-pool-red',
            'pigment-pool-blue',
            'ink-tangle-blue',
            'splatter-cluster-3',
         ].map((name) => `src/assets/ink/${name}.svg`),
      ];
      const sourceHashes = Object.fromEntries(
         await Promise.all(
            sources.map(async (name) => [
               name,
               hash(await readFile(new URL('../' + name, import.meta.url))),
            ]),
         ),
      );
      const metadata = {
         file,
         viewport,
         scale,
         ...contract,
         sourceHashes,
         image: {
            encoding: { format: 'webp', quality: 95, alphaQuality: 100 },
            width: image.width,
            height: image.height,
            bytes: encoded.length,
            decodedBytes: image.width * image.height * 4,
            sha256: hash(encoded),
         },
         registration: {
            left: (-trimmed.info.trimOffsetLeft / scale - contract.pad.x) / contract.figure.width,
            top: (-trimmed.info.trimOffsetTop / scale - contract.pad.y) / contract.figure.height,
            width: image.width / scale / contract.figure.width,
            height: image.height / scale / contract.figure.height,
         },
         paintOrder: 'decoration (original z-index 1–5), unchanged core (z-index 6)',
      };
      const core = await readFile(output);
      const coreImage = await sharp(core).metadata();
      metadata.core = {
         bytes: core.length,
         width: coreImage.width,
         height: coreImage.height,
         sha256: hash(core),
      };
      metadata.totalImageBytes = core.length + encoded.length;
      metadata.totalDecodedBytes =
         (coreImage.width * coreImage.height + image.width * image.height) * 4;
      console.log(JSON.stringify({ output: outputPath, ...metadata }, null, 2));
      await writeFile(
         resolve(dirname(output), 'decoration.json'),
         JSON.stringify(metadata, null, 2) + '\n',
      );
   } finally {
      await page.close();
   }
}
try {
   const page = await browser.newPage({
      viewport: { width: 430, height: 1000 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
   });
   await page.routeWebSocket('**', (socket) => socket.close());
   await page.goto(url.href);
   await page.locator('.media-portrait__plate--core img').waitFor();
   const contract = await page.evaluate(async () => {
      await document.fonts.ready;
      const core = document.querySelector('.media-portrait__plate--core');
      // Restore source selection AND authored effects before reading computed styles.
      // This prevents recursively baking an already colored/masked mobile asset.
      // Global filter transitions must not interpolate from the mobile `none` value.
      core.style.transition = 'none';
      core.removeAttribute('data-mobile-core');
      core.querySelectorAll('source').forEach((source) => source.remove());
      const image = core.querySelector('img');
      await image.decode();
      const plateStyle = getComputedStyle(core);
      const imageStyle = getComputedStyle(image);
      if (plateStyle.maskImage === 'none' || plateStyle.filter === 'none') {
         throw new Error('Original core mask/filter missing; refusing to bake.');
      }
      if (!image.currentSrc.includes('kival_evan')) {
         throw new Error('Expected the original Avatar master; use the Astro dev server.');
      }
      const contract = {
         mask: plateStyle.mask,
         filter: plateStyle.filter,
         objectFit: imageStyle.objectFit,
         objectPosition: imageStyle.objectPosition,
         width: parseFloat(plateStyle.width),
         height: parseFloat(plateStyle.height),
      };
      const plate = document.createElement('div');
      for (const property of [
         'mask-image',
         'mask-size',
         'mask-position',
         'mask-repeat',
         'mask-mode',
         'mask-composite',
         'mask-origin',
         'mask-clip',
         'filter',
         'clip-path',
         'opacity',
         'mix-blend-mode',
         'overflow',
         'color',
      ]) {
         plate.style.setProperty(property, plateStyle.getPropertyValue(property));
      }
      const photo = document.createElement('img');
      for (const property of ['object-fit', 'object-position', 'filter', 'opacity']) {
         photo.style.setProperty(property, imageStyle.getPropertyValue(property));
      }
      photo.src = image.currentSrc;
      photo.removeAttribute('srcset');
      plate.append(photo);
      // Capture the complete plate, not the viewport crop or surrounding decoration.
      const width = image.naturalWidth;
      const height = (width * contract.height) / contract.width;
      Object.assign(plate.style, {
         position: 'fixed',
         inset: 'auto',
         left: '0',
         top: '0',
         margin: '0',
         width: width + 'px',
         height: height + 'px',
         transform: 'none',
      });
      Object.assign(photo.style, { width: '100%', height: '100%' });
      document.querySelectorAll('style,link[rel="stylesheet"]').forEach((e) => e.remove());
      document.body.replaceChildren(plate);
      document.documentElement.style.cssText = 'background:transparent!important';
      document.body.style.cssText = 'margin:0;background:transparent!important';
      await photo.decode();
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (getComputedStyle(plate).filter !== contract.filter) {
         throw new Error('Capture filter differs from the original core.');
      }
      return { ...contract, captureWidth: width, captureHeight: height };
   });
   await page.setViewportSize({
      width: Math.ceil(contract.captureWidth),
      height: Math.ceil(contract.captureHeight),
   });
   const png = await page.screenshot({
      omitBackground: true,
      clip: { x: 0, y: 0, width: contract.captureWidth, height: contract.captureHeight },
   });
   const encoded = await sharp(png).webp({ quality: 95, alphaQuality: 100, effort: 6 }).toBuffer();
   const metadata = await sharp(encoded).metadata();
   if (!metadata.hasAlpha) throw new Error('Capture lost its transparent alpha.');
   await mkdir(dirname(output), { recursive: true });
   await writeFile(output, encoded);
   console.log(
      JSON.stringify(
         {
            output,
            ...contract,
            width: metadata.width,
            height: metadata.height,
            bytes: encoded.length,
            decodedBytes: metadata.width * metadata.height * 4,
         },
         null,
         2,
      ),
   );
   await writeDecoration();
} finally {
   await browser.close();
}
