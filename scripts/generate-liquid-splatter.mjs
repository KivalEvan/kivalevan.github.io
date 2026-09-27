/**
 * Build static splash artwork from a seeded, additive liquid-density field.
 * Run: node scripts/generate-liquid-splatter.mjs
 * Then regenerate mobile hero planes and collision groups. No solver, noise,
 * particles or SVG filters are shipped: the output contains traced contours only.
 */
import { writeFile } from 'node:fs/promises';

const samples = 6;
const threshold = 0.62;
const assets = new URL('../src/assets/ink/', import.meta.url);
const random = (seed) => () => {
   seed |= 0;
   seed = (seed + 0x6d2b79f5) | 0;
   let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
   value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
   return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

const recipes = [
   {
      name: 'print-splatter-field.svg',
      width: 640,
      height: 440,
      seed: 3131,
      fill: 'white',
      sites: [
         [300, 218, 55, 40, -0.58, 13],
         [142, 137, 28, 31, 2.6, 8],
         [480, 310, 37, 27, 0.35, 9],
         [515, 101, 21, 23, -1.3, 7],
         [138, 330, 17, 19, 2.9, 6],
      ],
   },
   {
      name: 'liquid-pool-red.svg',
      width: 520,
      height: 330,
      seed: 4141,
      fill: 'currentColor',
      sites: [
         [210, 184, 65, 44, -0.5, 13],
         [358, 95, 28, 23, 0.4, 8],
         [70, 215, 18, 22, 2.1, 5],
      ],
   },
   {
      name: 'liquid-pool-blue.svg',
      width: 580,
      height: 350,
      seed: 5151,
      fill: 'currentColor',
      sites: [
         [260, 160, 74, 42, 0.2, 14],
         [140, 240, 25, 31, -2.3, 8],
         [460, 260, 25, 16, 1.2, 6],
      ],
   },
];

function liquidField({ width, height, seed, sites }) {
   const rand = random(seed);
   // Detail has its own stream so changing the grain cannot move the main pools
   // or alter their jet trajectories by consuming the composition's randomness.
   const detail = random(seed ^ 0x51a77e);
   const columns = width * samples + 1;
   const rows = height * samples + 1;
   const values = new Float32Array(columns * rows);

   // Compact elliptical kernels merge into a single surface, including the
   // necks between nearby packets. This avoids overlapping circle outlines.
   const deposit = (cx, cy, radiusX, radiusY, angle, amount = 2) => {
      if (cx < 5 || cy < 5 || cx > width - 5 || cy > height - 5) return;
      const margin = Math.min(cx, cy, width - cx, height - cy) / 1.7;
      const scale = Math.min(1, margin / Math.max(radiusX, radiusY));
      const rx = radiusX * scale * 1.65;
      const ry = radiusY * scale * 1.65;
      const cos = Math.cos(angle),
         sin = Math.sin(angle);
      const extentX = Math.hypot(rx * cos, ry * sin);
      const extentY = Math.hypot(rx * sin, ry * cos);
      const left = Math.max(1, Math.floor((cx - extentX) * samples));
      const right = Math.min(columns - 2, Math.ceil((cx + extentX) * samples));
      const top = Math.max(1, Math.floor((cy - extentY) * samples));
      const bottom = Math.min(rows - 2, Math.ceil((cy + extentY) * samples));
      for (let y = top; y <= bottom; y += 1) {
         const dy = y / samples - cy;
         for (let x = left; x <= right; x += 1) {
            const dx = x / samples - cx;
            const u = (dx * cos + dy * sin) / rx;
            const v = (-dx * sin + dy * cos) / ry;
            const density = 1 - u * u - v * v;
            if (density > 0) values[y * columns + x] += amount * density ** 3;
         }
      }
   };

   for (const [cx, cy, rx, ry, direction, jetCount] of sites) {
      deposit(cx, cy, rx * 0.38, ry * 0.54, direction * 0.15, 1);
      for (let i = 0; i < 7; i += 1) {
         const angle = rand() * Math.PI * 2;
         const distance = 0.25 + rand() * 0.7;
         deposit(
            cx + Math.cos(angle) * rx * distance,
            cy + Math.sin(angle) * ry * distance,
            rx * (0.2 + rand() * 0.36),
            ry * (0.22 + rand() * 0.34),
            direction + rand() - 0.5,
         );
      }
      for (let jet = 0; jet < jetCount; jet += 1) {
         const angle = direction + (rand() - 0.5) * (jet < 4 ? 1.2 : Math.PI * 2);
         const cos = Math.cos(angle),
            sin = Math.sin(angle);
         const length = Math.min(rx, ry) * (1.4 + rand() * 2.5);
         const bend = (rand() - 0.5) * length * 1.2;
         const neck = Math.min(rx, ry) * (0.06 + rand() * 0.11);
         const breakup = 0.55 + rand() * 0.37;
         const phase = rand() * Math.PI * 2;
         const point = (t) => [
            cx + cos * (rx * 0.3 + length * t) - sin * bend * t * t,
            cy + sin * (ry * 0.3 + length * t) + cos * bend * t * t + 5 * t * t,
         ];
         const steps = Math.ceil((length / neck) * 2.8);
         for (let i = 0; i / steps < breakup; i += 1) {
            const t = i / steps;
            const [x, y] = point(t);
            const radius = neck * (1 - t * 0.84) * (1 + Math.sin(t * 22 + phase) * 0.2);
            deposit(x, y, radius, radius * 0.86, angle, 1.2);
         }
         // A stretched head and smaller following beads share the jet's path.
         // The gaps grow outward instead of scattering unrelated confetti.
         for (let t = breakup + 0.02; t < 1.5; t += 0.07 + rand() * 0.16) {
            const [x, y] = point(t);
            const radius = (neck * (0.18 + rand() * 0.36)) / t;
            const tangent = angle + Math.atan2(2 * bend * t, length);
            deposit(x, y, radius * (1.2 + rand()), radius, tangent);
            if (rand() < 0.6)
               deposit(x + radius * 0.8, y - radius * 0.4, radius * 0.7, radius * 0.6, tangent);
         }
         for (let i = 0; i < 17; i += 1) {
            const t = 0.5 + rand() * 1.1;
            const [x, y] = point(t);
            const spread = (rand() + rand() - 1) * length * 0.22;
            const radius = 0.25 + rand() ** 3 * neck * 0.48;
            deposit(x - sin * spread, y + cos * spread, radius * (1 + rand()), radius, angle);
         }
         // Fine atomized paint follows the existing spray envelope. Keep it near
         // the jets, rather than peppering the otherwise empty page with dots.
         for (let i = 0; i < 64; i += 1) {
            const t = 0.35 + detail() * 1.15;
            const [x, y] = point(t);
            const spread = (detail() + detail() - 1) * length * 0.2;
            const radius = 0.18 + detail() ** 2.6 * neck * 0.2;
            deposit(x - sin * spread, y + cos * spread, radius * (1 + detail()), radius, angle);
         }
      }
      // Missing thin film and entrained bubbles, mostly near the pool perimeter.
      for (let i = 0; i < 39; i += 1) {
         const angle = rand() * Math.PI * 2;
         const distance = 0.3 + rand() * 0.7;
         const radius =
            Math.min(rx, ry) * (i < 32 ? 0.018 + rand() ** 2 * 0.08 : 0.09 + rand() * 0.1);
         deposit(
            cx + Math.cos(angle) * rx * distance,
            cy + Math.sin(angle) * ry * distance,
            radius * (1.1 + rand()),
            radius,
            angle,
            i < 32 ? -5 : -9,
         );
      }
      // Small missing deposits give the pooled paint a gritty, porous interior.
      // Size the loss to local density so overlapping paint does not fill it in.
      const flecks = Math.ceil((rx * ry) / 4);
      for (let i = 0; i < flecks; i += 1) {
         const angle = detail() * Math.PI * 2;
         const distance = Math.sqrt(detail()) * 1.2;
         const x = cx + Math.cos(angle) * rx * distance;
         const y = cy + Math.sin(angle) * ry * distance;
         const density = values[Math.round(y * samples) * columns + Math.round(x * samples)];
         if (density < threshold) continue;
         const radius = 0.22 + detail() ** 2.8 * 1.6;
         deposit(x, y, radius * (1.1 + detail() * 1.4), radius, angle, -Math.max(3, density * 3));
      }
   }

   const noise = (spacing) => {
      const stride = Math.ceil(width / spacing) + 2;
      const grid = Float32Array.from(
         { length: stride * (Math.ceil(height / spacing) + 2) },
         () => rand() * 2 - 1,
      );
      return (x, y) => {
         const gx = x / spacing,
            gy = y / spacing;
         const ix = Math.floor(gx),
            iy = Math.floor(gy);
         const tx = gx - ix,
            ty = gy - iy;
         const sx = tx * tx * (3 - 2 * tx),
            sy = ty * ty * (3 - 2 * ty);
         const top = grid[iy * stride + ix] * (1 - sx) + grid[iy * stride + ix + 1] * sx;
         const bottom =
            grid[(iy + 1) * stride + ix] * (1 - sx) + grid[(iy + 1) * stride + ix + 1] * sx;
         return top * (1 - sy) + bottom * sy;
      };
   };
   const coarse = noise(7),
      fine = noise(1.3),
      grit = noise(0.45);
   for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
         const i = y * columns + x;
         const value = values[i];
         // Only the boundary band can cross the threshold; skip the rest.
         values[i] =
            value -
            threshold +
            (value > 0.1 && value < 1.2
               ? coarse(x / samples, y / samples) * 0.23 +
                 fine(x / samples, y / samples) * 0.28 +
                 grit(x / samples, y / samples) * 0.18
               : 0);
      }
   }
   return { values, columns, rows };
}

function traceContours({ values, columns, rows }) {
   const nodes = new Map();
   const horizontalCount = (columns - 1) * rows;
   const node = (x, y, vertical) => {
      const id = vertical ? horizontalCount + y * columns + x : y * (columns - 1) + x;
      if (!nodes.has(id)) {
         const a = values[y * columns + x];
         const b = values[y * columns + x + (vertical ? columns : 1)];
         const t = a / (a - b);
         nodes.set(id, {
            point: [(x + (vertical ? 0 : t)) / samples, (y + (vertical ? t : 0)) / samples],
            neighbors: [],
         });
      }
      return id;
   };
   const cases = {
      1: [[3, 0]],
      2: [[0, 1]],
      3: [[3, 1]],
      4: [[1, 2]],
      6: [[0, 2]],
      7: [[3, 2]],
      8: [[2, 3]],
      9: [[0, 2]],
      11: [[1, 2]],
      12: [[3, 1]],
      13: [[0, 1]],
      14: [[3, 0]],
   };
   for (let y = 0; y < rows - 1; y += 1) {
      for (let x = 0; x < columns - 1; x += 1) {
         const i = y * columns + x;
         const tl = values[i],
            tr = values[i + 1],
            br = values[i + columns + 1],
            bl = values[i + columns];
         const code = (tl > 0 ? 1 : 0) | (tr > 0 ? 2 : 0) | (br > 0 ? 4 : 0) | (bl > 0 ? 8 : 0);
         if (code === 0 || code === 15) continue;
         let pairs = cases[code];
         // Resolve saddle cells consistently so holes stay closed, not crossed.
         if (code === 5 || code === 10)
            pairs =
               tl * br > tr * bl
                  ? [
                       [0, 1],
                       [2, 3],
                    ]
                  : [
                       [3, 0],
                       [1, 2],
                    ];
         const edges = [
            [x, y, false],
            [x + 1, y, true],
            [x, y + 1, false],
            [x, y, true],
         ];
         for (const [a, b] of pairs) {
            const first = node(...edges[a]),
               second = node(...edges[b]);
            nodes.get(first).neighbors.push(second);
            nodes.get(second).neighbors.push(first);
         }
      }
   }
   const visited = new Set();
   const contours = [];
   for (const start of nodes.keys()) {
      if (visited.has(start)) continue;
      const contour = [];
      let previous,
         current = start;
      do {
         const entry = nodes.get(current);
         if (entry.neighbors.length !== 2 || visited.has(current))
            throw Error('Open or intersecting splash contour.');
         contour.push(entry.point);
         visited.add(current);
         const next = entry.neighbors.find((id) => id !== previous);
         previous = current;
         current = next;
      } while (current !== start);
      if (contour.length >= 4) contours.push(contour);
   }
   return contours;
}

function contourPath(contour) {
   const points = [...contour, contour[0]];
   const keep = new Uint8Array(points.length);
   keep[0] = keep[points.length - 1] = 1;
   const stack = [[0, points.length - 1]];
   // Simplify below a tenth of one source unit before smoothing the corners.
   while (stack.length) {
      const [first, last] = stack.pop();
      const [ax, ay] = points[first],
         [bx, by] = points[last];
      const dx = bx - ax,
         dy = by - ay,
         length = dx * dx + dy * dy;
      let farthest = -1,
         maximum = 0.08 ** 2;
      for (let i = first + 1; i < last; i += 1) {
         const [x, y] = points[i];
         const t = length ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / length)) : 0;
         const distance = (x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2;
         if (distance > maximum) {
            maximum = distance;
            farthest = i;
         }
      }
      if (farthest < 0) continue;
      keep[farthest] = 1;
      stack.push([first, farthest], [farthest, last]);
   }
   const ring = points.slice(0, -1).filter((_, i) => keep[i]);
   if (ring.length < 3) return '';
   const coord = (p) => p.map((n) => Math.round(n * 100) / 100).join(',');
   const midpoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
   let path = `M${coord(midpoint(ring.at(-1), ring[0]))}`;
   for (let i = 0; i < ring.length; i += 1)
      path += `Q${coord(ring[i])} ${coord(midpoint(ring[i], ring[(i + 1) % ring.length]))}`;
   return path + 'Z';
}

for (const recipe of recipes) {
   const contours = traceContours(liquidField(recipe));
   const paths = contours.map(contourPath).join('');
   const svg = `<!-- Generated by scripts/generate-liquid-splatter.mjs; seed ${recipe.seed}. -->\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${recipe.width} ${recipe.height}" preserveAspectRatio="none"><path fill="${recipe.fill}" fill-rule="evenodd" d="${paths}"/></svg>\n`;
   await writeFile(new URL(recipe.name, assets), svg);
   console.log(`${recipe.name}: ${contours.length} contours; ${Buffer.byteLength(svg)} bytes`);
}
