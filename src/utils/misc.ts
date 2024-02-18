/** Fisher–Yates shuffle algorithm. */
export function shuffle<T>(array: T[]): void {
   for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
   }
}

export function interleave<T, U>([x, ...xs]: T[], ys: U[] = []): (T | U)[] {
   return x === undefined
      ? ys // base: no x
      : [x, ...interleave(ys, xs)]; // inductive: some x
}

export function round(num: number, d = 0): number {
   const r = Math.pow(10, d);
   return Math.round(num * r) / r;
}
