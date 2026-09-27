interface PoseSequenceOptions {
   /** Authored pose rate, independent of the browser's refresh rate. */
   fps: 12 | 18 | 24;
   /** Number of held poses; each occupies one frame, including the final pose. */
   frames: number;
   onFrame: (frame: number) => void;
   onFinish?: () => void;
}

/**
 * Paint a finite sequence without interpolation. Frame zero paints synchronously;
 * later callbacks sample elapsed frames and skip overdue poses after a stall.
 * The caller owns visibility, eligibility and style restoration. The returned
 * cancel function stops future callbacks without restoring paint or calling onFinish.
 * Throws RangeError when frames is not a positive integer.
 */
export const playPoseSequence = ({ fps, frames, onFrame, onFinish }: PoseSequenceOptions) => {
   if (!Number.isInteger(frames) || frames < 1)
      throw new RangeError('frames must be a positive integer');
   const startedAt = performance.now();
   let previousFrame = 0;
   let animationFrame: number;
   let stopped = false;
   const update = (timestamp: number) => {
      if (stopped) return;
      const elapsedFrame = Math.floor(((timestamp - startedAt) * fps) / 1_000);
      const frame = Math.min(elapsedFrame, frames - 1);
      if (frame > previousFrame) {
         previousFrame = frame;
         onFrame(frame);
      }
      if (stopped) return;
      if (elapsedFrame >= frames) {
         stopped = true;
         onFinish?.();
         return;
      }
      animationFrame = requestAnimationFrame(update);
   };
   onFrame(0);
   animationFrame = requestAnimationFrame(update);
   return () => {
      stopped = true;
      cancelAnimationFrame(animationFrame);
   };
};
