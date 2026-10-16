import Commission from './commission.json';

export type RatingDifficulty = 'expertPlus' | 'expert' | 'hard' | 'normal' | 'easy';
export type RatingLighting = `vanillaV${2 | 3}` | `chroma${'Basic' | 'Advanced'}` | 'lolighter';

export interface EstimateInput {
   duration: string;
   difficulty: Record<RatingDifficulty, boolean>;
   lighting: RatingLighting;
}

export const ADDITIONAL_DIFFICULTY_DISCOUNT = 0.25;
export const MAX_DURATION_SECONDS = 600;
export const rate = Commission.beatmap;
export const difficultyRename: Record<RatingDifficulty, string> = {
   expertPlus: 'Expert+',
   expert: 'Expert',
   hard: 'Hard',
   normal: 'Normal',
   easy: 'Easy',
};
export const difficulties: RatingDifficulty[] = ['expertPlus', 'expert', 'hard', 'normal', 'easy'];
export const lightingOptions: { id: RatingLighting; label: string }[] = [
   { id: 'chromaAdvanced', label: 'Chroma Advanced' },
   { id: 'chromaBasic', label: 'Chroma Basic' },
   { id: 'vanillaV3', label: 'Vanilla (v3)' },
   { id: 'vanillaV2', label: 'Vanilla (v2)' },
   { id: 'lolighter', label: 'Lolighter (automated lighting)' },
];

interface DifficultyRate {
   amount: number;
   discount: number;
}

interface Estimate {
   state: 'empty' | 'invalid' | 'calculated';
   invalidReason: 'duration' | 'difficulty' | null;
   rateScale: number;
   totalPrice: number;
   discounted: number;
   difficultyRates: Record<RatingDifficulty, DifficultyRate>;
}

function parseDuration(value: string): number | null {
   let seconds: number;
   if (/^\d+(\.\d+)?$/.test(value)) {
      seconds = Number(value);
   } else {
      const match = /^(\d+):([0-5]?\d)$/.exec(value);
      if (!match) return null;
      seconds = Number(match[1]) * 60 + Number(match[2]);
   }
   return Number.isFinite(seconds) && seconds > 0 && seconds <= MAX_DURATION_SECONDS
      ? seconds
      : null;
}

/**
 * Estimate USD pricing from seconds or minutes:seconds, without changing the inputs.
 * Duration is rounded up to half-minute billing increments, up to ten minutes.
 * Selected difficulties are priced highest-first; each additional one discounts its
 * difficulty rate by another 25 percentage points, but not its base rate.
 */
export function calculateEstimate(input: EstimateInput): Estimate {
   const difficultyRates = {} as Record<RatingDifficulty, DifficultyRate>;
   for (const difficulty of difficulties) {
      difficultyRates[difficulty] = { amount: rate.difficulty[difficulty], discount: 0 };
   }
   const estimate: Estimate = {
      state: 'empty',
      invalidReason: null,
      rateScale: 0,
      totalPrice: 0,
      discounted: 0,
      difficultyRates,
   };

   const rawDuration = input.duration.trim();
   if (!rawDuration) return estimate;

   const duration = parseDuration(rawDuration);
   if (duration === null) {
      return { ...estimate, state: 'invalid', invalidReason: 'duration' };
   }
   if (!difficulties.some((difficulty) => input.difficulty[difficulty])) {
      return { ...estimate, state: 'invalid', invalidReason: 'difficulty' };
   }

   const rateScale = Math.ceil(duration / 30) / 2;
   let multiplier = 1;
   let totalPrice = 0;
   let undiscountedPrice = 0;
   for (const difficulty of difficulties) {
      difficultyRates[difficulty] = {
         amount: rate.difficulty[difficulty] * multiplier,
         discount: Math.round((1 - multiplier) * 100),
      };
      if (input.difficulty[difficulty]) {
         totalPrice += (rate.base + rate.difficulty[difficulty] * multiplier) * rateScale;
         undiscountedPrice += (rate.base + rate.difficulty[difficulty]) * rateScale;
         multiplier -= ADDITIONAL_DIFFICULTY_DISCOUNT;
      }
   }
   const lightingPrice = rate.lighting[input.lighting] * rateScale;
   totalPrice += lightingPrice;
   undiscountedPrice += lightingPrice;

   return {
      state: 'calculated',
      invalidReason: null,
      rateScale,
      totalPrice,
      discounted: undiscountedPrice - totalPrice,
      difficultyRates,
   };
}
