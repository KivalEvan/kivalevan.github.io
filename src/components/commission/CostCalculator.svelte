<script lang="ts">
   import Commission from '../../data/commission.json';

   type RatingDifficulty = 'expertPlus' | 'expert' | 'hard' | 'normal' | 'easy';
   type RatingLighting = `vanillaV${2 | 3}` | `chroma${'Basic' | 'Advanced'}` | 'lolighter';

   interface Input {
      duration: string;
      difficulty: { [diff in RatingDifficulty]: boolean };
      lighting: RatingLighting;
   }

   interface Rating {
      base: number;
      additionalMult: number;
      difficulty: { [diff in RatingDifficulty]: number };
      lighting: { [light in RatingLighting]: number };
      discounted: number;
   }
   const difficultyRename = {
      expertPlus: 'Expert+',
      expert: 'Expert',
      hard: 'Hard',
      normal: 'Normal',
      easy: 'Easy',
   }

   const input: Input = {
      duration: '',
      difficulty: {
         expertPlus: false,
         expert: false,
         hard: false,
         normal: false,
         easy: false,
      },
      lighting: 'lolighter',
   };

   const rate: Rating = {
      base: Commission.beatmap.base,
      additionalMult: 0.5,
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
   };

   const display: { [diff in RatingDifficulty]: string | number } = {
      expertPlus: rate.difficulty.expertPlus,
      expert: rate.difficulty.expert,
      hard: rate.difficulty.hard,
      normal: rate.difficulty.normal,
      easy: rate.difficulty.easy,
   };

   function MMSStoFloat(mmss: string) {
      const [m, s] = mmss.split(':').map((el) => parseInt(el));
      return m * 60 + s;
   }

   function calculateCost() {
      let amt = 0;
      let multiplier = 1;
      let noDiscount = 0;
      rate.discounted = 0;
      rateScale = calculateRateScale();
      for (const diff in input.difficulty) {
         let d = diff as RatingDifficulty;
         display[d] = rate.difficulty[d];
         if (multiplier < 1) {
            display[d] = `${Math.round(rate.difficulty[d] * multiplier * 10) / 10} ${-Math.round(
               (1 - multiplier) * 100
            )}%`;
         }
         if (input.difficulty[d]) {
            amt += (rate.base + rate.difficulty[d] * multiplier) * rateScale;
            noDiscount += (rate.base + rate.difficulty[d]) * rateScale;
            multiplier -= 0.25;
         }
      }
      noDiscount += rate.lighting[input.lighting] * rateScale;
      amt += rate.lighting[input.lighting] * rateScale;
      rate.discounted = noDiscount - amt;
      totalPrice = amt;
   }

   function calculateRateScale() {
      const duration = /^\d+(\.\d+)?$/.test(input.duration)
         ? parseFloat(input.duration)
         : /^\d+:(\d){1,2}$/.test(input.duration)
         ? MMSStoFloat(input.duration)
         : 0;
      return Math.floor(duration / 60) + Math.ceil((duration % 60) / 30) / 2;
   }
   function difficultyCheckHandler() {
      calculateCost();
   }
   function lightingCheckHandler() {
      calculateCost();
   }

   $: rateScale = 0;
   $: totalPrice = 0;
</script>

<div class="flex flex-sb">
   <div>
      <label for="song-length"><b>Song Length: </b></label>
      <input
         type="text"
         id="song-length"
         placeholder="1:30 OR 90"
         bind:value={input.duration}
         on:change={calculateCost}
      />
      <br />
      <span>
         <b>Rate Scale:</b>
         {rateScale}x
      </span>
   </div>
   <div>
      <h5>Difficulty</h5>
      <ul>
         {#each Object.entries(input.difficulty) as [inputName, _]}
            <li>
               <input
                  type="checkbox"
                  id={`difficulty-${inputName}`}
                  name="difficulty"
                  value={inputName}
                  bind:checked={input.difficulty[inputName]}
                  on:change={difficultyCheckHandler}
               />
               <label for={`difficulty-${inputName}`}>{difficultyRename[inputName]}</label>
            </li>
         {/each}
      </ul>
   </div>
   <div>
      <h5>Lighting</h5>
      <ul>
         <li>
            <input
               type="radio"
               id="lighting-chroma-advanced"
               name="lighting"
               value="chromaAdvanced"
               bind:group={input.lighting}
               on:change={lightingCheckHandler}
            />
            <label for="lighting-chroma-advanced">Chroma Advanced</label>
         </li>
         <li>
            <input
               type="radio"
               id="lighting-chroma-basic"
               name="lighting"
               value="chromaBasic"
               bind:group={input.lighting}
               on:change={lightingCheckHandler}
            />
            <label for="lighting-chroma-basic">Chroma Basic</label>
         </li>
         <li>
            <input
               type="radio"
               id="lighting-vanilla-v3"
               name="lighting"
               value="vanillaV3"
               bind:group={input.lighting}
               on:change={lightingCheckHandler}
            />
            <label for="lighting-vanilla-v3">Vanilla (v3)</label>
         </li>
         <li>
            <input
               type="radio"
               id="lighting-vanilla-v2"
               name="lighting"
               value="vanillaV2"
               bind:group={input.lighting}
               on:change={lightingCheckHandler}
            />
            <label for="lighting-vanilla-v2">Vanilla (v2)</label>
         </li>
         <li>
            <input
               type="radio"
               id="lighting-lolighter"
               name="lighting"
               value="lolighter"
               bind:group={input.lighting}
               on:change={lightingCheckHandler}
            />
            <label for="lighting-lolighter">Lolighter (automated)</label>
         </li>
      </ul>
   </div>
</div>
<br />
<hr />
<div>
   <h5>Estimated Price</h5>
   <span id="result-cost"
      >${totalPrice.toFixed(2)}
      {#if rate.discounted > 0}<span> (-${rate.discounted.toFixed(2)})</span>{/if}</span
   >
</div>
<hr />
<div class="flex flex-sb">
   <div>
      <h5>Price Rating</h5>
      <h6>(per minute)</h6>
      <span>Base Price: ${rate.base}</span>
   </div>
   <div>
      <span>Difficulty:</span>
      <ul>
         {#each Object.entries(display) as [diffName, rate]}
            <li>{difficultyRename[diffName]}: ${rate}</li>
         {/each}
      </ul>
   </div>
   <div>
      <span>Lighting:</span>
      <ul>
         <li>Chroma Advanced: ${rate.lighting.chromaAdvanced}</li>
         <li>Chroma Basic: ${rate.lighting.chromaBasic}</li>
         <li>Vanilla (v3): ${rate.lighting.vanillaV3}</li>
         <li>Vanilla (v2): ${rate.lighting.vanillaV2}</li>
         <li>Lolighter (automated): ${rate.lighting.lolighter}</li>
      </ul>
      <br />
      <span>Lighting base price is already included.</span>
   </div>
</div>

<style>
   input[type='text'] {
      font-size: 1em;
      width: 6em;
   }
</style>
