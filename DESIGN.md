---
version: alpha
name: Kival Evan
description: A bold, playful, independent screen-print workshop for software, Beat Saber, and personal work.
colors:
   ink-black: '#030305'
   paper-white: '#f4f3ef'
   ash-grey: '#a5a5a2'
   signal-red: '#ff173c'
   signal-cyan: '#00b9d6'
   ink-cobalt: '#008cbb'
   deep-blue: '#021522'
   ink-petrol: '#07516b'
   smoked-panel: 'rgb(3 3 5 / 86%)'
   white: '#fff'
   control-charcoal: '#333'
   control-blue: '#6883ad'
   control-blue-dark: '#29466b'
   control-surface: '#0b1429'
   control-paper: '#ecebe6'
   control-error: '#ed1738'
   cv-paper: '#f5f5f5'
   cv-ink: '#111'
   cv-accent: '#b74242'
   cv-muted: '#ccc'
typography:
   wordmark:
      fontFamily: 'League Gothic, Big Shoulders Display, Arial Narrow, Helvetica Condensed, Franklin Gothic Condensed, Oswald, Noto Sans, system-ui, sans-serif'
      fontSize: 'clamp(5.4rem, 17.5vw, 14rem)'
      fontWeight: 400
      lineHeight: 0.78
      letterSpacing: '0.012em'
   navigation:
      fontFamily: 'Big Shoulders Display, Arial Narrow, Helvetica Condensed, Franklin Gothic Condensed, Oswald, Noto Sans, system-ui, sans-serif'
      fontSize: '1.25rem'
      fontWeight: 800
      lineHeight: 1
      letterSpacing: '0.04em'
   cv-display:
      fontFamily: 'Noto Sans, Gill Sans, Trebuchet MS, Geneva, Verdana, system-ui, sans-serif'
      fontSize: '2.5rem'
      fontWeight: 700
      lineHeight: 1.25
   section-heading-low:
      fontFamily: 'Big Shoulders Display, Arial Narrow, Helvetica Condensed, Franklin Gothic Condensed, Oswald, Noto Sans, system-ui, sans-serif'
      fontSize: 'clamp(2.2rem, 5vw, 4rem)'
      fontWeight: 800
      lineHeight: 0.9
      letterSpacing: '0.01em'
   section-heading:
      fontFamily: 'Big Shoulders Display, Arial Narrow, Helvetica Condensed, Franklin Gothic Condensed, Oswald, Noto Sans, system-ui, sans-serif'
      fontSize: 'clamp(2.5rem, 6vw, 4.8rem)'
      fontWeight: 800
      lineHeight: 0.9
      letterSpacing: '0.01em'
   field-label:
      fontFamily: 'Big Shoulders Display, Arial Narrow, sans-serif'
      fontSize: '1.5rem'
      fontWeight: 800
      lineHeight: 1
      letterSpacing: '0.01em'
   body:
      fontFamily: 'Noto Sans, Gill Sans, Trebuchet MS, Geneva, Verdana, system-ui, sans-serif'
      fontSize: '1rem'
      fontWeight: 400
      lineHeight: 1.6
   inventory-label:
      fontFamily: 'Space Mono, ui-monospace, Cascadia Mono, JetBrains Mono, Menlo, Consolas, Courier New, monospace'
      fontSize: '0.86rem'
      fontWeight: 700
      lineHeight: 1.3
   cv-tag:
      fontFamily: 'Noto Sans, Gill Sans, Trebuchet MS, Geneva, Verdana, system-ui, sans-serif'
      fontSize: '0.875rem'
      fontWeight: 400
      lineHeight: '1.25rem'
rounded:
   sharp: '0px'
   cv-tag: '0.25rem'
   cv-image: '0.5rem'
   full: '9999px'
spacing:
   micro: '0.25rem'
   compact: '0.5rem'
   gutter: '0.75rem'
   base: '1rem'
   section: '2rem'
components:
   navigation-link:
      backgroundColor: transparent
      textColor: '{colors.paper-white}'
      rounded: '{rounded.sharp}'
      padding: '0.55rem 0.8rem 0.7rem'
      typography: '{typography.navigation}'
   navigation-link-active:
      backgroundColor: '{colors.paper-white}'
      textColor: '{colors.ink-black}'
   print-action:
      backgroundColor: '{colors.paper-white}'
      textColor: '{colors.ink-black}'
      rounded: '{rounded.sharp}'
      padding: '0.5rem 0.9rem'
   print-action-hover:
      backgroundColor: '{colors.ink-petrol}'
      textColor: '{colors.paper-white}'
   print-action-on-paper:
      backgroundColor: '{colors.ink-black}'
      textColor: '{colors.paper-white}'
   inventory-paper-label:
      backgroundColor: '{colors.paper-white}'
      textColor: '{colors.ink-black}'
      padding: '0.2rem 0.54rem'
      typography: '{typography.inventory-label}'
   text-input:
      backgroundColor: '{colors.control-surface}'
      textColor: '{colors.control-paper}'
      rounded: '{rounded.sharp}'
      padding: '0.5rem 0.75rem'
      height: '44px'
   back-to-top:
      backgroundColor: '{colors.control-charcoal}'
      textColor: '{colors.white}'
      rounded: '{rounded.full}'
      size: '46px'
   back-to-top-desktop:
      size: '48px'
   cv-skill-tag:
      backgroundColor: '#ffffff80'
      textColor: '{colors.cv-ink}'
      rounded: '{rounded.cv-tag}'
      padding: '0.125rem 0.5rem'
      typography: '{typography.cv-tag}'
---

# Design System: Kival Evan

## Overview

**Creative North Star: "The Screen-Print Workshop"**

The site is bold, playful, and independent. Portrait art, torn paper, and red/cyan ink frame software, Beat Saber maps, writing, and personal interests.
The artwork carries the expression. Reading areas and task controls stay calm enough to use.

Depth comes from layered print on flat surfaces. Playful edges pair with precise behavior: readable labels, predictable controls, visible focus, and recoverable errors.
The standalone CV keeps its quieter professional design. The site does not adopt generic corporate portfolio styling.

**Key Characteristics:**

- Flat near-black canvases with white paper and saturated registration inks.
- A single-line League Gothic wordmark within the portrait composition.
- Condensed display headings and navigation, mono inventories, and neutral reading text.
- Torn paper actions, static inventory slips, and opaque reading pockets.
- Held print poses, randomized title letters, and stationary artwork.
- A separate light CV with an A4 print layout.

This document records implemented patterns and established visual contracts, not a new design proposal.
The frontmatter holds reusable values. `.impeccable/design.json` adds motion, breakpoints, narrative, and representative component previews.
Preview tonal ramps are derived illustrations, not additional production colors. Complex artwork remains authoritative in its source components and assets.

### Style ownership

Use native scoped `<style lang="scss">` blocks inside Astro and Svelte files for component and page styles.
Use BEM-like names when they improve readability. Nest `&__element` and `&--modifier` under their block, but keep ordinary hyphenated names intact.
Keep nesting shallow, usually two or three selector levels. Preserve selector specificity, rule order, and explicit cross-component scope.
Keep reset rules, tokens, shared print primitives, cross-page theme rules, and controller-driven motion global.
Preserve the semantic class hooks used by the print controllers. Use selective `:global(...)` boundaries for child components and runtime content.
Astro scopes styles with `:where` so that component isolation does not increase selector specificity.
Svelte uses its own scope classes. The CSS layers run in this order: `reset`, `base`, `components`, and `layout`.
Existing unlayered print styles override those layers. Read the effective cascade before extracting a component rule.
Shared stylesheet entrypoints keep page and controller scopes grouped without changing cascade order.
The `src/styles/motion/` partials contain authored keyframes. The `src/styles/generated/` directory contains generated CSS and is not an editing source.

### Current homepage direction

The homepage is a personal screen-print poster, not a dashboard or a collection of cards.
The homepage establishes the print materials used across the site. The standalone CV keeps its separate professional design.

- League Gothic 400 carries the single-line hero wordmark. Its authored glyph spacing, damage, outlines, and crimson Vs remain fixed.
- The portrait, fractured white ink, and protected biography area form the primary composition.
- The outer hero canvas fills the viewport. A centered inner container positions the artwork without clipping its decorative overflow.
- Featured Video, Skills, and Hardware use centered content blocks with left-aligned text.
- Hero paper uses broken splatter masks rather than broad pale sheets or parallel brush strokes. Saturated red and cyan deposits contrast with the black canvas.
- Reading surfaces keep solid paper silhouettes. Ink damage stays outside the text.
- Social and support controls use icon stamps, paper fields, and hover/focus responses without decorative underlines. Static skill labels remain non-interactive.
- The hero is the visual peak. Hardware remains quieter, and the footer acts as a subdued closing signature.

### Below the hero

The lower homepage carries the hero's fractured red, cyan, white, and black print language without repeating the portrait composition. Artwork stays anchored; changing coverage supplies the entrance, not decorative translation, rotation, or idle drift.

- Featured video keeps a level, rectangular 16:9 player. Broken paper splatter, a red deposit, cyan tangles, and thin red filaments concentrate at its perimeter. The caption is a separate solid paper slip with clean text. The video title comes before its category, and a persistent YouTube link provides an alternative when the embed cannot play.
- Skills separates Languages, Technologies, and Topics into readable inventories. Languages and Technologies share an asymmetric desktop row; Topics spans beneath them. Phones use one column. TypeScript, Unity, and Virtual Reality retain display emphasis, not proficiency scores. Labels remain non-interactive.
- Hardware uses four factual lists, printed paper category tabs, and restrained red/cyan edge marks. There are no enclosing cards or textures over the equipment names.
- The shared footer ends with an outlined proof mark and smaller cyan/red remnants. Social, support, and clipboard controls keep their established behavior. The CV remains separate.

The scoped styles in `src/pages/index.astro` own these lower-homepage refinements. Existing source artwork remains shared. This treatment does not change the hero or require new hero image bakes.
The three section headings pair solid and outlined type. Their characters resolve in fixed word slots at 12 FPS over 750ms, using the shared title resolver; the heading name and authored line breaks remain intact. Only these main headings resolve, not labels or equipment names.
The featured surround prints in place at 6 FPS for paper and 12 FPS for ink, finishing within 709ms. The video and caption do not move or get clipped. Skills print in three overlapping batches at 12 FPS and settle within 417ms; hardware lists reveal in place over 333ms. The footer proof and ink finish within 667ms. There is no lower-page ambient ink drift, changing strip field, or rotating inventory text.
Existing viewport observation, focus cancellation, reduced-motion support, and route disposal remain in control. Hidden tabs finalize active entrances. Default and no-JavaScript content stays visible.

### Palette scope

The reference artwork guides the print palette: near-black, sharp white, saturated red, and cyan-blue.
The frontmatter records the effective homepage and interior palette from `src/styles/home-background.scss`.
Those body-level values override the older root defaults in `src/styles/global.scss`. Do not replace the visible palette with the root defaults.
The title retains its darker blues `#365b7d` and `#1f3c58` for separation from the brighter artwork.
Dense color belongs to the artwork, not the reading columns. Header and footer controls retain their quieter blue details.
The standalone CV keeps its separate professional palette.

### Artwork sources and generated images

Keep original SVG artwork as the editable source. Baked images and atlases are generated outputs, not replacements for the source files. Change the source artwork first, then regenerate its outputs.
Each bake must preserve transparent boundaries, crop registration, paint order, and the existing layout. Keep text, video, and interactive controls live. Rendering changes must not silently alter entrance timing or transition behavior.
Use Astro `Image` for static content images. Project screenshots and CV previews use responsive width variants without changing their CSS geometry.
Preserve intrinsic dimensions, aspect ratios, alternative text, and the complete screenshot frame. Keep CV images eager for printing.
Native images remain intentional for Svelte beatmap covers and the transparent mobile-artwork fallback. See `README.md` for image and generator workflows.
Use atlases for compatible small impressions with sampling gutters and region metadata. Keep large compositions and portrait images separate where an atlas would force unrelated images into decoded memory. Compare decoded memory and transfer size separately.
The mobile hero uses complete transparent decorative planes from `scripts/generate-mobile-hero-planes.mjs`. Four final images preserve the back, middle, foreground-paper, and foreground-vein order around live content.
Hero planes and interior collision images are captured at 3× density and encoded as lossless WebP, preserving fine alpha edges and saturated red/cyan detail on high-density screens. Crops use image pixels; hero placement metadata converts back to CSS pixels so export density cannot move or enlarge the artwork. Partial hero bakes must match the manifest's `rasterScale`.
The shared `print-splatter-field.svg` and red/cyan `liquid-pool-*.svg` are generated offline from seeded liquid-density fields. Overlapping paint packets merge into uneven pools. Curved, tapering jets break into stretched heads, smaller beads, and fine satellite spray along the same trajectories. Fine atomized droplets, porous paint loss, and three scales of boundary noise make the existing splashes gritty rather than smooth. Detail uses a separate seeded random stream so texture changes do not relocate the main pools or jets. The field is sampled six times per source unit before marching squares traces it into static vector contours; no particles, solver, or noise filters run in the browser. Texture stays within the existing artwork: no repeating edge fields or extra page-wide splashes.
Regenerate these three masters with `node scripts/generate-liquid-splatter.mjs`, then regenerate hero planes and interior collision images. Desktop keeps the scalable contours. High-density images increase mobile transfer size and decoded memory; each viewport still paints only four hero plates or one interior plate. Interior font swaps can request an adjacent ratio before the layout settles.
The images contain the material masks and texture. CSS reveals their stationary containers through held coverage cuts, not replacement images or animated transforms.
`LiquidInk` paints the red and blue vector contours as shared external CSS masks, inheriting each layer's ink color. Do not embed these large path strings in page HTML. Repeated impressions reuse the same cached SVG; mobile hero sources stay hidden and use their existing baked plates. Desktop hero readiness decodes the selected contours within the same entrance budget. This changes delivery, not contour geometry, image quality, or motion timing.
Do not reapply the baked material masks. Hero background geometry remains fixed during both entrance and idle; there is no ambient ink offset on desktop or mobile.
The hero starts as soon as its first decoded pose has painted, without an extra opening hold. The artwork assembles over 750ms while text and links arrive earlier, rather than waiting for a staggered sequence.
The portrait stays stationary while disconnected torn patches reveal it at 8 FPS. Six held poses expand separate fragments into the complete cutout by 625ms. It has no horizontal slit, rotation, or translation.
Title letters assemble in uneven, overlapping groups on a 12 FPS grid. Per-letter start offsets range from 0 to 250ms, with held beats between jumps rather than every letter changing together.
Each scheduled jump chooses a fresh position inside shrinking bounds and a temporary character or rough ink block, slash, or chip. Fixed-slot, hidden-from-accessibility overlays preserve the original text and layout. The authored letters return as each lands, between roughly 417ms and 667ms; all finish within the existing 750ms hero sequence. Every entrance gets new positions and faces, without entrance rotation.
Only the scattered title letters change position. Their offsets use font-relative units, and the edge letters scatter inward. Paper and ink appear in uneven, disconnected patches at different cadences. Their position, angle, and scale stay fixed.
Each paper and ink reveal pose retains the previous pose's coverage, including its detached patches. Later cuts must not hide already-revealed splatter before exposing it again. This applies to both the desktop layers and the static mobile planes, which share the same reveal masters.
The biography starts within 83.33ms and the social links enter together at 125ms. There is no trailing item-by-item stagger, opacity pulsing, or full-screen flashing.
Hero layers use independent pose rates without visible interpolation:

- Portrait: 8 FPS, with 125ms holds
- Paper and cutouts: 6 FPS, with 166.67ms holds
- Ink and lettering: 12 FPS, with 83.33ms holds.

These rates describe artwork poses, not the browser refresh rate. Scrolling and pointer movement remain independent. Controls retain their 24 FPS timing; page exits use the matching paper/ink cadence described below.
The portrait reveal lasts 750ms on desktop and mobile and supplies the hero cleanup event. Paper and ink run for 666.67ms; the cyan layer starts 41.67ms later. All letters land before portrait cleanup. Title-only idle registrations remain active even though background targets are empty: subtle random title offsets resume after entrance, with occasional brief character glitches. They pause offscreen or in hidden tabs and respect reduced motion.
A decorative paper tape cutout uses hatch marks. It stays live on phones and fixed throughout the entrance. Dithered paper stamps are not part of the collage; the fractured white splatter provides the lighter artwork instead.
The reference is Spider-Punk's mixed-rate collage motion, described by animation lead Alan Hawkins in [this interview](https://beforesandafters.com/2023/06/17/the-across-the-spider-verse-spider-punk-character-hobie-was-animated-with-different-frame-rates-for-different-parts-of-his-own-body-and-accessories/).
The site uses its own portrait and artwork, not film assets.
`home-motion.scss` contains the homepage animation rules and loads the editable poses from `motion/_home-keyframes.scss`.
`scripts/generate-home-motion-frames.mjs` compiles the entrypoint, then samples it into `generated/home-motion-frames.css` before deployment.
Interior rules in `print-page-motion.scss` load their poses from `motion/_print-keyframes.scss`.
Their organic coverage comes from `scripts/generate-print-coverage.mjs`, which writes `generated/_print-coverage.scss`.
The generator traces seven nested cuts from one seeded density field, with unequal pools, broken bridges, and detached fragments.
Curved CSS contours supply the cuts. Older browsers use detailed polygons from the same contours, not geometric replacement shapes.
Only coverage changes. The cuts do not replace existing material masks, move the artwork, or request new images.
Regenerate these cuts with `node scripts/generate-print-coverage.mjs` after changing their generator.
Regenerate `home-motion-frames.css` after homepage motion edits. Timing-only edits do not require new mobile images.
Each animation rule can set `--home-motion-fps` to 4, 6, 8, 12, or 24. Unmarked rules use 24 FPS.
The generator samples each layer at its selected rate. Start delays remain on the shared 24-frame timeline, so layers can begin on different beats.
Before starting the hero entrance, decode the selected image states and portrait, then wait for the outgoing page to finish erasing to black. Give the first paused pose a paint opportunity, then start the layer clocks together. Readiness has a 1,200ms budget and respects bootstrap expiry; failures expose static content without a late replay. Keep unselected registrations hidden in inline styles during route stylesheet replacement, and serve plate images externally rather than embedding them in page HTML.
Regenerate mobile planes after artwork, palette, or geometry changes. Source SVG viewports remain because other artwork references their fragment IDs.
Phones suppress source paint and material effects. Desktop retains the live artwork. Each viewport loads four final images instead of a frame sequence.

From the repository root, regenerate motion with the existing Playwright installation:

```sh
node scripts/generate-home-motion-frames.mjs --playwright /path/to/playwright/index.mjs --browser /path/to/chromium
```

If the artwork changes, start the local development server and regenerate its mobile planes:

```sh
npm run dev -- --host 127.0.0.1 --port 4321
node scripts/generate-mobile-hero-planes.mjs --playwright /path/to/playwright/index.mjs --browser /path/to/chromium --url http://127.0.0.1:4321
```

### Interior pages

Projects, Blog, Commissions, and the 404 page share the homepage's red, cyan-blue, white paper, and rough ink.
Splatter stays near headings and artwork. Article text, pricing, and estimator controls retain clear reading surfaces.
Interior openings use full-width fractured fields of red, cyan, and broken white ink, without a dithered paper stamp. These replace the broad white sheets and muted blue pools.
Projects, the Blog index, and commission openings protect their copy with opaque black reading pockets. Large artwork remains visible between the pockets and around the screenshots.
Article headers, the estimator, and the 404 page retain smaller paper surfaces, surrounded by the same fractured artwork. Article paragraphs and calculator controls remain clear.
The shared decorative `InkCollision` uses seven layered impressions, broken splatter, and filaments. Its component adds no scripts. The interior motion controller reveals its stationary layers.
Opening artwork stays inside the main content boundary, away from navigation and footer controls. It ends before the next reading section.
The shared head preloads the small Big Shoulders Display WOFF2 on styled pages, excluding the CV. Loading the heading font early reduces font-swap layout changes and avoids speculative mobile collision variants when the final font is ready for the first layout. Container queries still select the correct artwork if a slow or failed font request changes the layout later.
On phones with size-container query support, one transparent colored image replaces its seven live impressions. Twelve generated aspect-ratio variants preserve the composition across tall and wide containers; only one is displayed at a time. Font or layout changes can request additional variants. Regenerate with `scripts/generate-mobile-collision-groups.mjs` after changing the component or SVG masters. Desktop and unsupported browsers retain the original layers.
Keep the strongest marks at paper and image edges. Avoid clean stripe patterns, repeated splatter stamps, and texture across reading columns.
Big Shoulders Display carries headings and control labels. Major titles pair solid type with an outlined final word. Single-word interior titles use an outline.
Long-form text keeps its reading font and comfortable measure. Project screenshots stay complete and level. Pricing category tabs repeat the homepage hardware treatment.
Prominent actions use torn paper backgrounds, whole-control scaling, and visible keyboard focus without decorative broken underlines.
New shared styles are scoped to `body.print-page`. They do not apply to the homepage or CV.
Interior artwork prepares before paint, then reveals once through separate, stationary patches. Paper impressions use 6 FPS and ink uses 12 FPS over 666.67ms.
On phones, an entering group decodes its CSS-selected collision image before its decorative reveal, within a 1,200ms budget.
Text and controls remain available during that wait. Timeout or failure exposes static artwork without a late replay.
Unselected variants and offscreen groups do not receive readiness requests. Resize, focus, hidden tabs, reduced motion, and navigation cancel pending readiness.
The cyan collision layers start 83.33ms later. The service photograph uses four held poses at 8 FPS over 500ms. No entrance changes position or rotation.
Copy-safe paper, prose, screenshots, prices, and form controls remain visible throughout. Only decorative layers receive coverage cuts.
Content already exposed by the 1.5-second fail-open timeout must never be hidden again by a late module.
Startup timers and temporary focus listeners are removed on navigation. A failed module still exposes static content after the timeout.
Visible material groups start together, with separate clocks for their layers. Reading content stays still during and after entry.
Interior opening and section titles resolve once when at least 15% of the heading enters view. On client navigation, they wait until the outgoing page finishes erasing, so their full assembly remains visible.
Character substitutions follow the homepage's 12 FPS frame grid and settle within 750ms. Missed frames do not replay overdue substitutions. Measured inline letter slots keep each replacement in its own line box, without a separately positioned title copy.
The live letter text inherits the authored font, weight, color, and shadow; it does not use a separately styled pseudo-element.
The heading name stays accessible, and cleanup restores its original text nodes. Body prose, form labels, the navigation wordmark, and the CV are excluded.
The resolve restores the authored title on completion, resize, focus, hidden tabs, reduced motion, or route disposal. Late modules never scramble already-exposed titles.
Nested sections do not double-animate. Text, forms, and paper panels are not clipped during entrance.
Interior headings and artwork remain still after entry. The homepage hero keeps its separate title-only idle animation.
Astro navigation between styled pages, including the homepage, erases the live outgoing page to black over 416.67ms.
Irregular ink contours break the page into shrinking pools and fragments on the existing 12 FPS grid, without interpolation.
Coverage only decreases. Neither the artwork nor the contours translate or scale, and erased fragments do not return.
Capture the visible viewport's height and position relative to the outgoing main element once at exit.
This keeps cuts from stretching into bands on long or scrolled pages. Clear those coordinates on completion or cancellation.
The final 83.33ms is a black beat. Load the destination first, then erase the original page before the DOM swap.
Native snapshots remain hidden, so visible artwork never switches to a captured image with a different raster scale or position.
The incoming page stays hidden throughout, with no crossfade or old/new overlap.
History scroll restoration is instant during Astro navigation. Ordinary in-page scrolling retains its existing behavior.
Navigation stays anchored, and the header wordmark swaps without extending the black interval.
Interior assembly and title resolution begin after the outgoing page reaches black. The homepage keeps its full randomized entrance; navigation involving the CV remains plain. Slow requests leave the old page usable. A request that takes more than 200ms shows a small “Loading page…” status without blocking controls. Static red and cyan splatter surrounds its solid dark reading pocket. Its small contour is inlined in the stylesheet, so loading feedback needs no extra image request. Loading status clears on completion, failure, or cancellation. Superseded navigation cancels the live erase and restores that page; reduced motion and hidden tabs also cancel the exit wait. Skipped native transitions release motion waits, with navigation generations preventing stale cleanup from affecting a newer route. Reduced motion bypasses the erase and black beat.
Returning home prepares the incoming hero before Astro swaps documents, so reused scripts do not bypass its authored entrance. The preparation retains a 1.5-second fail-open timeout.
Reduced motion, hidden tabs, offscreen targets, and route disposal restore the authored poses. Homepage motion and the professional CV remain separate.

The Projects openings connect the title, dark reading pockets, and screenshots with broken white, red, and cyan impressions.
The main Projects page presents individual software projects, with Map Check as the lead and ChroMapper and Editor Enhanced below it.
Each entry identifies the author's role, purpose, technologies, and direct project links. BSMap, mapping work, and the archive use compact sections.
The Beat Saber detail route remains available for deeper descriptions and usage permissions.
The paper contour adapts to tall mobile layouts without shrinking into a narrow horizontal band.
Screenshots retain their complete 16:9 frames and sit above decorative ink edges. The archive and tool details remain quieter.

The Blog index places its outlined heading above a dark latest-post pocket, without a tagline. Earlier posts remain a quiet list.
Article headers use the same paper material without placing splatter behind paragraphs.
Blog metadata stays with its article title. Inline article links use ordinary underlines, while printed action controls remain free of decorative underlines.
Preserve authored article content and structure during design changes. Each article ends with a Back to blog action.
The commission overview leads with dark reading pockets and surrounding print fragments, without a header photograph. The Beat Saber detail page retains its service photograph.
Proof uses an editorial list, and prices use flat ruled columns.
The estimator keeps native form controls and a restrained paper introduction. The 404 artwork and return action share one paper composition.

The 404 character image repeats its original one-second sketch animation with `step-start` rotation and small offsets.
Only the image moves. Reduced motion keeps it static, and the loop pauses offscreen or in hidden tabs.
Keep the short return label, “take me home.”
Paper masks belong on background layers, not interactive containers. Text and keyboard focus must remain outside the masks.
Dark controls on paper invert the usual paper-on-ink treatment while retaining the same scale and torn-edge interaction.

Existing cutout labels share a randomized resting paper outline across all styled pages: navigation, social and support stamps, printed actions, skill slips, hardware and commission-rate tabs, and the featured caption. Each element receives its own cut when its page is prepared and keeps it for that DOM lifetime. Static labels do not animate. Edge damage is bounded by both percentage and type size, protecting long and wrapped text without changing layout. Interactive hover/focus and idle poses retain their separate overrides; their cleanup restores the resting cut. Authored CSS outlines remain the no-JavaScript fallback. Large reading sheets, artwork, colors, and the standalone CV are unchanged.

## Colors

The palette combines near-black ink, white paper, ash grey, and saturated registration colors.
The print pages use the shared palette defined in Palette scope. The CV retains its existing palette.

### Primary

- Ink Black: The stable page canvas, erasure color, and dark ground beneath the printed layers.
- Signal Red: The bright registration ink and active print accent. Form errors retain their separate Control Error value.

### Secondary

- Signal Cyan: The offset registration ink and print-page link color. It is not a universal focus color.
- Ink Cobalt: The stronger blue within the shared artwork.
- Deep Blue: The blue-black ink in artwork and inventory slips.

### Tertiary

- Ink Petrol: The dark blue ink in decorative details and active printed actions.
- Control Blue and Control Blue Dark: The quieter header, field, divider, and selected-row colors.

### Neutral

- Paper White: Primary text, printed plates, borders, and readable hero type.
- Ash Grey: Secondary text and quiet supporting controls.
- Smoked Panel: The existing translucent utility surface, not the default for project or reading sections.
- White and Control Charcoal: The ring and disc of the back-to-top control.
- Control Surface and Control Paper: The calculator's dark field and softer text.

### CV Document Palette

- CV Paper: The screen and print canvas for the standalone CV.
- CV Ink: Primary text, focus outlines, and the dark corner mark.
- CV Accent: The masthead, section icons, timelines, and rules.
- CV Muted: The portrait backing and skill-tag borders.

### Named Rules

**The Registration Color Rule.** Use red and cyan-blue as print plates, offsets, and interaction signals. Keep broad interface surfaces neutral.

**The Reading Pocket Rule.** Keep text on solid black or paper surfaces when artwork passes behind it. Concentrate damage around the edges.

**The Daylight Document Rule.** Keep the CV on its light print palette. Do not apply the poster collage to the CV.

## Typography

**Display Font:** Big Shoulders Display 800 with condensed system fallbacks

**Body Font:** Noto Sans with neutral system sans-serif fallbacks
**Label/Mono Font:** Space Mono 400/700 with ui-monospace fallbacks

**Character:** Tall condensed display type carries headings and navigation. Space Mono handles inventories and metadata. Neutral sans keeps body copy comfortable to read.

### Hierarchy

- Wordmark: League Gothic uses the frontmatter's wordmark role. The title stays on one line with its authored glyph treatments.
- Navigation: Big Shoulders Display carries uppercase labels. It reduces to `1.05rem` below `37.99rem`.
- Section headings: The shared medium and low roles use solid type with an outlined final word. Single-word interior titles are entirely outlined.
- Field labels: Condensed uppercase labels identify the calculator groups. They do not use the inventory font.
- Body: Neutral sans carries prose. The root size is `clamp(1rem, calc(0.9583rem + 0.2083vw), 1.125rem)`.
- Inventory labels: Space Mono carries static skill slips. Selected subjects have separate display emphasis, not proficiency scores.
- CV display and tags: Neutral sans keeps the document independent from the poster typography.

Below `48rem`, the hero wordmark uses `clamp(4.5rem, 24vw, 7rem)`.
Compact desktop landscapes use `clamp(8rem, 14vw, 11rem)` when width is at least `64rem` and height is at most `48rem`.
Below `40rem`, shared section headings use `clamp(2.25rem, 12vw, 3.4rem)` and the low variant uses `clamp(2rem, 10vw, 3rem)`.
Individual route openings can override these shared sizes. Do not force every title into one fixed scale.
League Gothic, Big Shoulders Display, and Space Mono use local WOFF2 files. Noto Sans is the first preference in the system body stack.

### Named Rules

**The Role Pairing Rule.** Keep League Gothic for the wordmark, Big Shoulders Display for headings and controls, Space Mono for inventories, and neutral sans for prose.

**The Readable Overlay Rule.** Use the established black text shadow when paper type sits over ink, media, or transparent panels.

**The Muted Text Surface Rule.** Ash-grey text may sit directly on the ink surface where contrast remains legible. Keep long-form body text on calmer surfaces for reading comfort, not ornament.

## Layout

The system uses one fluid column for the page shell and centered content regions for dense material. Apply `site-shell` to general page containers. It supplies a centered, full-width container with an `80rem` maximum width by default.

The homepage hero is an absolute poster stage, not a grid or a set of cards. Paper, portrait plates, title, biography, social links, and the work link form one collision. The right side keeps a readable negative-space field for the biography.

The homepage uses controlled ink density after the hero. Featured media has the strongest secondary composition. Skills reduce the density, Hardware stays quiet, and the footer closes with one exhausted print gesture.

Long-form articles use a readable inner measure near `72ch`. Mobile articles and documentation sections use the same site gutters as index pages.

The reading container uses `72ch`, with shared prose paragraphs limited to `68ch`. Short descriptions can use `65ch`.
Grids, media, and structured rate data can use the full page shell.

Apply `site-reading-width` to primary prose blocks inside a wide shell. It centers the readable column while keeping its text left-aligned.

Preserve each section's authored alignment. Centered containers do not imply centered body text or centered display headings.

The frontmatter records recurring compact spacing values, not a universal card-padding rule.
Dense utility pages commonly use `2rem` vertical padding. Homepage sections use wider gaps to separate changes in ink density.

Mobile layouts use one column. Below `48rem`, the poster keeps a cropped print field, a clear portrait, and an offset title. A compact social cluster follows the biography. Tablet layouts keep the poster tall and move the biography lower. Desktop layouts spread the portrait, title, and biography across one stage. Wide screens give the portrait and title more space. These hero compositions do not use the project-card or grid primitives below the hero.

At `48rem`, project layouts, the CV profile, and contextual back-to-top placement gain wider-screen arrangements.
The calculator stays in one column until `64rem`, then uses three columns. The beatmap list becomes two columns at `64rem`.

Dense commission tables and pricing groups use one column on phones, two columns on tablets, and three columns only at `64rem` or wider. Reference archives use separate routes.

Active commission pages use a task-first sequence: current status, core price, primary contact action, proof, supporting details, map showcase, and terms. Detailed rates and full terms remain visible. SlimeVR commissions are not part of the service catalog.

The Split Workbench uses `/project/beat_saber`. The `#software-tools` destination contains software projects and reusable mapping tools. The `#mapping-workshop` destination contains published maps, mapping utilities, scripts, plugins, and Beat Saber commission access.

Featured project sections use real interface screenshots as structural evidence. The portfolio index gives each selected project its own entry.
Map Check leads both project routes, with related editor work below. Archive lists remain quiet and text-led.

Body copy remains left-aligned on solid reading surfaces. Text shadows stay on mastheads, navigation, media-backed regions, and transparent panels.

The primary links remain in one row without a collapsed menu. Below `37.99rem`, they occupy three equal columns above the home-wordmark row.
Keep horizontal overflow available for longer navigation labels. Do not wrap an individual label.

Primary navigation orders Projects before Blog and Commissions. The CV is not part of public navigation or the sitemap.

Navigation and task controls keep targets of at least `44px`. The estimator stays in one column through tablet portrait and uses full-row option targets.

Commission section navigation stays on one horizontally scrollable line on phones. The primary contact action appears before supporting service details.

The Beat Saber map archive shows six entries per category page. Cover art uses a `6rem` square on narrow phones, `8rem` from `40rem`, and `9rem` from `48rem`. Map cards remain in one column until `64rem`.

Viewport-edge controls respect device safe areas. Compact landscape viewports reduce masthead and commission-banner height without changing navigation or content order.

The back-to-top control stays out of the layout until the visitor scrolls beyond the opening region. Fixed controls must not cover first-viewport content.

The homepage uses static artwork with discrete passive motion. It does not use animated grain or a runtime canvas.
The title and selected controls snap to bounded positions and hold each pose until another event.
Lower-page decorative impressions and inventory labels remain still after their entrance. Only the hero wordmark and interactive controls retain passive poses.
Decorative artwork stays hidden from assistive technology and pointer hit testing.
The hero retains selectable text, an accessible heading, and controls with targets of at least 44px.
Reduced motion keeps the composition static. Offscreen content and hidden tabs stop passive updates.
The page does not include an ambient pause button.

The CV is a standalone document with a maximum width of `72rem`. It changes from stacked to side-by-side profile content at `48rem` and prints at A4 portrait size.

**The Dense Center Rule.** Keep long content in a centered reading region. Let the ink surface and full-width separators extend beyond it.

## Elevation & Depth

Layered print, flat surfaces. Overlapping artwork, torn silhouettes, paint order, and solid reading pockets establish depth.
Thin borders and dividers organize quieter content. Media retain their directional shadows, but the site has no universal elevated-card surface.

### Shadow Vocabulary

- **Overlay text** (`0 0 0.0625em #000, 0 0 0.0625rem #000, 0 0 0.125rem #000`): Keeps white text legible on images and translucent surfaces.
- **Ink duality:** Red and cyan-blue form the homepage registration pair. Navigation uses an off-white active stamp and quieter blue interaction fields.
- **Media rest** (`-0.1875em 0.1875em 0.375em #0008`): Separates square cover art from the content row.
- **Media hover** (`-0.125em 0.125em 0.5em #000f`): Strengthens image depth during hover.

### Named Rules

**The Structural Depth Rule.** Use paint order, masks, panels, and borders before shadows. Reserve stronger shadows for media.

## Shapes

The print system uses torn paper, broken splatter, square fields, and complete rectangular media frames.
Printed actions place their irregular shape on a background layer. Their live label and focus outline remain unclipped.
Static inventory slips can clip their own background because they are not controls.

Chipped corners remain in the beatmap empty state and footer status message. They are not a standard shape for every project or content group.
Circular shapes serve the avatar, timeline markers, and back-to-top control. Shared social actions use print stamps rather than a universal circular button.

The CV uses square section-icon blocks, softly rounded skill tags, and rounded project images. These shapes support document scanning and print output.

**The Complete Artifact Rule.** Keep screenshots level and complete. Let decorative ink cross their surroundings, not obscure the evidence inside them.

**The Clear Focus Rule.** Do not clip interactive controls. Keep decorative masks on separate layers so that each authored focus outline remains visible.

## Components

Playful edges, precise behavior. Printed actions carry the visual character, while native inputs, readable states, and clear focus preserve predictable interaction.

### Buttons

- Printed actions use a torn paper background with dark text. On paper introductions, the treatment reverses to a dark background with paper text.
- The estimator's inverse action uses Control Blue Dark on hover or focus and an Ink Black focus outline.
- Interior actions have a minimum height of `44px`. Hover and focus snap to the active color and `1.05` scale without interpolation.
- Reduced motion removes the scale response. Background clipping never clips the label or keyboard outline.
- Social controls pair icons with print fields and retain their own authored scale responses. Do not replace them with generic circular buttons.
- Back-to-top uses a charcoal disc and inset white ring. It is `46px` inline on phones and `48px` fixed from `48rem`.
- Show back-to-top after `min(75vh, 600px)` of scrolling. Hide the fixed version while the footer is visible.
- **Contact actions:** Discord actions copy `@kivalevan` and show a non-blocking status message. Ko-fi uses a local icon and visible text.

### Inventory labels

- Skills use static paper, ink, and blue slips with varied authored baselines. They are not outlined filter chips.
- Languages, Technologies, and Topics remain readable inventories. TypeScript, Unity, and Virtual Reality have display emphasis.
- Do not add hover, selected, or pointer states to labels that do not perform an action.

### Cards / Containers

- Project entries combine opaque reading pockets with level screenshots and exposed artwork between them.
- Blog and commission indexes use editorial groups, not a repeated card grid. Hardware uses open factual lists.
- Beatmap entries use a top divider, square cover, and adjacent text. Their empty state keeps its existing chipped border.
- Shared utility classes still exist for translucent panels and chipped corners. Their availability does not make them the default visual pattern.

### Punk Ink System

- Print-first palette: ink black, paper white, ash grey, saturated red, cyan-blue, petrol, and navy. Registration offsets remain controlled.
- Typography: League Gothic for the wordmark, Big Shoulders Display for headings and navigation, Space Mono for inventories and metadata, and neutral sans for prose.
- Deterministic assets (`scripts/generate-ink-assets.mjs`, fixed seeds, 32 SVGs): ink masses, directional sprays, heavy impacts, dry explosive ink, dragged impacts, pigment pools, scratches, masks, erasures, and grain. The separate liquid generator owns the three procedural splash masters described above. No runtime canvas is required. Inline SVGs use `currentColor` for print plates. CSS masks reuse the same assets in lower-density sections.
- The global canvas (`InkBackdrop`) is flat, static near-black. It has no gradient wash, glow, or scanner overlay. Lower homepage sections use flat masked pigment instead of atmospheric gradients. The hero owns the dense collage and scrolls away from the global backdrop.
- Lower sections use local ink families instead of a continuous background network. Three transition zones use a dry fragment, directional spray, or dying pigment remnant. Large black gaps remain clear.
- The poster has three visual scales. Large layers establish the portrait, fractured paper, and red/blue ink structure.
- Medium layers use paper impacts, dry drags, and tangled pigment. Small layers use spray, droplets, scratches, and registration edges.
- Saturated red and cyan-blue plates sit behind the portrait and title. Their offsets and paint order integrate the content with the poster.
- Hero pigment uses normal blending to retain color on black. Local paper scratches break the deposits without fading them into pastel washes.
- On phones, the portrait uses two transparent WebPs: the main face and the complete decoration below it. Color treatment and ragged alpha are baked into the images. Do not apply the original portrait masks or blends again. Desktop rendering and external entrance timing remain unchanged.
- Retain shared SVG definitions and their viewport context when suppressing the original portrait paint; other impressions reference these IDs. Give the decorative image lower fetch priority than the face.
- Regenerate both portrait images with `scripts/generate-mobile-portrait.mjs` after changing their sources, masks, filters, or geometry. Compare face clarity and decorative overflow at phone widths and check decoded memory as well as transfer size.
- Title (`ChromaticTitle`): one accessible `Kival Evan` heading uses League Gothic 400 for every glyph. Its tall, narrow outline is revealed through selective paper and crimson plates, moody blue registration, dry fill loss, and sparse foreground scratches. KIVAL carries slightly denser paper coverage while EVAN stays more skeletal. A dragged blue-black field and thin cross-word cuts embed the title in the lower poster artwork without obscuring the portrait.
- Portrait (`InkPortrait`): offset plates, restrained edge splatter, and pigment frame one high-contrast core plate. A solid torn-edge mask keeps the complete face visible. Brush damage stays behind the core and concentrates around hair, shoulders, and the lower silhouette.
- The hero is one poster field rather than a row or stack of modules. The portrait emerges from the dense left ink mass, the single-line `KIVAL EVAN` wordmark anchors the lower artwork, and the biography sits in an irregular black reading pocket on the right. Compact social stamps remain near the portrait without a shared white panel. Phones keep the same hierarchy through a cropped portrait, one-line wordmark, black biography pocket, and compact social cluster.
- Header navigation uses condensed display labels, a broken underline, and a torn off-white active stamp. It has no brackets or decorative numbering.
- `SectionHeading` gives Featured, Skills, and Hardware consistent type with different material rules. The headings contain no indexes or eyebrow copy.
- Featured video keeps a standard rectangular player. Its paper mount is decorative and separate from the stable 16:9 media box. Homepage sections use `overflow-x: clip` and visible vertical overflow, which prevents nested scrolling. Astro loads the Svelte component with `client:visible`.
- Skills use three readable inventories with selected oversized labels, paper fragments, and irregular authored baselines. Local paper and cyan marks stay at the edges of the tag field.
- Hardware uses paper category tabs and damaged red/cyan rules. The lists stay clear and factual.
- The footer uses a labelled, low-contrast social strip and a torn Ko-fi action. One large `KIVAL EVAN` proof mark closes the page with dying red and navy residue. The mark stays behind functional content, which remains in normal document flow.
- Entrance motion and passive motion are separate. Passive title glitches show two character poses at 12 FPS, then restore the original letter.
- Idle control offsets and hero title jitter update once per second. Background artwork, interior headings, and inventory labels remain still after entry. Control shapes and target selection remain random.
- Hover and keyboard focus immediately snap printed controls to their active appearance. Active paper edges then change once per second, without intermediate poses.
- `pose-sequence.ts` retains the glitch's two 12 FPS character poses and skips overdue poses after a stall.
- Passive control poses freeze during hover or focus. The active paper shape can still change without moving the label or click target.
- Regular pose timers are independent. The old inter-group event budget does not delay their one-second updates.
- Homepage glitches retain their random recurrence and the two-second quiet window in each 12-second cycle. Deferrals preserve the queued glitch.
- Hidden tabs, offscreen elements, reduced motion, and entrance preparation suspend the relevant updates. Interaction retains ownership of its control.

### Page Transitions

The shared header retains consistent dimensions and navigation positions across routes.
The home link sits on the right as a League Gothic wordmark on desktop.
Below `37.99rem`, it centers beneath the navigation and uses `clamp(4rem, 18vw, 6rem)` for its size.
The wordmark reveals through scrambled characters that settle in a newly randomized order at 12 FPS.
The nine letters resolve within 750ms. Temporary faces occupy the existing glyph slots and preserve the accessible name and authored text.
There is no entrance fade, shake, translation, or scaling.
This happens on initial display and when leaving the homepage, where the wordmark replaces its hidden slot.
The initial reveal waits for fonts and two painted frames. The reveal after leaving home waits until the native transition finishes.
Before the DOM swap, hold the incoming wordmark at zero opacity so its snapshot cannot flash before the live reveal starts.
The temporary faces are ready before releasing that hold. Cancellation or a one-second timeout exposes the static wordmark without a late replay.
Returning home scrambles the letters in randomized batches at 12 FPS while the wordmark fades out over 333ms.
The scramble follows the fade's native clock during the outgoing page's existing erase, without adding a navigation delay or extending its final black beat.
Navigation between interior pages keeps the wordmark still. Hover and keyboard focus do not replay its animation.
The link and focus outline remain anchored. The wordmark does not receive passive control offsets or an idle loop.
Reduced motion, hidden tabs, offscreen state, resize, and route disposal restore the original letters.
Default and no-JavaScript wordmarks stay visible. Late modules do not replay inside an active transition snapshot.
The homepage replaces that link with a hidden, non-interactive slot of the same size.
Narrow screens use the same two-row header structure on every route.
The homepage uses its own one-time print reveals.

- Print pages use the mixed 6/12 FPS outgoing erase described in Interior pages. Native page snapshots stay hidden during the black handoff, without a crossfade. Incoming live material reveals then use their separate 6, 8, and 12 FPS clocks.
- The CV uses plain navigation without print motion. There is no separate fallback fade or stagger sequence.
- Keep content visible and unchanged by default. Cancel stale transitions before the next navigation and bypass print motion for reduced motion.

### Disclosure

- Use native `details` and `summary` for dense reference information that is not necessary for the first decision.
- Keep the summary target at least `2.75rem` high and describe the hidden content directly.
- Do not hide service status, core prices, delivery expectations, or the primary contact action.

### Inputs / Fields

- The duration field uses Control Surface, Control Paper, and a one-pixel Control Blue border. Its height is `44px` and maximum width is `14rem`.
- The effective print-page focus outline is two pixels in Paper White, with a four-pixel offset.
- Invalid duration uses a Control Error border. Without keyboard focus, its outline is also Control Error with a two-pixel offset.
- Keep the Paper White outline on a focused invalid field. The visible recovery message and red border continue to identify the error.
- Native checkboxes and radios use the separate Control Error red as their accent. Full-row labels provide `44px` targets.
- A selected option row gains the quiet Control Blue Dark wash. Do not replace native controls with decorative imitations.
- Difficulty errors mark each checkbox with `aria-invalid` and connected help text. The group keeps its red error outline through `data-invalid`.
- Empty, invalid, and calculated states remain distinct. Clearing the duration removes the estimate, rather than displaying a misleading zero price.
- Keep the assertive validation feedback and the polite result announcements. Preserve the 600-second limit and seconds or minutes:seconds input.

### Navigation

- Use bold uppercase Big Shoulders Display labels without decorative indexes.
- Mark the current page with a torn off-white stamp and crimson underline. The active state does not change the link width.
- Hover and focus use a muted-blue paper field, a visible focus outline, and the shared control scale response.
- Keep the links in one row. Narrow screens place the home wordmark in a separate row without a collapsed menu.
- Use this order for the primary navigation: Projects, Blog, Commissions.
- After client navigation, move focus to the new main content. For local section links, move focus to the target heading.

### CV Document

- Lead with professional experience, then freelance engineering, technical skills, and education. Selected projects follow in this order: ChroMapper, Map Check, Editor Enhanced, Mapping Utility. The award closes the CV.
- Keep freelance assignments distinct from employment and personal projects. Describe unmeasured improvements without invented metrics, and label potential savings as estimates.
- The A4 print version uses two pages, 10mm page margins, and 10pt body text. Selected projects start page two. Keep project previews on the web, but omit them from print so the engineering details remain readable.
- Use CV Paper for the full canvas and CV Ink for text.
- Use CV Accent for the profile masthead, section icons, timeline stems, timeline markers, and horizontal rules.
- Set section labels in bold uppercase text with wide tracking.
- Use softly rounded CV skill tags with a faint white wash and a one-pixel CV Muted outline.
- Preserve the A4 print rules and exact print-color adjustment.

### Media Tiles

- Use square cover images with a directional dark shadow.
- Cover art scales to `1.05` on hover or keyboard focus. Hover also strengthens its shadow.
- Keep descriptive text beside the image and let long names wrap.
- Reserve media dimensions before loading. Lazy-load below-fold media, show embed loading state until the frame responds, and provide a direct external fallback link.
- Start featured media with the first configured item. Change media only after the visitor uses the next-video control.
- Beatmap pagination shows six maps per category page. Previous and next wrap between the first and last pages.
- Use the printed action treatment, pointer cursors, accessible names, keyboard activation, and a polite live page count.
- Hide the pager when only one page exists. Preserve the separate empty-state message when no maps exist.
- Featured video and beatmap lists hydrate when visible. The calculator hydrates on load because its controls are immediately useful.

## Do's and Don'ts

### Do:

- **Do** preserve personal imagery and printed art when they give a page or media region its identity.
- **Do** protect reading areas with solid backgrounds and keep texture outside the text.
- **Do** keep link, hover, active, and focus states visibly distinct.
- **Do** preserve keyboard focus, semantic structure, responsive behavior, and reduced-motion support.
- **Do** keep professional work and Beat Saber material inside one coherent visual world.
- **Do** preserve the CV as a focused light document and print surface.

### Don't:

- **Don't** turn the site into a generic white corporate portfolio or SaaS landing page.
- **Don't** use Signal Red or Signal Cyan as unstructured neon fills; use them as deliberate registration plates, edge signals, and focus states.
- **Don't** add heavy shadows to every card or container.
- **Don't** add another decorative typeface without a clear role that Big Shoulders Display, Space Mono, and the neutral sans cannot provide.
- **Don't** hide dense personal detail only to create empty space.
- **Don't** replace the one-line wordmark, printed navigation, or static inventory labels with older generic card patterns.
- **Don't** add atmospheric background gradients, ambient ink drift, or a crossfade between outgoing and incoming pages.
- **Don't** apply the poster collage to the CV or weaken its print behavior.
