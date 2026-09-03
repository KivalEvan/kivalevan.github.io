const WIDTH = 640;
const ROW_TOPS = [7, 30, 53, 76, 99];

const round = (value: number) => Math.round(value * 10) / 10;
const between = (minimum: number, maximum: number) => minimum + Math.random() * (maximum - minimum);

const points = (coordinates: Array<[number, number]>) =>
   coordinates.map(([x, y]) => `${round(x)},${round(y)}`).join(' ');

const tornStrip = (left: number, right: number, top: number, height: number, slant: number) => {
   const third = (right - left) / 3;
   const bottom = top + height;

   return points([
      [left, top + between(0.6, 2.1)],
      [left + third * 0.15, top + between(0, 1.6)],
      [left + third * 0.68, top + between(0.2, 1.9)],
      [left + third * 1.35, top + slant + between(-0.7, 1.3)],
      [left + third * 2.2, top + slant + between(-0.3, 1.8)],
      [right, top + slant + between(0.7, 2.1)],
      [right - between(0.5, 1.8), bottom + slant - between(0.2, 1.5)],
      [left + third * 2.4, bottom + slant - between(0, 1.8)],
      [left + third * 1.55, bottom + slant - between(0.1, 1.7)],
      [left + third * 0.72, bottom - between(0, 1.9)],
      [left + third * 0.18, bottom - between(0.1, 1.6)],
      [left + between(0.4, 1.7), bottom - between(0.5, 1.8)],
   ]);
};

const createRow = (rowTop: number) => {
   const fragments = 2 + Math.floor(Math.random() * 4);
   const leftInset = between(4, 18);
   const rightInset = between(1, 14);
   const gaps = Array.from({ length: fragments - 1 }, () => between(7, 14));
   const gapTotal = gaps.reduce((total, gap) => total + gap, 0);
   const usableWidth = WIDTH - leftInset - rightInset - gapTotal;
   const weights = Array.from({ length: fragments }, () => between(0.7, 1.45));
   const weightTotal = weights.reduce((total, weight) => total + weight, 0);
   const height = between(9.2, 10.8);
   let cursor = leftInset;

   return weights.map((weight, index) => {
      const width = (usableWidth * weight) / weightTotal;
      const strip = tornStrip(
         cursor,
         cursor + width,
         rowTop + between(-1, 1),
         height,
         between(-1.6, 1.6),
      );
      cursor += width + (gaps[index] ?? 0);
      return strip;
   });
};

/**
 * Creates the polygon coordinates for a 640-by-120 torn-paper strip layer.
 * These are inserted into a persistent inline SVG so changing the geometry
 * never asks CSS to load or rasterize a new mask resource.
 */
export const createStripPolygons = (): string[] => ROW_TOPS.flatMap(createRow);
