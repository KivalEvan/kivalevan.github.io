#!/usr/bin/env node
// Deterministic punk-ink SVG asset generator. Fixed seed: no layout shift.
// Run: node scripts/generate-ink-assets.mjs
// Output: src/assets/ink/*.svg (original, no third-party art).
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'ink');
mkdirSync(root, { recursive: true });

// Seeded PRNG so every run bakes identical assets.
const mulberry32 = (seed) => () => {
   seed |= 0;
   seed = (seed + 0x6d2b79f5) | 0;
   let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
   t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
   return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const fmt = (n) => Math.round(n * 10) / 10;
const polar = (cx, cy, r, a) => [fmt(cx + r * Math.cos(a)), fmt(cy + r * Math.sin(a))];

// Irregular blot: noisy closed polygon around a center.
const blot = (rand, cx, cy, base, wobble, points = 26) => {
   const pts = [];
   for (let i = 0; i < points; i += 1) {
      const a = (i / points) * Math.PI * 2;
      const r = base * (1 + (rand() - 0.5) * 2 * wobble);
      pts.push(polar(cx, cy, r, a).join(','));
   }
   return `M${pts.join('L')}Z`;
};

const pooledBlot = (rand, cx, cy, base, wobble, points = 38) => {
   const pts = [];
   for (let i = 0; i < points; i += 1) {
      const a = (i / points) * Math.PI * 2;
      const slow = 1 + Math.sin(a * 3 + 0.8) * 0.12 + Math.sin(a * 5 + 2.1) * 0.06;
      const r = base * (slow + (rand() - 0.5) * 2 * wobble);
      pts.push(polar(cx, cy, r, a));
   }
   const midpoint = (a, b) => [fmt((a[0] + b[0]) / 2), fmt((a[1] + b[1]) / 2)];
   let path = `M${midpoint(pts.at(-1), pts[0]).join(',')}`;
   for (let i = 0; i < points; i += 1) {
      path += `Q${pts[i].join(',')} ${midpoint(pts[i], pts[(i + 1) % points]).join(',')}`;
   }
   return `${path}Z`;
};

// An anisotropic deposit with uneven lobes. It produces no perfect circles.
const deposit = (rand, cx, cy, rx, ry, rotation = 0, wobble = 0.32, points = 22) => {
   const pts = [];
   const phase = rand() * Math.PI * 2;
   const cosR = Math.cos(rotation);
   const sinR = Math.sin(rotation);
   for (let i = 0; i < points; i += 1) {
      const a = (i / points) * Math.PI * 2;
      const lobe = 1 + Math.sin(a * 3 + phase) * 0.11 + Math.sin(a * 7 - phase) * 0.045;
      const edge = lobe + (rand() - 0.5) * 2 * wobble;
      const lx = Math.cos(a) * rx * edge;
      const ly = Math.sin(a) * ry * edge;
      pts.push(`${fmt(cx + lx * cosR - ly * sinR)},${fmt(cy + lx * sinR + ly * cosR)}`);
   }
   return `M${pts.join('L')}Z`;
};

const dots = (rand, count, x0, x1, y0, y1, r0, r1) => {
   let s = '';
   for (let i = 0; i < count; i += 1) {
      const x = fmt(x0 + rand() * (x1 - x0));
      const y = fmt(y0 + rand() * (y1 - y0));
      const r = fmt(r0 + rand() * (r1 - r0));
      s += `<circle cx="${x}" cy="${y}" r="${r}"/>`;
   }
   return s;
};

// Heavy impact: merged pools, directional ejecta, edge islands, and scraped holes.
const heavyImpact = (seed, size = 420, direction = -0.28) => {
   const rand = mulberry32(seed);
   const ox = size * 0.36;
   const oy = size * 0.56;
   let solid = '';
   const merged = [
      [0, 0, 0.19, 0.15, 0],
      [-0.11, -0.05, 0.13, 0.1, -0.35],
      [0.1, 0.035, 0.14, 0.095, 0.42],
      [-0.02, 0.1, 0.11, 0.075, -0.08],
   ];
   for (const [dx, dy, rx, ry, rotation] of merged) {
      solid += `<path d="${deposit(rand, ox + size * dx, oy + size * dy, size * rx, size * ry, rotation, 0.29, 34)}" fill="white"/>`;
   }
   for (let i = 0; i < 8; i += 1) {
      const a = direction + (rand() - 0.5) * 1.45;
      const d = size * (0.18 + rand() * 0.42);
      const [x, y] = polar(ox, oy, d, a);
      solid += `<path d="${deposit(rand, x, y, size * (0.035 + rand() * 0.12), size * (0.005 + rand() * 0.016), a, 0.48, 12)}" fill="white"/>`;
   }
   for (let i = 0; i < 26; i += 1) {
      const a = direction + (rand() - 0.5) * (i < 18 ? 1.75 : 4.2);
      const d = size * (0.17 + rand() ** 0.72 * 0.48);
      const [x, y] = polar(ox, oy, d, a);
      const r = size * (0.004 + rand() ** 2 * 0.023);
      solid += `<path d="${deposit(rand, x, y, r * (1.2 + rand() * 2.4), r, a, 0.58, 8 + Math.floor(rand() * 5))}" fill="white" opacity="${(0.52 + rand() * 0.48).toFixed(2)}"/>`;
   }
   let holes = '';
   for (let i = 0; i < 17; i += 1) {
      const x = ox + (rand() - 0.5) * size * 0.3;
      const y = oy + (rand() - 0.5) * size * 0.22;
      const r = size * (0.003 + rand() * 0.017);
      holes += `<path d="${deposit(rand, x, y, r * (1.1 + rand()), r, rand() * Math.PI, 0.65, 8)}" fill="black"/>`;
   }
   for (let i = 0; i < 7; i += 1) {
      const x = ox - size * 0.15 + rand() * size * 0.28;
      const y = oy - size * 0.12 + rand() * size * 0.24;
      holes += `<path d="M${fmt(x)},${fmt(y)}q${fmt(size * (0.04 + rand() * 0.14))},${fmt((rand() - 0.5) * size * 0.025)} ${fmt(size * (0.12 + rand() * 0.18))},${fmt((rand() - 0.5) * size * 0.04)}" fill="none" stroke="black" stroke-width="${fmt(0.8 + rand() * 3.6)}"/>`;
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" aria-hidden="true"><defs><filter id="impact-edge-${seed}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.09" numOctaves="2" seed="${seed % 79}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5"/></filter><mask id="impact-mask-${seed}"><rect width="100%" height="100%" fill="black"/>${solid}${holes}</mask></defs><rect width="100%" height="100%" fill="currentColor" mask="url(#impact-mask-${seed})" filter="url(#impact-edge-${seed})"/></svg>`;
};

// Dry explosive ink: granular fibrous fragments with no smooth central stamp.
const dryExplosive = (seed, size = 360, direction = 0.4) => {
   const rand = mulberry32(seed);
   const ox = size * 0.43;
   const oy = size * 0.54;
   let body = '';
   for (let i = 0; i < 86; i += 1) {
      const a = direction + (rand() - 0.5) * (i < 60 ? 2.2 : 5.5);
      const d = size * (0.025 + rand() ** 1.55 * 0.55);
      const [x, y] = polar(ox, oy, d, a);
      const r = size * (0.002 + rand() ** 2.3 * (i < 14 ? 0.042 : 0.018));
      body += `<path d="${deposit(rand, x, y, r * (1.1 + rand() * 3.8), Math.max(0.7, r * (0.42 + rand())), a, 0.78, 5 + Math.floor(rand() * 5))}" opacity="${(0.28 + rand() * 0.72).toFixed(2)}"/>`;
   }
   for (let i = 0; i < 10; i += 1) {
      const a = direction + (rand() - 0.5) * 1.7;
      const [x, y] = polar(ox, oy, size * (0.08 + rand() * 0.26), a);
      body += `<path d="${deposit(rand, x, y, size * (0.045 + rand() * 0.1), size * (0.002 + rand() * 0.009), a, 0.7, 7)}"/>`;
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="currentColor" aria-hidden="true"><g filter="url(#dry-${seed})">${body}</g><defs><filter id="dry-${seed}" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="${seed % 73}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter></defs></svg>`;
};

// Dragged impact: one deposit followed by broken, thinning pigment trails.
const draggedImpact = (seed, size = 460, direction = -0.18) => {
   const rand = mulberry32(seed);
   const ox = size * 0.24;
   const oy = size * 0.57;
   let white = `<path d="${deposit(rand, ox, oy, size * 0.13, size * 0.105, direction, 0.42, 30)}" fill="white"/>`;
   for (let i = 0; i < 17; i += 1) {
      const d = size * (0.08 + i * 0.031 + rand() * 0.035);
      const a = direction + (rand() - 0.5) * 0.42;
      const [x, y] = polar(ox, oy, d, a);
      const tail = 1 - i / 22;
      white += `<path d="${deposit(rand, x, y, size * (0.035 + rand() * 0.075) * tail, size * (0.004 + rand() * 0.013) * tail, a, 0.58, 9)}" fill="white" opacity="${(0.38 + rand() * 0.58).toFixed(2)}"/>`;
   }
   let holes = '';
   for (let i = 0; i < 13; i += 1) {
      const x = ox + (rand() - 0.5) * size * 0.17;
      const y = oy + (rand() - 0.5) * size * 0.14;
      holes += `<path d="${deposit(rand, x, y, size * (0.004 + rand() * 0.018), size * (0.002 + rand() * 0.009), direction, 0.64, 7)}" fill="black"/>`;
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" aria-hidden="true"><defs><mask id="dragged-impact-${seed}"><rect width="100%" height="100%" fill="black"/>${white}${holes}</mask></defs><rect width="100%" height="100%" fill="currentColor" mask="url(#dragged-impact-${seed})"/></svg>`;
};

// Fine directional spray: deposits cluster at the source and stretch along travel.
const sprayFine = (seed, size = 300, count = 70, direction = -0.25) => {
   const rand = mulberry32(seed);
   const ox = size * (direction > 1 ? 0.72 : 0.2);
   const oy = size * 0.58;
   let body = '';
   for (let i = 0; i < count; i += 1) {
      const t = rand() ** 1.65;
      const a = direction + (rand() + rand() + rand() - 1.5) * 1.05;
      const d = size * (0.03 + t * 0.72);
      const x = ox + Math.cos(a) * d + (rand() - 0.5) * size * 0.025;
      const y = oy + Math.sin(a) * d + (rand() - 0.5) * size * 0.025;
      const r = Math.max(0.45, size * (0.002 + (1 - t) * rand() ** 2 * 0.008));
      body += `<path d="${deposit(rand, x, y, r * (1.25 + rand() * 3.4), r * (0.45 + rand() * 0.75), a, 0.66, 6 + Math.floor(rand() * 4))}" opacity="${(0.3 + rand() * 0.7).toFixed(2)}"/>`;
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="currentColor" aria-hidden="true">${body}</svg>`;
};

// Dry brush: stacked broken horizontal strokes with bristle gaps and tapered ends.
const drybrush = (
   seed,
   { w = 640, h = 120, bands = 5, diagonal = false, fill = 'currentColor' },
) => {
   const rand = mulberry32(seed);
   let body = '';
   for (let b = 0; b < bands; b += 1) {
      const y = (h / bands) * (b + 0.5) + (rand() - 0.5) * 6;
      const thick = 5 + rand() * 9;
      let x = rand() * 20;
      const skew = diagonal ? (rand() - 0.5) * 40 : 0;
      while (x < w - 8) {
         const seg = 24 + rand() * 90;
         const gap = rand() < 0.3 ? 10 + rand() * 26 : 2 + rand() * 7;
         const x1 = Math.min(x + seg, w);
         const taper = 1 + rand() * 3;
         body += `<polygon points="${fmt(x)},${fmt(y - thick / 2)} ${fmt(x1)},${fmt(y - thick / 2 + skew * 0.1)} ${fmt(x1 - taper)},${fmt(y + thick / 2)} ${fmt(x)},${fmt(y + thick / 2 - skew * 0.1)}"/>`;
         x += seg + gap;
      }
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="${fill}" aria-hidden="true">${body}</svg>`;
};

// Drips: vertical runs with droplets at the ends.
const drips = (seed, w = 220, h = 320, count = 9) => {
   const rand = mulberry32(seed);
   let body = '';
   for (let i = 0; i < count; i += 1) {
      const x = 12 + rand() * (w - 24);
      const len = h * (0.25 + rand() * 0.7);
      const y0 = rand() * h * 0.12;
      const wd = 2.5 + rand() * (rand() < 0.25 ? 9 : 4);
      body += `<rect x="${fmt(x - wd / 2)}" y="${fmt(y0)}" width="${fmt(wd)}" height="${fmt(len)}" rx="${fmt(wd / 2)}"/>`;
      if (rand() < 0.7)
         body += `<circle cx="${fmt(x)}" cy="${fmt(y0 + len + 3 + rand() * 6)}" r="${fmt(1.5 + rand() * 3.5)}"/>`;
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="currentColor" aria-hidden="true">${body}</svg>`;
};

// Torn paper mass: dense jagged polygon with chewed edges.
const torn = (seed, w = 480, h = 360, teeth = 42) => {
   const rand = mulberry32(seed);
   const pts = [];
   const edge = (x0, y0, x1, y1) => {
      for (let i = 0; i <= teeth / 4; i += 1) {
         const t = i / (teeth / 4);
         const nx = x0 + (x1 - x0) * t + (rand() - 0.5) * w * 0.09;
         const ny = y0 + (y1 - y0) * t + (rand() - 0.5) * h * 0.11;
         pts.push(`${fmt(nx)},${fmt(ny)}`);
      }
   };
   edge(0, h * 0.12, w, 0);
   edge(w, 0, w * 0.94, h);
   edge(w * 0.94, h, 0, h * 0.9);
   edge(0, h * 0.9, 0, h * 0.12);
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="currentColor" aria-hidden="true"><path d="M${pts.join('L')}Z"/></svg>`;
};

// A torn frame with concentrated erosion, edge islands, toner holes, and dry ends.
const damagedFrame = (seed, w = 900, h = 620) => {
   const rand = mulberry32(seed);
   const pts = [];
   const edgePoints = 22;
   const edge = (x0, y0, x1, y1, normalX, normalY) => {
      for (let i = 0; i < edgePoints; i += 1) {
         const t = i / edgePoints;
         const coarse = Math.sin(t * Math.PI * (3 + Math.floor(rand() * 3)) + rand() * 2) * 0.012;
         const bite = rand() < 0.18 ? rand() * 0.035 : rand() * 0.011;
         const amount = (coarse + bite) * Math.min(w, h);
         pts.push(
            `${fmt(x0 + (x1 - x0) * t + normalX * amount)},${fmt(y0 + (y1 - y0) * t + normalY * amount)}`,
         );
      }
   };
   edge(w * 0.035, h * 0.045, w * 0.965, h * 0.02, 0, 1);
   edge(w * 0.965, h * 0.02, w * 0.985, h * 0.965, -1, 0);
   edge(w * 0.985, h * 0.965, w * 0.025, h * 0.985, 0, -1);
   edge(w * 0.025, h * 0.985, w * 0.035, h * 0.045, 1, 0);
   const outer = `M${pts.join('L')}Z`;
   let holes = '';
   const damageZones = [
      [0.14, 0.08, 0.18, 0.07],
      [0.84, 0.2, 0.13, 0.16],
      [0.72, 0.9, 0.2, 0.08],
      [0.08, 0.72, 0.07, 0.16],
   ];
   for (const [cx, cy, spreadX, spreadY] of damageZones) {
      for (let i = 0; i < 13; i += 1) {
         const x = w * (cx + (rand() - 0.5) * spreadX);
         const y = h * (cy + (rand() - 0.5) * spreadY);
         const rx = 1.5 + rand() * 15;
         const ry = 0.7 + rand() * 6;
         holes += `<path d="${deposit(rand, x, y, rx, ry, rand() * Math.PI, 0.68, 7 + Math.floor(rand() * 5))}" fill="black" opacity="${(0.48 + rand() * 0.52).toFixed(2)}"/>`;
      }
   }
   for (let i = 0; i < 14; i += 1) {
      const x = w * (0.04 + rand() * 0.9);
      const y = h * (rand() < 0.5 ? 0.05 + rand() * 0.12 : 0.83 + rand() * 0.12);
      holes += `<path d="M${fmt(x)},${fmt(y)}q${fmt(18 + rand() * 90)},${fmt((rand() - 0.5) * 12)} ${fmt(55 + rand() * 150)},${fmt((rand() - 0.5) * 18)}" fill="none" stroke="black" stroke-width="${fmt(0.7 + rand() * 3.8)}"/>`;
   }
   let islands = '';
   for (let i = 0; i < 12; i += 1) {
      const side = i % 4;
      const x =
         side === 1
            ? w * (0.94 + rand() * 0.045)
            : side === 3
              ? w * (0.01 + rand() * 0.05)
              : w * (0.08 + rand() * 0.84);
      const y =
         side === 0
            ? h * (0.02 + rand() * 0.055)
            : side === 2
              ? h * (0.91 + rand() * 0.065)
              : h * (0.08 + rand() * 0.84);
      islands += `<path d="${deposit(rand, x, y, 2 + rand() * 13, 1 + rand() * 6, rand() * Math.PI, 0.72, 7)}" fill="currentColor" opacity="${(0.38 + rand() * 0.58).toFixed(2)}"/>`;
   }
   let contamination = '';
   for (let i = 0; i < 18; i += 1) {
      const x = w * (0.04 + rand() * 0.92);
      const y = h * (rand() < 0.62 ? 0.03 + rand() * 0.12 : 0.82 + rand() * 0.14);
      contamination += `<path d="${deposit(rand, x, y, 2 + rand() * 14, 0.6 + rand() * 3.5, rand() * Math.PI, 0.7, 7)}" fill="#030305" opacity="${(0.18 + rand() * 0.38).toFixed(2)}"/>`;
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><filter id="frame-edge-${seed}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.018 0.095" numOctaves="3" seed="${seed % 61}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7"/></filter><mask id="frame-mask-${seed}"><rect width="100%" height="100%" fill="black"/><path d="${outer}" fill="white" filter="url(#frame-edge-${seed})"/>${holes}</mask></defs><rect width="100%" height="100%" fill="currentColor" mask="url(#frame-mask-${seed})"/>${islands}${contamination}</svg>`;
};

// Black erasure: heavy slab with bites taken out (holes punched via mask-like gaps).
const erasure = (seed, w = 560, h = 200) => {
   const rand = mulberry32(seed);
   let body = `<path d="${blot(rand, w / 2, h / 2, h * 0.42, 0.3, 30)}"/>`;
   // Bite holes: paint background-colored gaps by overlaying white? Instead emit as separate
   // cut path using evenodd with inner blobs.
   let holes = '';
   for (let i = 0; i < 7; i += 1) {
      holes += `<path d="${blot(rand, rand() * w, rand() * h, 8 + rand() * 22, 0.5, 14)}"/>`;
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true"><g fill="currentColor"><path d="${blot(rand, w / 2, h / 2, Math.min(w, h) * 0.46, 0.34, 34)}"/></g><g fill="black">${holes}</g></svg>`;
};

// Photocopy grain tile: turbulence + sparse speckles.
const grain = (seed = 77, size = 256) => {
   const rand = mulberry32(seed);
   const speck = dots(rand, 90, 0, size, 0, size, 0.4, 1.3);
   return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><filter id="t"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0.6 0.6 0 0"/></filter><rect width="${size}" height="${size}" filter="url(#t)" opacity="0.5"/><g fill="black" opacity="0.55">${speck}</g></svg>`;
};

// Macro organic ink mass: damaged edges, holes, detached islands, tapered
// extensions, scraped slits, uneven opacity. Two-scale edge noise (large
// lobes plus fine ripple) so it reads as pooled ink, not cut polygons.
const mass = (seed, w = 640, h = 480) => {
   const rand = mulberry32(seed);
   const cx = w * 0.46;
   const cy = h * 0.5;
   const base = Math.min(w, h) * 0.4;
   const p1 = rand() * Math.PI * 2;
   const p2 = rand() * Math.PI * 2;
   const pts = [];
   const N = 72;
   for (let i = 0; i < N; i += 1) {
      const a = (i / N) * Math.PI * 2;
      const lobe = 0.22 * Math.sin(3 * a + p1) + 0.13 * Math.sin(2 * a + p2);
      const ripple = (rand() - 0.5) * 0.07;
      pts.push(polar(cx, cy, base * (1 + lobe + ripple), a));
   }
   // Smooth closed curve through midpoints so edges pool instead of folding.
   const mid = (p, q) => [fmt((p[0] + q[0]) / 2), fmt((p[1] + q[1]) / 2)];
   let outer = `M${mid(pts[N - 1], pts[0]).join(',')}`;
   for (let i = 0; i < N; i += 1) {
      const m = mid(pts[i], pts[(i + 1) % N]);
      outer += `Q${pts[i].join(',')} ${m.join(',')}`;
   }
   outer += 'Z';
   // Two small detached islands hugging the mass edge; no interior holes or
   // slits, so the mass can never punch transparent gaps through text zones.
   let islands = '';
   for (let i = 0; i < 2; i += 1) {
      const a = rand() * Math.PI * 2;
      const d = base * (0.98 + rand() * 0.2);
      const [x, y] = polar(cx, cy, d, a);
      islands += `<path d="${blot(rand, x, y, 8 + rand() * 14, 0.45, 12)}" opacity="${(0.6 + rand() * 0.35).toFixed(2)}"/>`;
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="currentColor" aria-hidden="true"><path d="${outer}"/>${islands}</svg>`;
};

// Long directional dry-brush stroke with bristle gaps and tapered ends.
const strokeLong = (seed, w = 680, h = 140) => {
   const rand = mulberry32(seed);
   let body = '';
   for (let b = 0; b < 3; b += 1) {
      const y = h * (0.3 + b * 0.22) + (rand() - 0.5) * 8;
      const thick = 10 + rand() * 12;
      let x = 6 + rand() * 14;
      while (x < w - 10) {
         const seg = 40 + rand() * 110;
         const gap = rand() < 0.35 ? 12 + rand() * 30 : 2 + rand() * 6;
         const x1 = Math.min(x + seg, w - 4);
         const taper = 2 + rand() * 5;
         const wob = (rand() - 0.5) * 6;
         body += `<polygon points="${fmt(x)},${fmt(y - thick / 2)} ${fmt(x1)},${fmt(y - thick / 2 + wob)} ${fmt(x1 - taper)},${fmt(y + thick / 2)} ${fmt(x)},${fmt(y + thick / 2 + wob)}" opacity="${(0.7 + rand() * 0.3).toFixed(2)}"/>`;
         x += seg + gap;
      }
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="currentColor" aria-hidden="true">${body}</svg>`;
};

// Scraped diagonal ink: scattered uneven diagonal gashes, never neat rows.
const scrape = (seed, w = 520, h = 200, count = 6) => {
   const rand = mulberry32(seed);
   let body = '';
   for (let i = 0; i < count; i += 1) {
      const x = rand() * w * 0.85;
      const y = rand() * h * 0.75 + h * 0.08;
      const len = 40 + rand() * 150;
      const ang = (-14 - rand() * 42) * (Math.PI / 180);
      const dx = Math.cos(ang);
      const dy = Math.sin(ang);
      const th = 2 + rand() * 10;
      const segs = 1 + Math.floor(rand() * 3);
      let px = x;
      let py = y;
      for (let k = 0; k < segs; k += 1) {
         const sl = (len / segs) * (0.4 + rand() * 0.8);
         body += `<polygon points="${fmt(px)},${fmt(py - th / 2)} ${fmt(px + dx * sl)},${fmt(py + dy * sl - th / 2)} ${fmt(px + dx * sl)},${fmt(py + dy * sl + th / 2)} ${fmt(px)},${fmt(py + th / 2)}"/>`;
         px += dx * (sl + 10 + rand() * 30);
         py += dy * (sl + 10 + rand() * 30);
      }
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="currentColor" aria-hidden="true">${body}</svg>`;
};

// Single portrait-crossing gash: one down-right diagonal cut with two gaps.
const gash = (seed, w = 520, h = 90) => {
   const rand = mulberry32(seed);
   const ang = (5 + rand() * 4) * (Math.PI / 180);
   const dx = Math.cos(ang);
   const dy = Math.sin(ang);
   const th = 9 + rand() * 5;
   let body = '';
   let px = 8;
   let py = h * 0.32;
   const segs = [0.42, 0.2, 0.24];
   for (let k = 0; k < segs.length; k += 1) {
      const sl = w * segs[k];
      body += `<polygon points="${fmt(px)},${fmt(py - th / 2)} ${fmt(px + dx * sl)},${fmt(py + dy * sl - th / 2)} ${fmt(px + dx * sl)},${fmt(py + dy * sl + th / 2)} ${fmt(px)},${fmt(py + th / 2)}"/>`;
      px += dx * (sl + 26 + rand() * 18);
      py += dy * (sl + 26 + rand() * 18);
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="currentColor" aria-hidden="true">${body}</svg>`;
};

// Tangled filaments: thin wandering strokes crossing each other.
const filaments = (seed, w = 480, h = 300, count = 7) => {
   const rand = mulberry32(seed);
   let body = '';
   for (let i = 0; i < count; i += 1) {
      const x0 = rand() * w;
      const y0 = rand() * h;
      const x1 = x0 + (rand() - 0.5) * w * 0.9;
      const y1 = y0 + (rand() - 0.5) * h * 0.9;
      const x2 = x0 + (rand() - 0.5) * w * 1.1;
      const y2 = y0 + (rand() - 0.5) * h * 1.1;
      const sw = (1.4 + rand() * 2.2).toFixed(1);
      body += `<path d="M${fmt(x0)},${fmt(y0)}C${fmt(x1)},${fmt(y1)} ${fmt(x1 + (rand() - 0.5) * 60)},${fmt(y1 + (rand() - 0.5) * 60)} ${fmt(x2)},${fmt(y2)}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" opacity="${(0.6 + rand() * 0.4).toFixed(2)}"/>`;
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true">${body}</svg>`;
};

// Supporting directional impact. Seeds and directions produce independent deposits.
const impact = (seed, size = 380, direction = -0.5) => {
   return heavyImpact(seed, size, direction);
};

// Broad dragged pigment with a torn leading edge, tapering bristle tails,
// missing deposits, and directional scratches. Unlike drybrush(), this is one
// accumulated mark rather than a row of rectangular bands.
const organicDrag = (seed, w = 760, h = 220) => {
   const rand = mulberry32(seed);
   const upper = [];
   const lower = [];
   const steps = 38;
   for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const x = t * w;
      const envelope = Math.sin(Math.PI * t) ** 0.42;
      const center = h * (0.46 + 0.08 * Math.sin(t * 7.4 + 0.7) + (rand() - 0.5) * 0.055);
      const thick = h * envelope * (0.16 + 0.19 * rand());
      upper.push(`${fmt(x)},${fmt(center - thick)}`);
      lower.unshift(`${fmt(x)},${fmt(center + thick * (0.65 + rand() * 0.5))}`);
   }
   const body = `M${upper.join('L')}L${lower.join('L')}Z`;
   let holes = '';
   for (let i = 0; i < 34; i += 1) {
      const x = w * (0.05 + rand() * 0.9);
      const y = h * (0.27 + rand() * 0.46);
      const len = 8 + rand() * 88;
      const sw = 0.7 + rand() * 4.8;
      holes += `<path d="M${fmt(x)},${fmt(y)}q${fmt(len * 0.42)},${fmt((rand() - 0.5) * 7)} ${fmt(len)},${fmt((rand() - 0.5) * 11)}" fill="none" stroke="black" stroke-width="${fmt(sw)}" stroke-linecap="round"/>`;
   }
   let bristles = '';
   for (let i = 0; i < 17; i += 1) {
      const x = w * (0.48 + rand() * 0.5);
      const y = h * (0.23 + rand() * 0.55);
      const len = 45 + rand() * 185;
      bristles += `<path d="M${fmt(x)},${fmt(y)}q${fmt(len * 0.45)},${fmt((rand() - 0.5) * 18)} ${fmt(len)},${fmt((rand() - 0.5) * 28)}" fill="none" stroke="currentColor" stroke-width="${fmt(0.6 + rand() * 4.2)}" stroke-linecap="round" opacity="${(0.3 + rand() * 0.6).toFixed(2)}"/>`;
   }
   let crust = '';
   for (let i = 0; i < 6; i += 1) {
      const x = w * (0.12 + rand() * 0.62);
      const y = h * (0.34 + rand() * 0.28);
      crust += `<path d="${pooledBlot(rand, x, y, 8 + rand() * 24, 0.18 + rand() * 0.12, 24)}" fill="currentColor" opacity="${(0.78 + rand() * 0.21).toFixed(2)}"/>`;
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><filter id="drag-edge-${seed}" x="-8%" y="-18%" width="120%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.018 0.11" numOctaves="2" seed="${seed % 97}" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="9"/></filter><mask id="drag-mask-${seed}"><rect width="100%" height="100%" fill="black"/><path d="${body}" fill="white" filter="url(#drag-edge-${seed})"/>${holes}</mask></defs><rect width="100%" height="100%" fill="currentColor" mask="url(#drag-mask-${seed})" opacity="0.76"/>${crust}${bristles}</svg>`;
};

// Dense pooled ink made for a visible macro layer. Its alpha includes chewed
// holes, fibrous edge debris, long tendrils, and scraped-out pigment.
const heavyMass = (seed, w = 760, h = 560) => {
   const rand = mulberry32(seed);
   const cx = w * 0.46;
   const cy = h * 0.49;
   const rx = w * 0.35;
   const ry = h * 0.35;
   const points = [];
   const count = 104;
   for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI * 2;
      const lobe = 1 + 0.14 * Math.sin(3 * a + 0.6) + 0.09 * Math.sin(7 * a + 2.2);
      const tooth = (rand() - 0.5) * (i % 7 === 0 ? 0.18 : 0.055);
      points.push(
         `${fmt(cx + Math.cos(a) * rx * (lobe + tooth))},${fmt(cy + Math.sin(a) * ry * (lobe + tooth))}`,
      );
   }
   const outer = `M${points.join('L')}Z`;
   let holes = '';
   for (let i = 0; i < 19; i += 1) {
      const a = rand() * Math.PI * 2;
      const edge = 0.56 + rand() * 0.4;
      const x = cx + Math.cos(a) * rx * edge;
      const y = cy + Math.sin(a) * ry * edge;
      holes += `<path d="${blot(rand, x, y, 3 + rand() * 18, 0.72, 10 + Math.floor(rand() * 7))}" fill="black" opacity="${(0.42 + rand() * 0.58).toFixed(2)}"/>`;
   }
   const damageClusters = [
      [0.29, 0.28],
      [0.56, 0.42],
      [0.38, 0.69],
   ];
   for (const [clusterX, clusterY] of damageClusters) {
      for (let i = 0; i < 8; i += 1) {
         const x = w * clusterX + (rand() - 0.5) * w * 0.11;
         const y = h * clusterY + (rand() - 0.5) * h * 0.1;
         holes += `<path d="${blot(rand, x, y, 0.9 + rand() * 4.8, 0.66, 8)}" fill="black" opacity="${(0.45 + rand() * 0.54).toFixed(2)}"/>`;
      }
   }
   for (let i = 0; i < 13; i += 1) {
      const x = w * (0.08 + rand() * 0.75);
      const y = h * (0.12 + rand() * 0.73);
      holes += `<path d="M${fmt(x)},${fmt(y)}q${fmt(35 + rand() * 110)},${fmt((rand() - 0.5) * 22)} ${fmt(85 + rand() * 180)},${fmt((rand() - 0.5) * 34)}" fill="none" stroke="black" stroke-width="${fmt(0.8 + rand() * 5)}" stroke-linecap="round"/>`;
   }
   let debris = '';
   for (let i = 0; i < 24; i += 1) {
      const a = rand() * Math.PI * 2;
      const d = 1.01 + rand() * 0.25;
      const x = cx + Math.cos(a) * rx * d;
      const y = cy + Math.sin(a) * ry * d;
      const len = 3 + rand() * 17;
      const angle = rand() * Math.PI * 2;
      const dx = Math.cos(angle) * len;
      const dy = Math.sin(angle) * len;
      debris += `<path d="M${fmt(x)},${fmt(y)}q${fmt(dx * 0.38)},${fmt(dy * 0.38 + (rand() - 0.5) * 4)} ${fmt(dx)},${fmt(dy)}q${fmt(-dx * 0.46)},${fmt(-dy * 0.18 + (rand() - 0.5) * 3)} ${fmt(-dx)},${fmt(-dy)}Z" fill="currentColor" opacity="${(0.35 + rand() * 0.62).toFixed(2)}"/>`;
   }
   let tendrils = '';
   for (let i = 0; i < 8; i += 1) {
      const a = -1.1 + rand() * 2.5;
      const x = cx + Math.cos(a) * rx * 0.82;
      const y = cy + Math.sin(a) * ry * 0.82;
      const len = 45 + rand() * 145;
      tendrils += `<path d="M${fmt(x)},${fmt(y)}q${fmt(Math.cos(a) * len * 0.55)},${fmt(Math.sin(a) * len * 0.3 + (rand() - 0.5) * 35)} ${fmt(Math.cos(a) * len)},${fmt(Math.sin(a) * len + (rand() - 0.5) * 48)}" fill="none" stroke="currentColor" stroke-width="${fmt(0.8 + rand() * 5.5)}" stroke-linecap="round" opacity="${(0.45 + rand() * 0.48).toFixed(2)}"/>`;
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><filter id="mass-edge-${seed}" x="-12%" y="-12%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.035" numOctaves="3" seed="${seed % 89}" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="13"/></filter><mask id="mass-mask-${seed}"><rect width="100%" height="100%" fill="black"/><path d="${outer}" fill="white" filter="url(#mass-edge-${seed})"/>${holes}</mask></defs><rect width="100%" height="100%" fill="currentColor" mask="url(#mass-mask-${seed})"/>${debris}${tendrils}</svg>`;
};

// Uneven pigment deposit with multiple densities and scratches. This is used
// as a colour plate, so overlapping copies visibly contaminate one another.
const pigmentPool = (seed, w = 520, h = 330, erosion = 1) => {
   const rand = mulberry32(seed);
   let deposits = '';
   for (let i = 0; i < 8; i += 1) {
      const x = w * (0.12 + rand() * 0.72);
      const y = h * (0.16 + rand() * 0.68);
      const r = 24 + rand() * 72;
      const opacity = i < 3 ? 0.76 + rand() * 0.2 : 0.14 + rand() * 0.48;
      deposits += `<path d="${pooledBlot(rand, x, y, r, 0.22 + rand() * 0.12, 34 + Math.floor(rand() * 13))}" fill="currentColor" opacity="${opacity.toFixed(2)}"/>`;
   }
   let crust = '';
   for (let i = 0; i < 5; i += 1) {
      const x = w * (0.2 + rand() * 0.58);
      const y = h * (0.22 + rand() * 0.54);
      crust += `<path d="${pooledBlot(rand, x, y, 7 + rand() * 22, 0.25, 28)}" fill="currentColor" opacity="${(0.86 + rand() * 0.13).toFixed(2)}"/>`;
   }
   let grit = '';
   for (let i = 0; i < Math.round(92 * erosion); i += 1) {
      const x = rand() * w;
      const y = rand() * h;
      const rx = 0.4 + rand() * 3.4;
      const ry = 0.25 + rand() * Math.min(1.4, rx * 0.65);
      grit += `<ellipse cx="${fmt(x)}" cy="${fmt(y)}" rx="${fmt(rx)}" ry="${fmt(ry)}" transform="rotate(${fmt(rand() * 180)} ${fmt(x)} ${fmt(y)})" fill="currentColor" opacity="${(0.2 + rand() * 0.65).toFixed(2)}"/>`;
   }
   let cuts = '';
   for (let i = 0; i < Math.round(9 * erosion); i += 1) {
      const x = rand() * w * 0.72;
      const y = h * (0.16 + rand() * 0.7);
      cuts += `<path d="M${fmt(x)},${fmt(y)}q${fmt(40 + rand() * 80)},${fmt((rand() - 0.5) * 28)} ${fmt(100 + rand() * 170)},${fmt((rand() - 0.5) * 45)}" fill="none" stroke="var(--deposit-cut, #030305)" stroke-width="${fmt(0.8 + rand() * 4.5)}" opacity="${(0.25 + rand() * 0.5).toFixed(2)}"/>`;
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><filter id="pool-edge-${seed}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.025 0.07" numOctaves="2" seed="${seed % 83}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6"/></filter></defs><g filter="url(#pool-edge-${seed})">${deposits}</g>${crust}${grit}${cuts}</svg>`;
};

// Tangled linework mixes one heavy vein with finer offshoots. Broken dash
// arrays and varied widths make it read as dragged pigment, not vector wire.
const inkTangle = (seed, w = 720, h = 390) => {
   const rand = mulberry32(seed);
   let body = '';
   for (let i = 0; i < 10; i += 1) {
      const x0 = w * (-0.05 + rand() * 0.38);
      const y0 = h * (0.1 + rand() * 0.8);
      const x1 = w * (0.2 + rand() * 0.35);
      const y1 = h * (-0.2 + rand() * 1.4);
      const x2 = w * (0.61 + rand() * 0.4);
      const y2 = h * (0.04 + rand() * 0.92);
      const sw = i < 2 ? 5 + rand() * 7 : 0.7 + rand() * 3.4;
      const dash =
         i % 3 === 0
            ? ` stroke-dasharray="${fmt(22 + rand() * 48)} ${fmt(6 + rand() * 25)} ${fmt(2 + rand() * 7)} ${fmt(9 + rand() * 30)}"`
            : '';
      const hook = i % 4 === 0 ? h * (rand() < 0.5 ? -0.28 : 0.28) : 0;
      body += `<path d="M${fmt(x0)},${fmt(y0)}C${fmt(x1 * 0.68)},${fmt(y1 + hook)} ${fmt(x1)},${fmt(y1)} ${fmt(x1)},${fmt((y1 + y2) / 2)}S${fmt(x2 * 0.78)},${fmt(y2 - hook)} ${fmt(x2)},${fmt(y2)}" fill="none" stroke="currentColor" stroke-width="${fmt(sw)}" stroke-linecap="round"${dash} opacity="${(0.34 + rand() * 0.6).toFixed(2)}"/>`;
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true"><g filter="url(#tangle-rough-${seed})">${body}</g><defs><filter id="tangle-rough-${seed}" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="${seed % 71}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4"/></filter></defs></svg>`;
};

const scratchField = (seed, w = 520, h = 280) => {
   const rand = mulberry32(seed);
   let body = '';
   for (let i = 0; i < 34; i += 1) {
      const x = rand() * w * 0.92;
      const y = rand() * h;
      const len = 12 + rand() ** 1.7 * 175;
      const vertical = i % 5 === 0;
      const dx = vertical ? (rand() - 0.5) * 24 : len;
      const dy = vertical ? (rand() < 0.5 ? -1 : 1) * len * (0.5 + rand()) : (rand() - 0.5) * 98;
      const broken =
         i % 3 === 0
            ? ` stroke-dasharray="${fmt(6 + rand() * 24)} ${fmt(3 + rand() * 14)} ${fmt(1 + rand() * 5)} ${fmt(5 + rand() * 18)}"`
            : '';
      body += `<path d="M${fmt(x)},${fmt(y)}q${fmt(dx * 0.36 + (rand() - 0.5) * 18)},${fmt(dy * 0.72 + (rand() - 0.5) * 18)} ${fmt(dx)},${fmt(dy)}" fill="none" stroke="currentColor" stroke-width="${fmt(0.45 + rand() * (i < 5 ? 4.5 : 1.7))}" stroke-linecap="round"${broken} opacity="${(0.16 + rand() * 0.68).toFixed(2)}"/>`;
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><filter id="scratch-rough-${seed}" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="${seed % 67}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter></defs><g filter="url(#scratch-rough-${seed})">${body}</g></svg>`;
};

// Light alpha damage for selected printed letters and portrait fragments.
const xeroxMask = (seed, w = 320, h = 240) => {
   const rand = mulberry32(seed);
   let holes = '';
   for (let i = 0; i < 78; i += 1) {
      holes += `<path d="${blot(rand, rand() * w, rand() * h, 0.5 + rand() * 3.1, 0.75, 6)}" fill="black" opacity="${(0.28 + rand() * 0.7).toFixed(2)}"/>`;
   }
   for (let i = 0; i < 7; i += 1) {
      const x = rand() * w * 0.7;
      const y = rand() * h;
      holes += `<path d="M${fmt(x)},${fmt(y)}l${fmt(28 + rand() * 90)},${fmt((rand() - 0.5) * 18)}" stroke="black" stroke-width="${fmt(0.8 + rand() * 2.4)}"/>`;
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true"><rect width="100%" height="100%" fill="white"/>${holes}</svg>`;
};

const assets = {
   'splatter-cluster-1.svg': heavyImpact(101, 420, -0.24),
   'splatter-cluster-2.svg': dryExplosive(202, 360, 0.34),
   'splatter-cluster-3.svg': draggedImpact(303, 460, -0.16),
   'spray-fine-1.svg': sprayFine(404, 300, 88, -0.32),
   'spray-fine-2.svg': sprayFine(505, 260, 72, 2.72),
   'drybrush-1.svg': drybrush(606, { w: 640, h: 120, bands: 5, diagonal: false }),
   'drybrush-2.svg': drybrush(707, { w: 640, h: 160, bands: 4, diagonal: true }),
   'drybrush-paper.svg': drybrush(606, {
      w: 640,
      h: 120,
      bands: 5,
      diagonal: false,
      fill: '#ecebe6',
   }),
   'drip-cluster-1.svg': drips(808, 220, 320, 9),
   'torn-mass-1.svg': torn(909, 480, 360, 44),
   'torn-mass-2.svg': torn(1010, 420, 300, 36),
   'frame-mount-1.svg': damagedFrame(1061),
   'erasure-black-1.svg': erasure(1111, 560, 200),
   'grain-speckle-1.svg': grain(77, 256),
   'ink-mass-1.svg': mass(1212, 640, 480),
   'stroke-long-1.svg': strokeLong(1313, 680, 140),
   'scrape-diagonal-1.svg': scrape(1414, 520, 200, 7),
   'filament-red-1.svg': filaments(1515, 480, 300, 7),
   'filament-blue-1.svg': filaments(1616, 520, 300, 8),
   'impact-cluster-1.svg': impact(1717, 380, -0.45),
   'impact-cluster-2.svg': impact(1818, 340, 0.5),
   'impact-cluster-3.svg': impact(1919, 300, 2.65),
   'gash-portrait-1.svg': gash(2020, 520, 90),
   'heavy-ink-mass-1.svg': heavyMass(2121),
   'organic-drag-1.svg': organicDrag(2222),
   'organic-drag-2.svg': organicDrag(2323, 680, 250),
   'pigment-pool-red.svg': pigmentPool(2424),
   'pigment-pool-blue.svg': pigmentPool(2525, 580, 350, 1.55),
   'ink-tangle-red.svg': inkTangle(2626),
   'ink-tangle-blue.svg': inkTangle(2727, 760, 420),
   'scratch-field-1.svg': scratchField(2828),
   'xerox-mask-1.svg': xeroxMask(2929),
};

let total = 0;
for (const [name, svg] of Object.entries(assets)) {
   writeFileSync(join(root, name), `${svg}\n`);
   total += Buffer.byteLength(svg);
}
console.log(
   `wrote ${Object.keys(assets).length} ink assets to ${root} (${(total / 1024).toFixed(1)} KB total)`,
);
