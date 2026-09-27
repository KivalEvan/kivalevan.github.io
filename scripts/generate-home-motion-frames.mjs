/**
 * Compile the editable home-motion.scss poses into a held-frame stylesheet.
 * Uses installed PostCSS and Playwright Chromium; no browser sampling runs on the site.
 * Run: node scripts/generate-home-motion-frames.mjs --playwright /path/to/playwright/index.mjs
 * Optional --browser selects an existing Chromium executable.
 * Optional --output writes a preview stylesheet without replacing the served file.
 * A rule's --home-motion-fps selects 4, 6, 8, 12, or 24 held poses per second.
 * Unmarked rules keep 24 FPS; delays stay on the shared 24-frame timeline.
 * Static mobile hero plates do not need regeneration after timing-only edits.
 */
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import postcss from 'postcss';
import prettier from 'prettier';
import { compile } from 'sass';

const { values } = parseArgs({
   options: {
      playwright: { type: 'string' },
      browser: { type: 'string' },
      output: { type: 'string' },
   },
});
const source = new URL('../src/styles/home-motion.scss', import.meta.url);
const output = values.output
   ? pathToFileURL(resolve(values.output))
   : new URL('../src/styles/generated/home-motion-frames.css', import.meta.url);
const css = postcss.parse(compile(source.pathname).css);
const masters = new Map();
css.walkAtRules('keyframes', (rule) => {
   masters.set(rule.params, rule.toString());
   rule.remove();
});
const variables = css.nodes.find((rule) => rule.selector === ':root').toString();
const roundedTime = (milliseconds, fps) => (Math.round((milliseconds * fps) / 1_000) * 1_000) / fps;
const milliseconds = (value) => parseFloat(value) * (value.endsWith('ms') ? 1 : 1_000);
const recipes = new Map();
const { chromium } = await import(
   values.playwright ? pathToFileURL(resolve(values.playwright)).href : 'playwright'
);
const browser = await chromium.launch({
   executablePath: values.browser,
   args: ['--disable-dev-shm-usage'],
});
try {
   const page = await browser.newPage();
   await page.setContent(
      `<style>${variables}${[...masters.values()].join('\n')}</style><div></div>`,
   );
   const rules = [];
   css.walkRules((rule) => rules.push(rule));
   for (const rule of rules) {
      const declarations = rule.nodes.filter((node) => node.type === 'decl');
      if (!declarations.some((node) => node.prop.startsWith('animation'))) continue;
      const timing = await page.evaluate(
         (declarations) => {
            const node = document.querySelector('div');
            node.removeAttribute('style');
            for (const { prop, value } of declarations) node.style.setProperty(prop, value);
            const style = getComputedStyle(node);
            return {
               names: style.animationName.split(',').map((v) => v.trim()),
               durations: style.animationDuration.split(',').map((v) => v.trim()),
               delays: style.animationDelay.split(',').map((v) => v.trim()),
               // Easing lists may contain commas inside their functions.
               easings: style.animationTimingFunction.match(
                  /(?:steps|cubic-bezier|linear)\([^)]*\)|[\w-]+/g,
               ),
            };
         },
         declarations.map(({ prop, value }) => ({ prop, value })),
      );
      const hasAnimation = declarations.some((node) =>
         ['animation', 'animation-name'].includes(node.prop),
      );
      if (hasAnimation && timing.names.some((name) => name !== 'none')) {
         const names = [],
            durations = [],
            delays = [];
         for (const [index, name] of timing.names.entries()) {
            if (!masters.has(name)) throw Error(`Missing source keyframes: ${name}`);
            const duration = milliseconds(timing.durations[index % timing.durations.length]);
            if (!duration) throw Error(`Specify a duration beside ${name} in the source rule.`);
            const fps = Number(
               declarations.find((declaration) => declaration.prop === '--home-motion-fps')
                  ?.value ?? 24,
            );
            if (![4, 6, 8, 12, 24].includes(fps))
               throw Error(`Unsupported --home-motion-fps ${fps} in ${rule.selector}`);
            const frames = Math.max(1, Math.round((duration * fps) / 1_000));
            const generatedName = `${name}--${fps}fps-${frames}f`;
            const authoredEasing = timing.easings[index % timing.easings.length];
            // Sample the contour path, not the old segment-dependent step clock.
            // The generated stylesheet supplies the only playback steps.
            const easing = authoredEasing.startsWith('steps(') ? 'linear' : authoredEasing;
            const recipe = { name, duration, fps, frames, easing, generatedName };
            const previous = recipes.get(generatedName);
            if (previous && (previous.duration !== duration || previous.easing !== easing))
               throw Error(`Conflicting pose recipes for ${generatedName}`);
            recipes.set(generatedName, recipe);
            names.push(generatedName);
            durations.push(`${(frames * 1_000) / fps}ms`);
            delays.push(
               `${roundedTime(milliseconds(timing.delays[index % timing.delays.length]), 24)}ms`,
            );
         }
         // Keep fill, pause and other authored settings from the shorthand.
         rule.append({ prop: 'animation-name', value: names.join(', ') });
         rule.append({ prop: 'animation-duration', value: durations.join(', ') });
         rule.append({ prop: 'animation-timing-function', value: 'steps(1, end)' });
         if (declarations.some((node) => ['animation', 'animation-delay'].includes(node.prop)))
            rule.append({ prop: 'animation-delay', value: delays.join(', ') });
      } else {
         for (const declaration of declarations.filter((node) => node.prop === 'animation-delay')) {
            declaration.value = timing.delays
               .map((delay) => `${roundedTime(milliseconds(delay), 24)}ms`)
               .join(', ');
         }
      }
   }
   for (const recipe of recipes.values()) {
      const frames = await page.evaluate(({ name, duration, frames, easing }) => {
         const node = document.createElement('div');
         document.querySelector('div').replaceWith(node);
         node.style.cssText = `animation: ${name} ${duration}ms ${easing} both paused;`;
         const animation = node.getAnimations()[0];
         if (!animation)
            throw Error(
               `No sampled animation: ${name} ${duration}ms ${easing}; parsed: ${node.style.animation}`,
            );
         const properties = [
            ...new Set(
               animation.effect
                  .getKeyframes()
                  .flatMap((frame) =>
                     Object.keys(frame).filter(
                        (key) => !['offset', 'computedOffset', 'easing', 'composite'].includes(key),
                     ),
                  ),
            ),
         ];
         const samples = [];
         for (let index = 0; index <= frames; index++) {
            animation.currentTime = (index * duration) / frames;
            const style = getComputedStyle(node);
            const values = Object.fromEntries(
               properties.map((property) => [
                  property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
                  style[property],
               ]),
            );
            // This rule's target supplies its final opacity; sample its unit multiplier.
            if (name === 'home-registration-snap')
               values.opacity = `calc(${values.opacity} * var(--home-motion-final-opacity, 1))`;
            samples.push({ offset: (index * 100) / frames, values });
         }
         animation.cancel();
         return samples;
      }, recipe);
      const keyframes = postcss.atRule({ name: 'keyframes', params: recipe.generatedName });
      for (const { offset, values } of frames) {
         const frame = postcss.rule({ selector: `${offset}%` });
         for (const [prop, value] of Object.entries(values)) frame.append({ prop, value });
         keyframes.append(frame);
      }
      css.append(keyframes);
   }
   css.prepend(
      postcss.comment({
         text: 'Generated by scripts/generate-home-motion-frames.mjs. Edit home-motion.scss, then regenerate. Every interval holds one pose; never interpolate these keyframes.',
      }),
   );
   const formatting = await prettier.resolveConfig(source.pathname);
   await writeFile(output, await prettier.format(css.toString(), { ...formatting, parser: 'css' }));
   const frameRates = [...new Set([...recipes.values()].map((recipe) => recipe.fps))].sort(
      (a, b) => a - b,
   );
   console.log(`Generated ${recipes.size} held-frame animations at ${frameRates.join('/')} FPS.`);
} finally {
   await browser.close();
}
