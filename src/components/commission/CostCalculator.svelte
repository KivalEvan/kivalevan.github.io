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
            display[diff] = `${Math.round(rate.difficulty[diff] * multiplier * 10) / 10} ${Math.round(
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

<div class="calculator w-full tabular-nums">
   <div class="grid items-start gap-4 lg:grid-cols-3 lg:gap-5">
      <div class="calculator-group min-w-0 space-y-2">
         <label class="calculator-label" for="song-length">Song duration</label>
         <input
            class="h-[44px] w-full max-w-56 border border-[#6883ad] bg-[#0b1429] px-3 py-2 text-base text-[#ecebe6] placeholder:text-[#a5a5a2] aria-[invalid=true]:border-[#ed1738] aria-[invalid=true]:outline aria-[invalid=true]:outline-2 aria-[invalid=true]:outline-offset-2 aria-[invalid=true]:outline-[#ed1738] focus-visible:border-[#6883ad] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6883ad]"
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
         <p id="song-length-help" class="m-0 text-sm leading-normal">
            Enter 1–{MAX_DURATION_SECONDS} seconds, such as 90, or minutes:seconds, such as 1:30.
            Maximum 10 minutes.
         </p>
         <p
            id="song-length-feedback"
            class="m-0 text-sm leading-normal"
            role={invalidReason === 'duration' ? 'alert' : undefined}
            aria-live={invalidReason === 'duration' ? 'assertive' : 'off'}
            aria-atomic="true"
         >
            {#if estimateState === 'empty'}
               Enter a song duration.
            {:else if invalidReason === 'duration'}
               Use 1–{MAX_DURATION_SECONDS} seconds, such as 90, or minutes:seconds, such as 1:30.
            {/if}
         </p>
         <p
            id="rate-scale"
            class="m-0 text-sm leading-normal"
            aria-live={estimateState === 'calculated' ? 'polite' : 'off'}
         >
            <strong>Price multiplier:</strong>
            {#if estimateState === 'calculated'}
               {rateScale}×
            {:else}
               Not calculated
            {/if}
         </p>
         <p class="m-0 text-sm leading-normal">Song duration uses whole- or half-minute increments.</p>
      </div>
      <fieldset
         class="calculator-group min-w-0 aria-[invalid=true]:outline aria-[invalid=true]:outline-2 aria-[invalid=true]:outline-offset-2 aria-[invalid=true]:outline-[#ed1738]"
         aria-invalid={invalidReason === 'difficulty' ? 'true' : 'false'}
         aria-describedby="difficulty-help difficulty-feedback"
      >
         <legend class="calculator-label mb-1">Difficulty</legend>
         <p id="difficulty-help" class="mb-2 text-sm leading-normal">Select one or more difficulties.</p>
         <ul class="space-y-1">
            {#each difficulties as inputName}
               <li class="flex min-h-[44px] items-center gap-2">
                  <input
                     class="size-6 shrink-0 cursor-pointer accent-[#ed1738] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6883ad]"
                     type="checkbox"
                     id={`difficulty-${inputName}`}
                     name="difficulty"
                     value={inputName}
                     bind:checked={input.difficulty[inputName]}
                     onchange={calculateCost}
                  />
                  <label
                     class="flex min-h-[44px] flex-1 cursor-pointer select-none items-center"
                     for={`difficulty-${inputName}`}
                     >{difficultyRename[inputName]}</label
                  >
               </li>
            {/each}
         </ul>
         <p
            id="difficulty-feedback"
            class="mt-2 text-sm leading-normal"
            role={invalidReason === 'difficulty' ? 'alert' : undefined}
            aria-live={invalidReason === 'difficulty' ? 'assertive' : 'off'}
            aria-atomic="true"
         >
            {#if invalidReason === 'difficulty'}
               Select one or more difficulties.
            {/if}
         </p>
      </fieldset>
      <fieldset class="calculator-group min-w-0">
         <legend class="calculator-label mb-1">Lighting</legend>
         <ul class="space-y-1">
            {#each lightingOptions as option}
               <li class="flex min-h-[44px] items-center gap-2">
                  <input
                     class="size-6 shrink-0 cursor-pointer accent-[#ed1738] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6883ad]"
                     type="radio"
                     id={`lighting-${option.id}`}
                     name="lighting"
                     value={option.id}
                     bind:group={input.lighting}
                     onchange={calculateCost}
                  />
                  <label
                     class="flex min-h-[44px] flex-1 cursor-pointer select-none items-center"
                     for={`lighting-${option.id}`}
                     >{option.label}</label
                  >
               </li>
            {/each}
         </ul>
      </fieldset>
   </div>
   <hr class="my-6 w-full border-[#6883ad]" />
   <div class="estimate-result border-y border-[#6883ad] py-5">
      <h3 class="calculator-label">Estimated Price</h3>
      <div
         id="result-cost"
         class="m-0 text-2xl font-semibold"
         aria-live={estimateState === 'calculated' ? 'polite' : 'off'}
         aria-atomic="true"
      >
         {#if estimateState === 'empty'}
            <p class="m-0 text-base font-normal">No estimate yet. Complete the inputs above.</p>
         {:else if estimateState === 'invalid'}
            <p class="m-0 text-base font-normal">No estimate. Correct the highlighted field above.</p>
         {:else}
            <p class="m-0 text-base font-normal">Estimated price for {input.duration.trim()}:</p>
            <p class="m-0">
               {formatCurrency(totalPrice)}
            </p>
            {#if Number.isFinite(rate.discounted) && rate.discounted > 0}
               <p class="m-0 text-base font-normal">
                  Discount for additional difficulties: {formatCurrency(rate.discounted)}
               </p>
            {/if}
         {/if}
      </div>
   </div>
   <hr class="my-6 w-full border-[#6883ad]" />
   <div class="grid gap-5 lg:grid-cols-3">
      <div>
         <h3 class="calculator-label">Rate breakdown (per minute)</h3>
         <p class="m-0 text-sm leading-normal">These rates are used to calculate the estimate.</p>
         <span><strong>Base rate:</strong> {formatCurrency(rate.base)}</span>
         <p class="mt-2 text-sm leading-normal">
            Each additional lower difficulty receives a {ADDITIONAL_DIFFICULTY_DISCOUNT * 100}% discount.
         </p>
      </div>
      <div>
         <span class="calculator-label">Difficulty rates:</span>
         <ul class="mt-1 space-y-1">
            {#each difficulties as diffName}
               <li>{difficultyRename[diffName]}: {formatRate(display[diffName])}</li>
            {/each}
         </ul>
      </div>
      <div>
         <span class="calculator-label">Lighting rates:</span>
         <ul class="mt-1 space-y-1">
            {#each lightingOptions as option}
               <li>{option.label}: {formatCurrency(rate.lighting[option.id])}</li>
            {/each}
         </ul>
         <p class="mt-2">The selected lighting rate is included in the estimate.</p>
      </div>
   </div>
</div>

<style>
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
