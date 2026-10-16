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
The offline Deno utilities in `scripts/beatmap/` remain outside the website checks.
They share browser-safe metadata types from `src/data/beatmap.ts`.

## Source organization

- `src/pages/` defines routes and page content.
- `src/layouts/` defines document and page markup. Initial motion preparation stays inline so content remains available if scripts fail.
- `src/components/` contains reusable markup, Svelte controls, and their scoped styles.
- `src/scripts/` owns browser behavior. `site-navigation.ts` coordinates route transitions, while separate controllers own title, artwork, and control motion.
- `src/data/` contains content, shared types, and the commission estimate calculation. Components display the calculation without owning pricing rules.
- `src/utils/` contains shared website helpers. `scripts/` contains offline generators, not browser code.

Internal page links end with `/`, matching the folders served by GitHub Pages. This avoids a redirect before navigation loads the destination.
File URLs and local section links keep their existing form. Canonical URLs remain unchanged.

## Beatmap metadata

Install Deno 2 and the `mediainfo` command before using the generator.
Pass a directory containing map folders whose names start with their hexadecimal BeatSaver IDs.
Each map needs its `Info.dat` or `info.dat`, referenced difficulty files, audio, and cover image.

```sh
npm run beatmap -- --input "/path/to/map-library"
```

The command replaces `src/data/beatmap.json` and generated covers under `public/assets/img/cover/` in this repository.
To inspect output separately, add `--output /path/to/disposable-output`.
The generator reads all maps before writing output. Invalid input stops generation instead of publishing incomplete metadata.
Filesystem failures during output writes can still leave partial output.

Use `npm run beatmap -- --help` for arguments.
To check the Deno source without generating files, run `deno check --no-lock scripts/beatmap/generate.ts`.

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
Their organic coverage cuts are generated separately:

```sh
node scripts/generate-print-coverage.mjs
```

This command writes `src/styles/generated/_print-coverage.scss` from a seeded density field.
The cuts reveal stationary artwork and erase the outgoing page without replacing its material masks or loading extra images.
Edit the generator, not its generated partial. Changes to these cuts do not require new mobile artwork images.

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
