---
version: alpha
name: Kival Evan
description: A personal VR workshop archive for software, Beat Saber, writing, and everyday interests.
colors:
   ink-black: '#030305'
   paper-white: '#ecebe6'
   ash-grey: '#a5a5a2'
   signal-red: '#ed1738'
   signal-cyan: '#00aeca'
   homepage-cobalt: '#6883ad'
   homepage-petrol: '#29466b'
   homepage-navy: '#0b1429'
   deep-blue: '#061521'
   ink-petrol: '#0e5063'
   smoked-panel: 'rgb(3 3 5 / 86%)'
   white: '#fff'
   control-charcoal: '#333'
   cv-paper: '#f5f5f5'
   cv-ink: '#111'
   cv-accent: '#b74242'
   cv-border: '#222'
   cv-muted: '#ccc'
typography:
   wordmark:
      fontFamily: 'League Gothic, Arial Narrow, Helvetica Condensed, system-ui, sans-serif'
      fontSize: 'clamp(5.4rem, 17.5vw, 14rem)'
      fontWeight: 400
      lineHeight: 0.82
   wordmark-mobile:
      fontFamily: 'League Gothic, Arial Narrow, Helvetica Condensed, system-ui, sans-serif'
      fontSize: 'clamp(4.5rem, 24vw, 7rem)'
      fontWeight: 400
      lineHeight: 0.82
   display:
      fontFamily: 'Big Shoulders Display, Arial Narrow, Helvetica Condensed, system-ui, sans-serif'
      fontSize: 'clamp(4rem, 12vw, 9.5rem)'
      fontWeight: 800
      lineHeight: 0.84
   cv-display:
      fontFamily: 'Noto Sans, Gill Sans, Trebuchet MS, Geneva, Verdana, sans-serif'
      fontSize: '2.5rem'
      fontWeight: 700
      lineHeight: 1.25
   headline:
      fontFamily: 'Big Shoulders Display, Arial Narrow, Helvetica Condensed, system-ui, sans-serif'
      fontSize: '2rem'
      fontWeight: 800
      lineHeight: 1.05
   section-heading:
      fontFamily: 'Big Shoulders Display, Arial Narrow, Helvetica Condensed, system-ui, sans-serif'
      fontSize: 'clamp(2.2rem, 5vw, 4rem)'
      fontWeight: 800
      lineHeight: 0.9
   section-heading-medium:
      fontFamily: 'Big Shoulders Display, Arial Narrow, Helvetica Condensed, system-ui, sans-serif'
      fontSize: 'clamp(2.5rem, 6vw, 4.8rem)'
      fontWeight: 800
      lineHeight: 0.9
   section-meta:
      fontFamily: 'Space Mono, ui-monospace, Cascadia Mono, Menlo, Consolas, monospace'
      fontSize: '0.72rem'
      fontWeight: 700
      lineHeight: 1.4
   title:
      fontFamily: 'Big Shoulders Display, Arial Narrow, Helvetica Condensed, system-ui, sans-serif'
      fontSize: '1.5rem'
      fontWeight: 800
      lineHeight: 1.1
   body:
      fontFamily: 'Noto Sans, Gill Sans, Trebuchet MS, Geneva, Verdana, sans-serif'
      fontSize: '1rem'
      fontWeight: 400
      lineHeight: 1.55
   body-large:
      fontFamily: 'Noto Sans, Gill Sans, Trebuchet MS, Geneva, Verdana, sans-serif'
      fontSize: '1.125rem'
      fontWeight: 400
      lineHeight: 1.55
   label:
      fontFamily: 'Space Mono, ui-monospace, Cascadia Mono, Menlo, Consolas, monospace'
      fontSize: '0.875rem'
      fontWeight: 700
      lineHeight: 1.45
   mono:
      fontFamily: 'Space Mono, ui-monospace, Cascadia Mono, Menlo, Consolas, monospace'
      fontSize: '0.875rem'
      fontWeight: 400
      lineHeight: 1.45
corners:
   sharp: '0'
   chip-sm: 'clamp(0.5rem, 0.8vw, 0.625rem)'
   chip: 'clamp(0.75rem, 1.25vw, 1rem)'
   cv-tag: '0.25rem'
   full: '9999px'
spacing:
   micro: '0.25rem'
   compact: '0.5rem'
   card: '0.75rem'
   base: '1rem'
   section: '2rem'
components:
   content-card:
      backgroundColor: '{colors.smoked-panel}'
      textColor: '{colors.white}'
      corners: '{corners.chip}'
      padding: '{spacing.card}'
      typography: '{typography.body}'
   skill-chip:
      backgroundColor: transparent
      textColor: '{colors.white}'
      corners: '{corners.chip-sm}'
      padding: '0.25rem 0.5rem'
      typography: '{typography.body}'
   home-skill-fragment:
      backgroundColor: '{colors.deep-blue}'
      textColor: '{colors.paper-white}'
      corners: '{corners.sharp}'
      padding: '0.42rem 0.72rem'
      typography: '{typography.label}'
   text-input:
      backgroundColor: '{colors.smoked-panel}'
      textColor: '{colors.white}'
      corners: '{corners.sharp}'
      padding: '0.25rem 0.5rem'
      typography: '{typography.body}'
   icon-action:
      backgroundColor: transparent
      textColor: '{colors.ash-grey}'
      corners: '{corners.full}'
      size: '2.5rem'
   back-to-top:
      backgroundColor: '{colors.control-charcoal}'
      textColor: '{colors.white}'
      corners: '{corners.full}'
      size: '2.8125rem'
   cv-skill-tag:
      backgroundColor: 'rgba(255, 255, 255, 0.5)'
      textColor: '{colors.cv-ink}'
      corners: '{corners.cv-tag}'
      padding: '0.125rem 0.5rem'
      typography: '{typography.label}'
---

# Design System: Kival Evan

## Overview

### Current homepage direction

The homepage is a personal screen-print poster, not a dashboard or a collection of cards.
The homepage establishes the print materials used across the site. The standalone CV keeps its separate professional design.

- League Gothic 400 carries the single-line hero wordmark. Its authored glyph spacing, damage, outlines, and crimson Vs remain fixed.
- The portrait, strong off-white mass, and protected biography area form the primary composition.
- The outer hero canvas fills the viewport. A centered inner container positions the artwork without clipping its decorative overflow.
- Featured Video, Skills, and Hardware use centered content blocks with left-aligned text.
- Paper uses coherent silhouettes with limited edge loss. Ink uses broken coverage, scratches, and restrained registration offsets.
- Social and support controls use icon stamps, paper fields, and hover/focus responses without decorative underlines. Static skill labels remain non-interactive.
- The hero is the visual peak. Hardware remains quieter, and the footer acts as a subdued closing signature.

### Palette scope

The homepage uses cobalt `#6883ad`, petrol `#29466b`, and navy `#0b1429` instead of cyan or teal.
The title retains its protected blues `#365b7d` and `#1f3c58`.
Shared header and footer controls also use muted blue.
Legacy tokens named `signal-cyan` remain in the source. Interior pages override them through the scoped `print-page` palette.
Those token names do not authorize cyan, teal, or neon accents in the print design.

### Artwork sources and generated images

Keep original SVG artwork as the editable source. Baked images and atlases are generated outputs, not replacements for the source files. Change the source artwork first, then regenerate its outputs.
Each bake must preserve transparent boundaries, crop registration, paint order, and the existing layout. Keep text, video, and interactive controls live. Rendering changes must not silently alter entrance timing or transition behavior.
Use atlases for compatible small impressions with sampling gutters and region metadata. Keep large compositions and portrait images separate where an atlas would force unrelated images into decoded memory. Compare decoded memory and transfer size separately.
The mobile hero uses complete transparent decorative planes generated by `scripts/generate-mobile-hero-planes.mjs`. Four raster surfaces preserve the back, middle, foreground-paper, and foreground-vein paint order around live content. Their image states include shared masks, local material passes, and sampled entrance clips. Do not reapply those vector effects to the images.
Fifteen sampled entrance positions replace one another in held steps after the existing 280ms hold. Omitted intermediate poses use the preceding sample; the sequence approximates the original reveal rather than reproducing every pose. Portrait, title, biography, and social entrances remain live. The small mobile idle ink offset targets the baked back plane, not the original definition-bearing wrappers.
Before starting the hero entrance, decode the selected image states and portrait, then wait for native navigation to finish. Give the first paused pose a paint opportunity before its hold timer starts. Readiness has a 1,200ms budget and respects bootstrap expiry; failures expose static content without a late replay. Keep unselected registrations hidden in inline styles during route stylesheet replacement, and serve frame images externally rather than embedding them in page HTML.
Regenerate after artwork, palette, geometry, or entrance CSS changes. Source SVG viewports and definitions remain in place because other artwork references their fragment IDs; only source paint and material effects are suppressed on phones. Desktop retains original rendering. Separate state images avoid decoding every registration in one large atlas; they supersede the small-impression atlas and individual hero-paper bakes.

### Interior pages

Projects, Blog, Commissions, and the 404 page share the homepage's muted blues, crimson, off-white paper, and rough ink.
Splatter stays near headings and artwork. Article text, pricing, and estimator controls retain clear reading surfaces.
Interior openings use denser, asymmetric crimson and muted-blue impressions, with abrasion breaking up large ink deposits.
The main Projects and commission openings expose a dense ink composition beside their copy-safe paper, rather than stretching paper across empty columns.
The Blog title sits on the dark canvas above its latest-post paper. Its ink composition occupies the opposite edge, clear of the title and metadata.
The shared decorative `InkCollision` uses static layered impressions, fiber loss, and filaments. It adds no scripts or motion.
On phones with size-container query support, one transparent colored image replaces its eight live impressions. Twelve generated aspect-ratio variants preserve the composition across tall and wide containers; only one is displayed at a time. Font or layout changes can request additional variants. Regenerate with `scripts/generate-mobile-collision-groups.mjs` after changing the component or SVG masters. Desktop and unsupported browsers retain the original layers.
Keep the strongest marks at paper and image edges. Avoid clean stripe patterns, repeated splatter stamps, and texture across reading columns.
Big Shoulders Display carries headings and control labels. Long-form text keeps its reading font and comfortable measure.
Prominent actions use torn paper backgrounds, whole-control scaling, and visible keyboard focus without decorative broken underlines.
New shared styles are scoped to `body.print-page`. They do not apply to the homepage or CV.
Interior openings and content sections prepare before paint, then assemble once through a 420ms jagged reveal without opacity fading. Ten authored keyframes use hard snaps, with each entrance pose held for 42–50ms, matching the outgoing snapshot's cadence. Entrance and exit contours change in place, without directional travel or added jitter.
Content already exposed by the 1.5-second fail-open timeout must never be hidden again by a late module.
Simultaneously visible sections enter 90ms apart, with the added delay capped at 180ms. Reading content stays still after entry.
Interior page-opening titles resolve once when at least 15% of the heading enters view. On client navigation, visibility checks start after the transition snapshot finishes so the character changes remain visible on the live page.
Random substitutions follow the homepage's uneven per-letter cadence and settle within 730ms. Measured inline letter slots keep each replacement in its own line box, without a separately positioned title copy.
The live letter text inherits the authored font, weight, color, and shadow; it does not use a separately styled pseudo-element.
The heading name stays accessible, and cleanup restores its original text nodes. Section headings, body prose, form labels, the navigation wordmark, and the CV are excluded.
The resolve restores the authored title on completion, resize, focus, hidden tabs, reduced motion, or route disposal. Late modules never scramble already-exposed titles.
Nested sections do not double-animate. Text, forms, and paper panels are not clipped during entrance.
Visible headings and decorative backgrounds hold small, bounded registration offsets. New poses occur roughly every 1.8–3 seconds, with a quiet final two seconds in each 12-second cycle.
Astro navigation between styled pages, including the homepage, uses a 420ms outgoing erase from left to right. Ten mirrored jagged contours use 42–50ms holds, with no blank tail before the incoming snapshot. The page stays anchored. Passive motion retains its held print snaps.
Interior assembly starts after that snapshot transition, without replaying a visible page. The homepage keeps its own entrance; navigation involving the CV remains plain.
Returning home prepares the incoming hero before Astro swaps documents, so reused scripts do not bypass its authored entrance. The preparation retains a 1.5-second fail-open timeout.
Reduced motion, hidden tabs, offscreen targets, and route disposal restore the authored poses. Homepage motion and the professional CV remain separate.

The Projects openings connect the title, readable copy, and screenshots with an off-white mass and localized ink deposits.
The main Projects page presents individual software projects, with Map Check as the lead and ChroMapper and Editor Enhanced below it.
Each entry identifies the author's role, purpose, technologies, and direct project links. BSMap, mapping work, and the archive use compact sections.
The Beat Saber detail route remains available for deeper descriptions and usage permissions.
The paper contour adapts to tall mobile layouts without shrinking into a narrow horizontal band.
Screenshots retain their complete 16:9 frames and sit above decorative ink edges. The archive and tool details remain quieter.

The Blog index places its heading and latest post on one paper surface, without a tagline. Earlier posts remain a quiet list.
Article headers use the same paper material without placing splatter behind paragraphs.
Blog metadata stays with its article title. Inline article links use ordinary underlines, while printed action controls remain free of decorative underlines.
Preserve authored article content and structure during design changes. Each article ends with a Back to blog action.
The commission overview leads with paper and type, without a header photograph. The Beat Saber detail page retains its service photograph.
Proof uses an editorial list, and prices use flat ruled columns.
The estimator keeps native form controls and a restrained paper introduction. The 404 artwork and return action share one paper composition.
Paper masks belong on background layers, not interactive containers. Text and keyboard focus must remain outside the masks.
Dark controls on paper invert the usual paper-on-ink treatment while retaining the same scale and torn-edge interaction.

**Creative North Star: "The VR Workshop Archive"**

The system feels like a personal workshop that also stores a long record of projects, tools, maps, and interests. Dark ink, paper, and restrained registration color give the workshop a printed material identity. The homepage opens with a full-width mixed-media poster; transparent panels keep denser secondary content legible without hiding the dark surface.

The voice is personal, technical, and lived-in. The interface favors useful detail, clear frames, and direct interaction over polished corporate presentation. Professional work and Beat Saber culture must feel native to the same person and place.

**Key Characteristics:**

- Dark pages with a restrained ink wash and translucent structural layers.
- Paper type with crimson and muted-blue print registration on the homepage.
- Dense but orderly content in bordered cards, chips, and lists.
- Large condensed site identity with compact mono navigation.
- A purposeful light, print-ready CV inside the broader dark system.
- Visible focus states and motion that respects reduced-motion preferences.

## Colors

The palette combines near-black ink, warm paper, ash grey, and controlled registration colors.
The print pages use the muted-blue palette defined in Palette scope. The CV retains its existing palette.

### Primary

- **Ink Black** (`#030305`): The stable page canvas, erasure color, and dark ground beneath the printed layers.
- **Signal Red** (`#ed1738`): The registration plate, active signal, and selected control accent.

### Secondary

- **Signal Cyan** (`#00aeca`): The offset registration plate, link color, and keyboard-focus outline.
- **Deep Blue** (`#061521`): The blue-black depth tone and scrollbar endpoint.

### Tertiary

- **Ink Petrol** (`#0e5063`): A rare cool ink note in decorative micro details and print structure.

### Neutral

- **Paper White** (`#ecebe6`): Primary text, printed plates, borders, and readable hero type.
- **Ash Grey** (`#a5a5a2`): Secondary text and quiet social actions.
- **Smoked Panel** (`rgb(3 3 5 / 86%)`): A transparent dark layer over artwork, media, and dense secondary content.
- **White** (`#fff`): Compatibility text and borders where a pure white surface is required.
- **Control Charcoal** (`#333`): The solid circular surface for the back-to-top control.

### CV Document Palette

- **CV Paper** (`#f5f5f5`): The screen and print canvas for the standalone CV.
- **CV Ink** (`#111`): Primary CV text and one of its corner marks.
- **CV Accent** (`#b74242`): The CV masthead, section icons, timelines, and rules.
- **CV Border** (`#222`): The outline for compact CV skill tags.
- **CV Muted** (`#ccc`): The avatar backing and subdued CV link response.

### Named Rules

**The Registration Color Rule.** Use crimson and the applicable blue palette as intentional print plates, offsets, and interaction signals. Do not add neon fills.

**The Visible Surface Rule.** Use transparent dark layers over the ink surface. Keep large opaque panels for content that needs stronger separation.

**The Daylight Document Rule.** Keep the CV on its light print palette. Do not force the dark shard surface onto the CV.

## Typography

**Display Font:** Big Shoulders Display 800 with condensed system fallbacks

**Body Font:** Noto Sans with neutral system sans-serif fallbacks
**Label/Mono Font:** Space Mono 400/700 with ui-monospace fallbacks

**Character:** Tall condensed display type carries the poster voice. Space Mono handles navigation and metadata, while a neutral sans keeps body copy comfortable to read.

### Hierarchy

- **Wordmark**: League Gothic 400 uses the dedicated wordmark sizes in the metadata. The homepage title remains on one line.
- **Display**: Big Shoulders Display 800 carries section headings, navigation labels, and printed control labels. It does not replace the hero wordmark.
- **CV Display** (700, `2.5rem`, 1.25): The professional name in the standalone CV masthead.
- **Headline** (800, `2rem`, 1.05): Major display-led sections and article headings.
- **Section Heading** (800, `1.875rem`, 1.05): Repeated display-led sections and long-form document divisions.
- **Title** (800, `1.5rem`, 1.1): Display-led groups and project names when the punk treatment is used.
- **Body** (400, `1rem`, 1.55): General interface and article content. The root size scales from `1rem` to `1.125rem`.
- **Mono** (400, `0.875rem`, 1.45): Quiet metadata and supporting fixed-width labels.
- **Label** (700, `0.875rem`, 1.45): Navigation, kickers, and compact uppercase metadata.

### Named Rules

**The Role Pairing Rule.** Reserve Big Shoulders Display for condensed display type, Space Mono for labels and metadata, and neutral sans for reading text.

**The Readable Overlay Rule.** Use the established black text shadow when paper type sits over ink, media, or transparent panels.

**The Muted Text Surface Rule.** Ash-grey text may sit directly on the ink surface where contrast remains legible. Keep long-form body text on calmer surfaces for reading comfort, not ornament.

## Layout

The system uses one fluid column for the page shell and centered content regions for dense material. Apply `site-shell` to general page containers. It supplies a centered, full-width container with an `80rem` maximum width by default.

The homepage hero is an absolute poster stage, not a grid or a set of cards. Paper, portrait plates, title, biography, social links, and the work link form one collision. The right side keeps a readable negative-space field for the biography.

The homepage uses controlled ink density after the hero. Featured media has the strongest secondary composition. Skills reduce the density, Hardware stays quiet, and the footer closes with one exhausted print gesture.

Long-form articles use a readable inner measure near `72ch`. Mobile articles and documentation sections use the same site gutters as index pages.

Primary body and service prose use a maximum measure near `72ch`. Short descriptions can use `65ch`. Cards, grids, media, and structured rate data can use the full page shell.

Apply `site-reading-width` to primary prose blocks inside a wide shell. It centers the readable column while keeping its text left-aligned.

Center heading text inside a reading-width container when the heading does not use a divider. Keep headings with a divider left-aligned.

Spacing follows a compact `0.25rem`, `0.5rem`, `0.75rem`, `1rem`, and `2rem` rhythm. Dense utility pages commonly use `2rem` vertical padding. Homepage publication sections use `5rem` to `11rem` gaps to separate changes in ink density. Cards use `0.75rem` internal padding and `1rem` grid gaps.

Mobile layouts use one column. Below `48rem`, the poster keeps a cropped print field, a clear portrait, and an offset title. A compact social cluster follows the biography. Tablet layouts keep the poster tall and move the biography lower. Desktop layouts spread the portrait, title, and biography across one stage. Wide screens give the portrait and title more space. These hero compositions do not use the project-card or grid primitives below the hero.

At the medium breakpoint (`48rem`), project grids and calculator groups change to two or three columns. At the large breakpoint (`64rem`), the home avatar gains more width.

Dense commission tables and pricing groups use one column on phones, two columns on tablets, and three columns only at `64rem` or wider. Reference archives use separate routes.

Active commission pages use a task-first sequence: current status, core price, primary contact action, proof, supporting details, map showcase, and terms. Detailed rates and full terms remain visible. SlimeVR commissions are not part of the service catalog.

The Split Workbench uses `/project/beat_saber`. The `#software-tools` destination contains software projects and reusable mapping tools. The `#mapping-workshop` destination contains published maps, mapping utilities, scripts, plugins, and Beat Saber commission access.

Featured project sections use real interface screenshots as structural evidence. The portfolio index uses one wide artifact band, while the Beat Saber page gives Map Check the lead position and groups related editor work beneath it. Archive lists remain quiet and text-led.

Body copy remains left-aligned on solid reading surfaces. Text shadows stay on mastheads, navigation, media-backed regions, and transparent panels.

The primary navigation stays on one line and can scroll horizontally. This behavior preserves labels without a collapsed menu.

Primary navigation orders Projects before Blog and Commissions. The CV is not part of public navigation or the sitemap.

Touch layouts keep navigation and task controls at least `2.75rem` high. The estimator stays in one column through tablet portrait and uses full-row option targets.

Commission section navigation stays on one horizontally scrollable line on phones. Commission artwork uses an `8rem` banner on phones and a `12rem` banner from `40rem` upward. The primary contact action appears before service-detail cards.

The Beat Saber map archive shows six entries per category page. Cover art uses a `6rem` square on narrow phones, `8rem` from `40rem`, and `9rem` from `48rem`. Map cards remain in one column until `64rem`.

Viewport-edge controls respect device safe areas. Compact landscape viewports reduce masthead and commission-banner height without changing navigation or content order.

The back-to-top control stays out of the layout until the visitor scrolls beyond the opening region. Fixed controls must not cover first-viewport content.

The homepage uses static artwork with discrete passive motion. It does not use animated grain or a runtime canvas.
The title and selected controls snap to bounded positions and hold each pose until another event.
Randomized strips update polygon geometry inside a persistent inline SVG. They do not swap image resources between shapes.
Decorative artwork stays hidden from assistive technology and pointer hit testing.
The hero retains selectable text, an accessible heading, and controls with targets of at least 44px.
Reduced motion keeps the composition static. Offscreen content and hidden tabs stop passive updates.
The page does not include an ambient pause button.

The CV is a standalone document with a maximum width of `72rem`. It changes from stacked to side-by-side profile content at `48rem` and prints at A4 portrait size.

**The Dense Center Rule.** Keep long content in a centered reading region. Let the ink surface and full-width separators extend beyond it.

## Elevation & Depth

Depth is layered and structural. Transparent panels establish planes over the ink surface. Thin borders, dividers, masks, and text shadows keep content separate. The homepage poster gains depth from print collisions and paint order; media and avatar images use directional shadows, while ordinary cards remain mostly border-defined.

### Shadow Vocabulary

- **Overlay text** (`0 0 0.0625em #000, 0 0 0.0625rem #000, 0 0 0.125rem #000`): Keeps white text legible on images and translucent surfaces.
- **Ink duality:** Crimson and muted blue form the homepage registration pair. Navigation uses an off-white active stamp and blue interaction fields.
- **Avatar lift** (`-0.125rem 0.125rem 0.25rem #0008`): Gives the circular identity image a small directional lift.
- **Media rest** (`-0.1875em 0.1875em 0.375em #0008`): Separates square cover art from the content row.
- **Media hover** (`-0.125em 0.125em 0.5em #000f`): Strengthens image depth during hover.

### Named Rules

**The Structural Depth Rule.** Use paint order, masks, panels, and borders before shadows. Reserve stronger shadows for identity images and media.

## Shapes

The dark site uses sharp workshop geometry. Cards remove a small piece from the top-right and bottom-left corners. Compact chips use the same cut at a smaller scale. Fields and text actions stay square so that focus outlines remain clear.

Circular shapes belong only to avatars, icon controls, and the back-to-top action. Major profile panels remain rectangular and can use two opposing corner marks instead of a full border.

The CV uses square section-icon blocks, circular timeline markers, square skill tags, and rounded project images. These shapes support document scanning and print output.

**The Framed Artifact Rule.** Use thin light borders and chipped corners for discrete content objects. Use corner marks for large profile panels over the ink surface.

**The Clear Focus Rule.** Do not clip interactive controls. Keep their edges square so that the global focus outline remains fully visible.

## Components

Components are framed, direct, and responsive. Their states use color, underline, scale, or translation without extra ornament.

### Buttons

- **Shape:** Icon buttons are circular. Text actions can remain borderless when their labels are clear.
- **Primary:** The system does not use a large filled primary button as a standard pattern.
- **Hover / Focus:** Icon actions change from muted gray to white and can scale to `1.25`. All controls retain the global focus outline.
- **Back to top:** Use a charcoal circle, an inset white ring, and a small upward translation on hover. Keep it inline before the footer on phones. Use the contextual fixed position on wider screens, hidden near the page top and while the footer is visible.
- **Contact actions:** Discord actions copy `@kivalevan` and show a non-blocking status message. Ko-fi uses a local icon and visible text.

### Chips

- **Style:** Use a transparent surface, white text, a thin white border, small chipped corners, and compact padding.
- **State:** Current chips present information. Do not imply selection unless the feature adds a real selected state.

### Cards / Containers

- **Corner Style:** Use `chipped-corners` for standard cards. The cut scales from `0.75rem` to `1rem`; compact chips scale from `0.5rem` to `0.625rem`.
- **Chipped Borders:** Apply the shared `border` utility with chipped corners. A six-segment overlay draws the complete border independently of the element width and height.
- **Background:** Use the translucent ink panel when cards need separation; keep text grounds calm.
- **Shadow Strategy:** Keep standard cards flat. Use the Structural Depth Rule.
- **Border:** Use a one-pixel white border near 70% opacity. Use lower opacity for internal dividers.
- **Internal Padding:** Use `0.75rem` by default. Blog preview containers can use `0.5rem` to `1rem`.

### Punk Ink System

- Print-first palette: ink black, paper white, ash grey, crimson, cobalt, petrol, and navy. Registration offsets remain controlled rather than neon.
- Typography: Big Shoulders Display 800 for tall condensed display, Space Mono 400/700 for navigation, labels, and metadata, and neutral sans for body copy. Latin WOFF2 files are self-hosted in `/public/fonts` with `font-display: swap` and system fallbacks.
- Deterministic assets (`scripts/generate-ink-assets.mjs`, fixed seeds, 32 SVGs, approximately 218 KB raw and 74 KB aggregate gzip): ink masses, directional sprays, heavy impacts, dry explosive ink, dragged impacts, pigment pools, scratches, masks, erasures, and grain. No runtime canvas is required. Inline SVGs use `currentColor` for print plates. CSS masks reuse the same assets in lower-density sections.
- The global texture is restrained (`InkBackdrop`): a black wash, faint blue glow, repeating grain tile, and sparse scanner damage. It has no animated grain. The hero owns the dense collage and scrolls away from the global backdrop.
- Lower sections use local ink families instead of a continuous background network. Three transition zones use a dry fragment, directional spray, or dying pigment remnant. Large black gaps remain clear.
- The poster is built in three visual scales. Macro layers use two dominant paper masses, portrait plates, and red/navy structure. Meso layers use paper impacts, dry drags, and tangled pigment. Micro layers use spray, droplets, scratches, and registration edges near larger marks.
- Structural crimson and muted-blue plates sit behind the portrait and title. Their offsets and paint order integrate the content with the poster.
- On phones, the portrait uses two transparent WebPs: the main face and the complete decoration below it. Color treatment and ragged alpha are baked into the images. Do not apply the original portrait masks or blends again. Desktop rendering and external entrance timing remain unchanged.
- Retain shared SVG definitions and their viewport context when suppressing the original portrait paint; other impressions reference these IDs. Give the decorative image lower fetch priority than the face.
- Regenerate both portrait images with `scripts/generate-mobile-portrait.mjs` after changing their sources, masks, filters, or geometry. Compare face clarity and decorative overflow at phone widths and check decoded memory as well as transfer size.
- Title (`ChromaticTitle`): one accessible `Kival Evan` heading uses League Gothic 400 for every glyph. Its tall, narrow outline is revealed through selective paper and crimson plates, moody blue registration, dry fill loss, and sparse foreground scratches. KIVAL carries slightly denser paper coverage while EVAN stays more skeletal. A dragged blue-black field and thin cross-word cuts embed the title in the lower poster artwork without obscuring the portrait.
- Portrait (`InkPortrait`): offset plates, restrained edge splatter, and pigment frame one high-contrast core plate. A solid torn-edge mask keeps the complete face visible. Brush damage stays behind the core and concentrates around hair, shoulders, and the lower silhouette.
- The hero is one poster field rather than a row or stack of modules. The portrait emerges from the dense left ink mass, the single-line `KIVAL EVAN` wordmark anchors the lower artwork, and the biography sits in an irregular black reading pocket on the right. Compact social stamps remain near the portrait without a shared white panel. Phones keep the same hierarchy through a cropped portrait, one-line wordmark, black biography pocket, and compact social cluster.
- Header navigation uses condensed display labels, a broken underline, and a torn off-white active stamp. It has no brackets or decorative numbering.
- `SectionHeading` gives Featured, Skills, and Hardware consistent type with different material rules. The headings contain no indexes or eyebrow copy.
- Featured video keeps a standard rectangular player. Its paper mount is decorative and separate from the stable 16:9 media box. Homepage sections use `overflow-x: clip` and visible vertical overflow, which prevents nested scrolling. Astro loads the Svelte component with `client:visible`.
- Skills use repeated print fragments with selected oversized labels, rough underlines, inventory stamps, and irregular baselines. One degraded paper drag and its fading spray anchor part of the tag field.
- Hardware uses measurement ticks, thin callout frames, and damaged rules. The lists stay clear and factual.
- The footer uses a labelled, low-contrast social strip and a torn Ko-fi action. One large `KIVAL EVAN` proof mark closes the page with dying red and navy residue. The mark stays behind functional content, which remains in normal document flow.
- Entrance motion and passive motion are separate. Passive title glitches briefly substitute characters without replaying the entrance or showing full blocks.
- Hover and keyboard focus scale printed controls by 5% over 160ms. Their paper edges change every 0.75–1.25 seconds while active.
- Passive control poses freeze during hover or focus. The active paper shape can still change without moving the label or click target.
- Homepage passive events share a 12-second cycle with a two-second quiet window for new events.
- Passive event groups have at least 350ms between starts. Controls defer during the final 500ms before a scheduled title event.
- Deferrals preserve the queued event. They do not restart its full random interval or reset a held pose.
- Interactive hover responses remain independent of the passive rhythm. Other routes retain their existing control cadence.

### Page Transitions

The shared header retains consistent dimensions and navigation positions across routes.
The home link sits on the right as a League Gothic wordmark.
The homepage replaces that link with a hidden, non-interactive slot of the same size.
Narrow screens use the same two-row header structure on every route.
The homepage excludes the shared page fade and uses its own one-time print reveals.

- Before client-side navigation swaps the page, fade out the current content over 180ms without spatial movement.
- Fade in the next page's structural content groups while they slide upward by 1.5rem over 650ms. Start the effect only when the group enters the viewport. Pause an unfinished effect when its group leaves the viewport. Use 90ms stagger steps for groups that become visible together, and cap the delay after eight groups. Split oversized wrappers into explicit stagger groups so each animation matches one visible content block.
- Keep content visible and unchanged by default. Apply transforms and opacity only during the transition. Cancel stale animations before the next navigation. Skip the sequence for reduced motion and pages without a stagger root, including the CV.

### Disclosure

- Use native `details` and `summary` for dense reference information that is not necessary for the first decision.
- Keep the summary target at least `2.75rem` high and describe the hidden content directly.
- Do not hide service status, core prices, delivery expectations, or the primary contact action.

### Inputs / Fields

- **Style:** Use a translucent panel background, a thin white border, white text, and compact horizontal padding.
- **Focus:** Change the field border to Signal Cyan and retain a two-pixel Signal Cyan outline with offset.
- **Checkboxes / Radios:** Use `1.25rem` native controls with Signal Red as the accent color.
- **Error:** Use a two-pixel Signal Red outline and the existing inline recovery message. Keep the Signal Cyan outline while the field has keyboard focus.
- **Disabled:** Keep labels readable, remove hover emphasis, and use the muted text color.

### Navigation

- Use bold uppercase Big Shoulders Display labels without decorative indexes.
- Mark the current page with a torn off-white stamp and crimson underline. The active state does not change the link width.
- Hover and focus use a muted-blue paper field, a visible focus outline, and the shared control scale response.
- Keep the navigation on one line and allow horizontal scrolling on narrow screens.
- Use this order for the primary navigation: Projects, Blog, Commissions.
- After client navigation, move focus to the new main content. For local section links, move focus to the target heading.

### CV Document

- Use CV Paper for the full canvas and CV Ink for text.
- Use CV Accent for the profile masthead, section icons, timeline stems, timeline markers, and horizontal rules.
- Set section labels in bold uppercase text with wide tracking.
- Use softly rounded CV skill tags with a faint white wash and a one-pixel CV Muted outline.
- Preserve the A4 print rules and exact print-color adjustment.

### Media Tiles

- Use square cover images with a directional dark shadow.
- Increase image scale and shadow strength on hover. Use a smaller scale response for keyboard focus.
- Keep descriptive text beside the image and let long names wrap.
- Reserve media dimensions before loading. Lazy-load below-fold media, show embed loading state until the frame responds, and provide a direct external fallback link.
- Start featured media with the first configured item. Change media only after the visitor uses the next-video control.

## Do's and Don'ts

### Do:

- **Do** preserve personal imagery and printed art when they give a page or media region its identity.
- **Do** use transparent panels, thin borders, and dividers to organize dense content.
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
- **Don't** apply the shard surface to the CV or weaken its print behavior.
