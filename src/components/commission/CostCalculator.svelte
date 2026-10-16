<script lang="ts">
   import {
      ADDITIONAL_DIFFICULTY_DISCOUNT,
      MAX_DURATION_SECONDS,
      calculateEstimate,
      difficulties,
      difficultyRename,
      lightingOptions,
      rate,
      type EstimateInput,
   } from '../../data/commission-estimate';
   const currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
   });

   const input: EstimateInput = $state({
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

   const estimate = $derived(calculateEstimate(input));
   const estimateState = $derived(estimate.state);
   const invalidReason = $derived(estimate.invalidReason);

   function formatCurrency(value: number): string {
      return Number.isFinite(value) ? currencyFormatter.format(value) : 'Unavailable';
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
               {estimate.rateScale}×
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
               {formatCurrency(estimate.totalPrice)}
            </p>
            {#if estimate.discounted > 0}
               <p class="calculator__result-detail">
                  Discount for additional difficulties: {formatCurrency(estimate.discounted)}
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
               {@const difficultyRate = estimate.difficultyRates[diffName]}
               <li>
                  {difficultyRename[diffName]}: {formatCurrency(difficultyRate.amount)}
                  {#if difficultyRate.discount > 0}
                     ({difficultyRate.discount}% discount)
                  {/if}
               </li>
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
