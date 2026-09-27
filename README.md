# Kival Evan

Personal website built with Astro, Svelte, and SCSS. Astro writes the static site to `dist/`.

## Local development

Use Node.js 22.12 or newer. The GitHub Pages workflow uses Node.js 22.
Install dependencies with `npm ci`. Start the development server with `npm run dev`.
For a production preview, run these commands:

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

The preview serves `dist/` at `http://localhost:4173/`. After source changes, run `npm run build` again to update it.

`npm run check` checks Astro, TypeScript, and Svelte source files.
`npm run build` runs these checks before building the site.
TypeScript stays on version 6 because the Astro and Svelte checkers do not support version 7.

Use `npm run format` to format `src/`, or `npm run format:check` to check without changing files.
Prettier supports both Astro and Svelte components. The deployment workflow checks formatting before building.
The offline Deno utilities remain outside the website checks. They share browser-safe metadata types from `src/data/beatmap.ts`.

## Images

Use `Image` from `astro:assets` for content images in `.astro` files.
Import local images from `src/assets` so Astro can optimize them and provide their dimensions.
Keep CV images eager so printing does not depend on scrolling.
Use `widths` and `sizes` for responsive content screenshots without changing their CSS layout.
Keep `sizes` aligned with the displayed image width when changing a layout.

Native `<img>` elements remain intentional inside Svelte components and for the homepage's transparent picture fallback.
Astro components cannot render directly inside Svelte. The beatmap cover generator already resizes those images to 256 × 256 pixels.
Keep generated artwork and CSS masks unchanged unless their source artwork changes.

## Styles

Component and page styles use native scoped `<style lang="scss">` blocks inside their `.astro` or `.svelte` files.
The framework limits these styles to their component. Sass compiles them through Astro and Vite.
Use BEM-like names when they improve readability.

- Keep shared fonts, tokens, and base styles in `src/styles/global.scss`.
- Keep element defaults in `src/styles/reset.scss`.
- Keep shared print primitives, cross-page themes, and controller-driven motion in external SCSS files under `src/styles/`.
- Keep component-specific styles beside their markup in the same file.
- Group BEM elements with `&__element` and modifiers with `&--modifier` under their block selector.
- Keep ordinary hyphenated names intact. Do not split `.example-style` into `.example { &-style {} }`.
- Keep nesting shallow, usually two or three selector levels. Nest states and pseudo-elements with their owning selector.
- Inside modifier rules, use full element class names for descendant selectors. Keep `&__element` directly under the block selector.
- Preserve selector specificity and rule order. Keep mixed-component groups and separate cascade overrides explicit when nesting would obscure their scope.

The named CSS layers run in this order: `reset`, `base`, `components`, and `layout`.
Component layout rules use `layout`. Existing unlayered print treatments keep precedence over those rules.
`Head.astro` declares the layer order before route styles load.

Use plain class names in markup. Preserve the semantic class hooks used by the print controllers and shared themes.
Inside scoped styles, use `:global(...)` only for selectors that must reach child components, injected content, or ancestor state.
Astro uses `scopedStyleStrategy: 'where'` to preserve authored selector specificity. Svelte adds its native scope class.
Use normal `<style lang="scss">` blocks, not `is:inline`, so Astro can process and optimize them.
Only the early layer declaration and generated artwork registration CSS use `is:inline`.

The root of `src/styles/` contains the imported entrypoints, shared themes, and route layouts.
Group repeated page or controller scopes once within each rule group. Keep responsive overrides in their existing cascade order.
The `motion/` directory contains authored keyframe partials. The `generated/` directory contains derived CSS, not editable sources.

## Generated artwork and motion

Edit homepage animation rules in `src/styles/home-motion.scss` and poses in `src/styles/motion/_home-keyframes.scss`.
The generator compiles the entrypoint and samples its poses into `src/styles/generated/home-motion-frames.css`.
Do not edit the generated stylesheet directly.
Interior animation rules stay in `src/styles/print-page-motion.scss`, with poses in `src/styles/motion/_print-keyframes.scss`.

The generator needs Playwright and a Chromium browser. With existing installations, supply their paths:

```sh
node scripts/generate-home-motion-frames.mjs \
  --playwright /absolute/path/to/playwright/index.mjs \
  --browser /absolute/path/to/chromium
```

To inspect generated output without replacing the served stylesheet, add `--output /absolute/path/to/preview.css`.

Other scripts in `scripts/` generate the ink and mobile artwork.
Keep the SVG masters and image quality unchanged during style cleanup.
See `DESIGN.md` for the visual and motion requirements.
