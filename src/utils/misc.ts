export function round(num: number, d = 0): number {
   const r = Math.pow(10, d);
   return Math.round(num * r) / r;
}
