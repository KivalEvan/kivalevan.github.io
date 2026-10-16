/**
 * Offline, nested ink coverage for stationary print reveals and page exits.
 * Run: node scripts/generate-print-coverage.mjs
 * No artwork masks are replaced; the generated values belong to clip-path.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { format, resolveConfig } from 'prettier';

const seed = 0x71c4a92d;
const retainedAreas = [0.08, 0.2, 0.36, 0.53, 0.7, 0.85, 0.95];
const step = 0.5;
const padding = 24;
const side = (100 + padding * 2) / step + 1;
// Half a sampling cell: retain border damage without shipping field samples.
const simplifyTolerance = 0.25;

function random(initial) {
   let state = initial;
   return () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
   };
}

function noise(x, y, salt) {
   const ix = Math.floor(x),
      iy = Math.floor(y);
   const hash = (a, b) => {
      let value = Math.imul(a, 374761393) ^ Math.imul(b, 668265263) ^ salt;
      value = Math.imul(value ^ (value >>> 13), 1274126177);
      return ((value ^ (value >>> 16)) >>> 0) / 2147483648 - 1;
   };
   const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
   const tx = fade(x - ix),
      ty = fade(y - iy);
   const top = hash(ix, iy) * (1 - tx) + hash(ix + 1, iy) * tx;
   const bottom = hash(ix, iy + 1) * (1 - tx) + hash(ix + 1, iy + 1) * tx;
   return top * (1 - ty) + bottom * ty;
}

function densityField() {
   const rand = random(seed);
   // Unequal overlapping deposits, not a regular lattice of growing circles.
   // Domain warping and four detail scales distort their shared contours.
   const pools = Array.from({ length: 11 }, () => ({
      x: -8 + rand() * 116,
      y: -8 + rand() * 116,
      rx: 10 + rand() * 16,
      ry: 7 + rand() * 19,
      angle: rand() * Math.PI,
      weight: 0.35 + rand() * 0.8,
   }));
   const values = new Float64Array(side * side);
   const interior = [];
   for (let row = 0; row < side; row += 1) {
      for (let column = 0; column < side; column += 1) {
         const x = column * step - padding,
            y = row * step - padding;
         const wx = x + 8 * noise(x / 26, y / 26, seed ^ 0x139b);
         const wy = y + 8 * noise(x / 26, y / 26, seed ^ 0x712d);
         let density = 0;
         for (const pool of pools) {
            const dx = wx - pool.x,
               dy = wy - pool.y;
            const u = (dx * Math.cos(pool.angle) + dy * Math.sin(pool.angle)) / pool.rx;
            const v = (-dx * Math.sin(pool.angle) + dy * Math.cos(pool.angle)) / pool.ry;
            density += pool.weight * Math.exp(-1.7 * (u * u + v * v));
         }
         density += 0.26 * noise(wx / 23, wy / 23, seed ^ 0x8271);
         density += 0.13 * noise(x / 10, y / 10, seed ^ 0x9173);
         density += 0.055 * noise(x / 4.5, y / 4.5, seed ^ 0x399b);
         density += 0.018 * noise(x / 1.8, y / 1.8, seed ^ 0x218f);
         // Continue the field beyond every visible edge before tapering it to
         // empty. Even near-full poses therefore contain only closed contours.
         density -= Math.max(0, -x, x - 100, -y, y - 100) * 0.12;
         values[row * side + column] = density;
         if (x >= 0 && x < 100 && y >= 0 && y < 100) interior.push(density);
      }
   }
   interior.sort((a, b) => a - b);
   return {
      values,
      thresholds: retainedAreas.map((area) => interior[Math.floor((1 - area) * interior.length)]),
   };
}

function traceContours(values, threshold) {
   const nodes = new Map();
   const horizontalCount = (side - 1) * side;
   const node = (x, y, vertical) => {
      const id = vertical ? horizontalCount + y * side + x : y * (side - 1) + x;
      if (!nodes.has(id)) {
         const a = values[y * side + x] - threshold;
         const b = values[y * side + x + (vertical ? side : 1)] - threshold;
         const t = a / (a - b);
         nodes.set(id, {
            point: [
               (x + (vertical ? 0 : t)) * step - padding,
               (y + (vertical ? t : 0)) * step - padding,
            ],
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
   for (let y = 0; y < side - 1; y += 1) {
      for (let x = 0; x < side - 1; x += 1) {
         const i = y * side + x;
         const tl = values[i] - threshold,
            tr = values[i + 1] - threshold;
         const br = values[i + side + 1] - threshold,
            bl = values[i + side] - threshold;
         const code = (tl > 0 ? 1 : 0) | (tr > 0 ? 2 : 0) | (br > 0 ? 4 : 0) | (bl > 0 ? 8 : 0);
         if (code === 0 || code === 15) continue;
         let pairs = cases[code];
         // The bilinear asymptotic decider fixes saddle connectivity from the
         // same scalar field at every threshold; exact ties use the same branch.
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
   const visited = new Set(),
      contours = [];
   for (const start of nodes.keys()) {
      if (visited.has(start)) continue;
      const contour = [];
      let previous,
         current = start;
      do {
         const entry = nodes.get(current);
         if (entry.neighbors.length !== 2 || visited.has(current))
            throw Error('Open or intersecting print coverage contour.');
         contour.push(entry.point);
         visited.add(current);
         const next = entry.neighbors.find((id) => id !== previous);
         previous = current;
         current = next;
      } while (current !== start);
      contours.push(contour);
   }
   return contours;
}

function simplify(contour) {
   const points = [...contour, contour[0]];
   const keep = new Uint8Array(points.length);
   keep[0] = keep[points.length - 1] = 1;
   const stack = [[0, points.length - 1]];
   while (stack.length) {
      const [first, last] = stack.pop();
      const [ax, ay] = points[first],
         [bx, by] = points[last];
      const dx = bx - ax,
         dy = by - ay,
         length = dx * dx + dy * dy;
      let maximum = simplifyTolerance ** 2,
         farthest = -1;
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
   // Never discard a tiny island or hole independently at one threshold.
   return (ring.length >= 3 ? ring : contour).map((point) =>
      point.map((n) => Math.round(n * 10) / 10),
   );
}

export function createCoverage() {
   const { values, thresholds } = densityField();
   return thresholds.map((threshold, i) => ({
      retainedArea: retainedAreas[i],
      threshold,
      contours: traceContours(values, threshold).map(simplify),
   }));
}

function stylesheet(poses) {
   const data = poses
      .map(
         ({ contours }, i) =>
            `   // ${retainedAreas[i] * 100}% retained area before contour simplification.\n   (\n${contours.map((ring) => `      (${ring.map(([x, y]) => `${x} ${y}`).join(', ')}),`).join('\n')}\n   ),`,
      )
      .join('\n');
   return `// Generated by scripts/generate-print-coverage.mjs; seed 0x${seed.toString(16)}.
// Clip coverage only: keep authored mask-image/material masks unchanged.
@use 'sass:list';
@use 'sass:math';
@use 'sass:string';

$-contours: (
${data}
);

@function -point($point, $viewport, $relative: false) {
   $x: list.nth($point, 1);
   $y: list.nth($point, 2);
   @if $viewport {
      $top: 'var(--print-exit-top)';
      $unit: 'var(--print-exit-unit)';
      @if $viewport == shared {
         $top: 'var(--_pc-t)';
         $unit: 'var(--_pc-u)';
      }
      @if $relative { @return '#{$x}% calc(#{$y} * #{$unit})'; }
      @return '#{$x}% calc(#{$top} + #{$y} * #{$unit})';
   }
   @return '#{$x}% #{$y}%';
}

@function -midpoint($a, $b) {
   @return math.div(list.nth($a, 1) + list.nth($b, 1), 2)
      math.div(list.nth($a, 2) + list.nth($b, 2), 2);
}

@function -pose($contours, $viewport, $curved) {
   $path: '';
   @each $ring in $contours {
      $count: list.length($ring);
      @if $curved {
         $start: -midpoint(list.nth($ring, $count), list.nth($ring, 1));
         $move: 'move to';
         @if $path == '' { $move: 'evenodd from'; }
         $path: '#{$path}#{$move} #{-point($start, $viewport)}, ';
         @for $i from 1 through $count {
            $point: list.nth($ring, $i);
            $next: list.nth($ring, ($i % $count) + 1);
            $end: -midpoint($point, $next);
            @if $i == 1 {
               $path: '#{$path}curve to #{-point($end, $viewport)} with #{-point($point, $viewport)} from origin, ';
            } @else {
               // Exact midpoint endpoints reflect the preceding control onto
               // the next contour vertex, so smooth commands cannot drift.
               $delta: (list.nth($end, 1) - list.nth($start, 1)) (list.nth($end, 2) - list.nth($start, 2));
               $path: '#{$path}smooth by #{-point($delta, $viewport, true)}, ';
            }
            $start: $end;
         }
         $path: '#{$path}close, ';
      } @else {
         // Every ring returns over the identical zero-area bridge. Even-odd
         // fill preserves disconnected deposits AND holes, regardless of winding.
         $path: '#{$path}#{-point(0 0, $viewport)}, ';
         @each $point in $ring { $path: '#{$path}#{-point($point, $viewport)}, '; }
         $path: '#{$path}#{-point(list.nth($ring, 1), $viewport)}, #{-point(0 0, $viewport)}, ';
      }
   }
   $path: string.slice($path, 1, -3);
   @if $curved { @return string.unquote('shape(#{$path})'); }
   @return string.unquote('polygon(evenodd, #{$path})');
}

// Put viewport poses on the clipped element: --print-exit-top and
// --print-exit-unit must resolve there. Own-element poses may be inherited.
// These variables are lengths; one unit is 1% of the captured viewport height.
// Include once for polygon fallback, then with $curved:true in a shape @supports.
@mixin poses($viewport: false, $curved: true) {
   $prefix: 'print-coverage';
   @if $viewport { $prefix: 'print-exit-coverage'; }
   @for $level from 1 through list.length($-contours) {
      --#{$prefix}-#{$level}: #{-pose(list.nth($-contours, $level), $viewport, $curved)};
   }
}

// Prefer this root-level mixin when both coordinate modes ship together. It
// emits the geometry once for both selectors, rather than doubling the CSS.
// Aliases resolve locally BEFORE inheritance: the exit cannot retarget any
// descendant's already-resolved own-element --print-coverage-* values.
// Pass the same two selectors in the fallback and curved @supports calls.
@mixin shared-poses($reveal-selector, $exit-selector, $curved: true) {
   #{$reveal-selector}, #{$exit-selector} {
      @for $level from 1 through list.length($-contours) {
         --_print-coverage-#{$level}: #{-pose(list.nth($-contours, $level), shared, $curved)};
      }
   }
   #{$reveal-selector} {
      --_pc-t: 0%;
      --_pc-u: 1%;
      @for $level from 1 through list.length($-contours) {
         --print-coverage-#{$level}: var(--_print-coverage-#{$level});
      }
   }
   #{$exit-selector} {
      --_pc-t: var(--print-exit-top);
      --_pc-u: var(--print-exit-unit);
      @for $level from 1 through list.length($-contours) {
         --print-exit-coverage-#{$level}: var(--_print-coverage-#{$level});
      }
   }
}

// 1..7 retain approximately 8, 20, 36, 53, 70, 85 and 95 percent respectively.
// The caller owns empty/full poses, cadence, cancellation and reduced motion.
@function coverage($level, $viewport: false) {
   @if $level < 1 or $level > 7 or math.floor($level) != $level {
      @error 'Print coverage level must be an integer from 1 through 7.';
   }
   $prefix: 'print-coverage';
   @if $viewport { $prefix: 'print-exit-coverage'; }
   @return string.unquote('var(--#{$prefix}-#{$level})');
}
`;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
   const poses = createCoverage();
   const output = new URL('../src/styles/generated/_print-coverage.scss', import.meta.url);
   await mkdir(new URL('.', output), { recursive: true });
   const source = await format(stylesheet(poses), {
      ...(await resolveConfig(output)),
      filepath: fileURLToPath(output),
   });
   await writeFile(output, source);
   console.log(
      `Print coverage: ${poses.map(({ contours }) => contours.reduce((sum, ring) => sum + ring.length, 0)).join('/')} vertices; ${Buffer.byteLength(source)} bytes.`,
   );
}
