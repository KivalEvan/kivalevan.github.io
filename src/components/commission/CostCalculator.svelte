<script lang="ts">
   import Commission from '../../data/commission.json';

   type RatingDifficulty = 'expertPlus' | 'expert' | 'hard' | 'normal' | 'easy';
   type RatingLighting = `vanillaV${2 | 3}` | `chroma${'Basic' | 'Advanced'}` | 'lolighter';
   type EstimateState = 'empty' | 'invalid' | 'calculated';
   type InvalidReason = 'duration' | 'difficulty' | null;

   const ADDITIONAL_DIFFICULTY_DISCOUNT = 0.25;
   const MAX_DURATION_SECONDS = 600;
   const currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
   });

   interface Input {
      duration: string;
      difficulty: { [diff in RatingDifficulty]: boolean };
      lighting: RatingLighting;
   }

   interface Rating {
      base: number;
      difficulty: { [diff in RatingDifficulty]: number };
      lighting: { [light in RatingLighting]: number };
      discounted: number;
   }

   const difficultyRename: Record<RatingDifficulty, string> = {
      expertPlus: 'Expert+',
      expert: 'Expert',
      hard: 'Hard',
      normal: 'Normal',
      easy: 'Easy',
   };
   const difficulties: RatingDifficulty[] = ['expertPlus', 'expert', 'hard', 'normal', 'easy'];
   const lightingOptions: { id: RatingLighting; label: string }[] = [
      { id: 'chromaAdvanced', label: 'Chroma Advanced' },
      { id: 'chromaBasic', label: 'Chroma Basic' },
      { id: 'vanillaV3', label: 'Vanilla (v3)' },
      { id: 'vanillaV2', label: 'Vanilla (v2)' },
      { id: 'lolighter', label: 'Lolighter (automated lighting)' },
   ];

   const input: Input = $state({
      duration: '',
      difficulty: {
         expertPlus: false,
         expert: false,
         hard: false,
         normal: false,
         easy: false,
      },
      lighting: 'lolighter',
   });

   const rate: Rating = $state({
      base: Commission.beatmap.base,
      difficulty: {
         expertPlus: Commission.beatmap.difficulty.expertPlus,
         expert: Commission.beatmap.difficulty.expert,
         hard: Commission.beatmap.difficulty.hard,
         normal: Commission.beatmap.difficulty.normal,
         easy: Commission.beatmap.difficulty.easy,
      },
      lighting: {
         lolighter: Commission.beatmap.lighting.lolighter,
         vanillaV2: Commission.beatmap.lighting.vanillaV2,
         vanillaV3: Commission.beatmap.lighting.vanillaV3,
         chromaAdvanced: Commission.beatmap.lighting.chromaAdvanced,
         chromaBasic: Commission.beatmap.lighting.chromaBasic,
      },
      discounted: 0,
   });

   const display: Record<RatingDifficulty, string | number> = $state({
      expertPlus: rate.difficulty.expertPlus,
      expert: rate.difficulty.expert,
      hard: rate.difficulty.hard,
      normal: rate.difficulty.normal,
      easy: rate.difficulty.easy,
   });

   let estimateState = $state<EstimateState>('empty');
   let invalidReason = $state<InvalidReason>(null);
   let rateScale = $state(0);
   let totalPrice = $state(0);

   function parseDuration(value: string): number | null {
      const duration = value.trim();
      if (!duration) return null;

      if (/^\d+(\.\d+)?$/.test(duration)) {
         const seconds = Number.parseFloat(duration);
         return Number.isFinite(seconds) && seconds > 0 && seconds <= MAX_DURATION_SECONDS
            ? seconds
            : null;
      }

      const match = /^(\d+):([0-5]?\d)$/.exec(duration);
      if (!match) return null;

      const seconds = Number.parseInt(match[1], 10) * 60 + Number.parseInt(match[2], 10);
      return Number.isFinite(seconds) && seconds > 0 && seconds <= MAX_DURATION_SECONDS
         ? seconds
         : null;
   }

   function formatCurrency(value: number): string {
      return Number.isFinite(value) ? currencyFormatter.format(value) : 'Unavailable';
   }

   function formatRate(value: string | number): string {
      if (typeof value === 'number') return formatCurrency(value);

      const [amount, discount] = value.split(' ');
      return `${formatCurrency(Number(amount))} (${discount} discount)`;
   }

   function resetEstimate() {
      rateScale = 0;
      totalPrice = 0;
      rate.discounted = 0;
      for (const diff of difficulties) {
         display[diff] = rate.difficulty[diff];
      }
   }

   function calculateRateScale(duration: number) {
      return Math.floor(duration / 60) + Math.ceil((duration % 60) / 30) / 2;
   }

   function calculateCost() {
      const rawDuration = input.duration.trim();
      if (!rawDuration) {
         estimateState = 'empty';
         invalidReason = null;
         resetEstimate();
         return;
      }

      const duration = parseDuration(rawDuration);
      if (
         duration === null ||
         !Number.isFinite(duration) ||
         duration <= 0 ||
         duration > MAX_DURATION_SECONDS
      ) {
         estimateState = 'invalid';
         invalidReason = 'duration';
         resetEstimate();
         return;
      }

      if (!difficulties.some((diff) => input.difficulty[diff])) {
         estimateState = 'invalid';
         invalidReason = 'difficulty';
         resetEstimate();
         return;
      }

      estimateState = 'calculated';
      invalidReason = null;
      let amt = 0;
      let multiplier = 1;
      let noDiscount = 0;
      rate.discounted = 0;
      rateScale = calculateRateScale(duration);

      if (!Number.isFinite(rateScale)) {
         estimateState = 'invalid';
         invalidReason = 'duration';
         resetEstimate();
         return;
      }

      for (const diff of difficulties) {
         display[diff] = rate.difficulty[diff];
         if (multiplier < 1) {
            display[diff] =
               `${Math.round(rate.difficulty[diff] * multiplier * 10) / 10} ${Math.round(
                  (1 - multiplier) * 100,
               )}%`;
         }
         if (input.difficulty[diff]) {
            amt += (rate.base + rate.difficulty[diff] * multiplier) * rateScale;
            noDiscount += (rate.base + rate.difficulty[diff]) * rateScale;
            multiplier -= ADDITIONAL_DIFFICULTY_DISCOUNT;
         }
      }
      noDiscount += rate.lighting[input.lighting] * rateScale;
      amt += rate.lighting[input.lighting] * rateScale;

      if (!Number.isFinite(amt) || !Number.isFinite(noDiscount)) {
         estimateState = 'invalid';
         invalidReason = 'duration';
         resetEstimate();
         return;
      }

      rate.discounted = noDiscount - amt;
      totalPrice = amt;
   }
</script>

<div class="calculator">
   <div class="calculator__inputs">
      <div class="calculator-group calculator-group--duration">
         <label class="calculator-label" for="song-length">Song duration</label>
         <input
            class="calculator__duration"
            type="text"
            id="song-length"
            placeholder="1:30 or 90"
            inputmode="text"
            autocomplete="off"
            required
            aria-required="true"
            aria-invalid={invalidReason === 'duration' ? 'true' : 'false'}
            aria-errormessage={invalidReason === 'duration' ? 'song-length-feedback' : undefined}
            aria-describedby="song-length-help song-length-feedback"
            bind:value={input.duration}
            oninput={calculateCost}
         />
         <p id="song-length-help" class="calculator__hint">
            Enter 1-{MAX_DURATION_SECONDS} seconds, such as 90, or minutes:seconds, such as 1:30. Maximum
            10 minutes.
         </p>
         <p
            id="song-length-feedback"
            class="calculator__hint"
            role={invalidReason === 'duration' ? 'alert' : undefined}
            aria-live={invalidReason === 'duration' ? 'assertive' : 'off'}
            aria-atomic="true"
         >
            {#if estimateState === 'empty'}
               Enter a song duration.
            {:else if invalidReason === 'duration'}
               Use 1-{MAX_DURATION_SECONDS} seconds, such as 90, or minutes:seconds, such as 1:30.
            {/if}
         </p>
         <p
            id="rate-scale"
            class="calculator__hint"
            aria-live={estimateState === 'calculated' ? 'polite' : 'off'}
         >
            <strong>Price multiplier:</strong>
            {#if estimateState === 'calculated'}
               {rateScale}×
            {:else}
               Not calculated
            {/if}
         </p>
         <p class="calculator__hint">Song duration uses whole- or half-minute increments.</p>
      </div>
      <fieldset
         class="calculator-group"
         data-invalid={invalidReason === 'difficulty' ? '' : undefined}
         aria-describedby="difficulty-help difficulty-feedback"
      >
         <legend class="calculator-label calculator-label--legend">Difficulty</legend>
         <p id="difficulty-help" class="calculator__hint calculator__hint--difficulty">
            Select one or more difficulties.
         </p>
         <ul class="calculator__options">
            {#each difficulties as inputName}
               <li class="calculator__option">
                  <input
                     class="calculator__choice"
                     type="checkbox"
                     id={`difficulty-${inputName}`}
                     name="difficulty"
                     value={inputName}
                     aria-invalid={invalidReason === 'difficulty' ? 'true' : 'false'}
                     aria-describedby="difficulty-help difficulty-feedback"
                     bind:checked={input.difficulty[inputName]}
                     onchange={calculateCost}
                  />
                  <label class="calculator__choice-label" for={`difficulty-${inputName}`}
                     >{difficultyRename[inputName]}</label
                  >
               </li>
            {/each}
         </ul>
         <p
            id="difficulty-feedback"
            class="calculator__hint calculator__hint--feedback"
            role={invalidReason === 'difficulty' ? 'alert' : undefined}
            aria-live={invalidReason === 'difficulty' ? 'assertive' : 'off'}
            aria-atomic="true"
         >
            {#if invalidReason === 'difficulty'}
               Select one or more difficulties.
            {/if}
         </p>
      </fieldset>
      <fieldset class="calculator-group">
         <legend class="calculator-label calculator-label--legend">Lighting</legend>
         <ul class="calculator__options">
            {#each lightingOptions as option}
               <li class="calculator__option">
                  <input
                     class="calculator__choice"
                     type="radio"
                     id={`lighting-${option.id}`}
                     name="lighting"
                     value={option.id}
                     bind:group={input.lighting}
                     onchange={calculateCost}
                  />
                  <label class="calculator__choice-label" for={`lighting-${option.id}`}
                     >{option.label}</label
                  >
               </li>
            {/each}
         </ul>
      </fieldset>
   </div>
   <hr class="calculator__divider" />
   <div class="estimate-result">
      <h3 class="calculator-label">Estimated Price</h3>
      <div
         id="result-cost"
         class="calculator__result"
         aria-live={estimateState === 'calculated' ? 'polite' : 'off'}
         aria-atomic="true"
      >
         {#if estimateState === 'empty'}
            <p class="calculator__result-detail">No estimate yet. Complete the inputs above.</p>
         {:else if estimateState === 'invalid'}
            <p class="calculator__result-detail">
               No estimate. Correct the highlighted field above.
            </p>
         {:else}
            <p class="calculator__result-detail">Estimated price for {input.duration.trim()}:</p>
            <p class="calculator__result-total">
               {formatCurrency(totalPrice)}
            </p>
            {#if Number.isFinite(rate.discounted) && rate.discounted > 0}
               <p class="calculator__result-detail">
                  Discount for additional difficulties: {formatCurrency(rate.discounted)}
               </p>
            {/if}
         {/if}
      </div>
   </div>
   <hr class="calculator__divider" />
   <div class="calculator__breakdown">
      <div>
         <h3 class="calculator-label">Rate breakdown (per minute)</h3>
         <p class="calculator__hint">These rates are used to calculate the estimate.</p>
         <span><strong>Base rate:</strong> {formatCurrency(rate.base)}</span>
         <p class="calculator__hint calculator__hint--separated">
            Each additional lower difficulty receives a {ADDITIONAL_DIFFICULTY_DISCOUNT * 100}%
            discount.
         </p>
      </div>
      <div>
         <span class="calculator-label">Difficulty rates:</span>
         <ul class="calculator__rate-list">
            {#each difficulties as diffName}
               <li>{difficultyRename[diffName]}: {formatRate(display[diffName])}</li>
            {/each}
         </ul>
      </div>
      <div>
         <span class="calculator-label">Lighting rates:</span>
         <ul class="calculator__rate-list">
            {#each lightingOptions as option}
               <li>{option.label}: {formatCurrency(rate.lighting[option.id])}</li>
            {/each}
         </ul>
         <p class="calculator__lighting-note">
            The selected lighting rate is included in the estimate.
         </p>
      </div>
   </div>
</div>

<style lang="scss">
   @layer layout {
      .calculator {
         width: 100%;
         font-variant-numeric: tabular-nums;

         &__inputs,
         &__breakdown {
            display: grid;
            align-items: start;
            gap: 1rem;

            @media (min-width: 64rem) {
               grid-template-columns: repeat(3, minmax(0, 1fr));
               gap: 1.25rem;
            }
         }

         &__breakdown {
            gap: 1.25rem;
         }

         &__duration {
            width: 100%;
            max-width: 14rem;
            height: 44px;
            padding: 0.5rem 0.75rem;
            border: 1px solid #6883ad;
            background: #0b1429;
            color: #ecebe6;
            font-size: 1rem;
            line-height: 1.5;

            &::placeholder {
               color: #a5a5a2;
            }

            &:focus-visible {
               border-color: #6883ad;
               outline: 2px solid #6883ad;
               outline-offset: 2px;
            }

            &[aria-invalid='true'] {
               border-color: #ed1738;
               outline: 2px solid #ed1738;
               outline-offset: 2px;
            }
         }

         &__hint {
            margin: 0;
            font-size: 0.875rem;
            line-height: 1.5;

            &--difficulty {
               margin-bottom: 0.5rem;
            }

            &--feedback,
            &--separated {
               margin-top: 0.5rem;
            }
         }

         &__options {
            > :not(:last-child) {
               margin-block-start: 0;
               margin-block-end: 0.25rem;
            }
         }

         &__option {
            display: flex;
            min-height: 44px;
            align-items: center;
            gap: 0.5rem;
         }

         &__choice {
            width: 1.5rem;
            height: 1.5rem;
            flex-shrink: 0;
            cursor: pointer;
            accent-color: #ed1738;

            &:focus-visible {
               outline: 2px solid #6883ad;
               outline-offset: 2px;
            }
         }

         &__choice-label {
            display: flex;
            min-height: 44px;
            flex: 1;
            align-items: center;
            cursor: pointer;
            user-select: none;
         }

         &__divider {
            width: 100%;
            margin-block: 1.5rem;
            border-color: #6883ad;
         }

         &__result {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
            line-height: calc(2 / 1.5);
         }

         &__result-detail {
            margin: 0;
            font-size: 1rem;
            font-weight: 400;
            line-height: 1.5;
         }

         &__result-total {
            margin: 0;
         }

         &__rate-list {
            margin-top: 0.25rem;

            > :not(:last-child) {
               margin-block-start: 0;
               margin-block-end: 0.25rem;
            }
         }

         &__lighting-note {
            margin-top: 0.5rem;
         }
      }

      .calculator-group {
         min-width: 0;

         &[data-invalid] {
            outline: 2px solid #ed1738;
            outline-offset: 2px;
         }

         // Keep spacing at zero specificity so the hint's margin reset wins
         // while the label and input retain their gap.
         :where(&--duration > :not(:last-child)) {
            margin-block-start: 0;
            margin-block-end: 0.5rem;
         }
      }

      .calculator-label {
         &--legend {
            margin-bottom: 0.25rem;
         }
      }

      .estimate-result {
         padding-block: 1.25rem;
         border-block: 1px solid #6883ad;
      }
   }

   .calculator-group {
      border-top: 1px solid #29466b;
      padding-top: 0.8rem;
   }

   .calculator-label {
      font-family: 'Big Shoulders Display', 'Arial Narrow', sans-serif;
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1;
      letter-spacing: 0.01em;
      text-transform: uppercase;
   }

   .calculator :global(input[type='checkbox']),
   .calculator :global(input[type='radio']) {
      accent-color: #ed1738;
   }

   .calculator :global(li:has(input[type='checkbox']:checked)),
   .calculator :global(li:has(input[type='radio']:checked)) {
      background: rgb(41 70 107 / 45%);
   }

   .estimate-result :global(#result-cost > p:nth-child(2)) {
      font-family: 'Big Shoulders Display', 'Arial Narrow', sans-serif;
      font-size: clamp(2.5rem, 6vw, 4.8rem);
      font-weight: 800;
      line-height: 0.82;
      color: #ecebe6;
   }
</style>
