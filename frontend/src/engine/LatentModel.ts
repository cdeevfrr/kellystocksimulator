

/**
 * Latent Model
 * This model has a fair price follow geometric brownian motion, and a 
 * bubble price above and beyond fair that also grows with GBM.
 * 
 * Current price is bubble price + latent price.
 * 
 * However, the larger bubble price is as a percentage of latent price,
 * the more likely you are to enter a "crashing" state, where instead of normal
 * bubble growth, the bubble has a large negative mu. 
 * 
 * Parameters:
 * 
 * fairPriceMu (drift)
 * fairPriceSigma
 * bubbleRisingMu
 * bubbleFallingMu
 * 
 * 
 */

import { gbmIncrement } from "./PathModels";
import type { RNG } from "./random";

interface latentStepState {
    logPrice: number, 
    logFairPrice: number, 
    regimeShift: boolean,
}

/**
 * Works following a Sornett model, where the probability of moving dramatically
 * towards fair price is based on the distance from fair price. Fair price
 * grows following GBM. To make chaining easier, it uses log of price for inputs & outputs;
 * caller is responsible for turning things back into nominal values with Math.exp(price)
 * @param param0 
 * @returns 
 */
export function risingLatentStep({
    mu,
    sigma,
    dt,
    logFairPrice,
    logLastPrice,
    bubbleExcessMu,
    hazardRatePerDivergence,
    rng
}:{
    mu: number,
    sigma: number,
    dt: number,
    logFairPrice: number,
    logLastPrice: number,
    bubbleExcessMu: number,
    /**
     * We model the chance of regime shift as poisson, so if you expect h events per year, 
     * p(no issues) = e^(-h*t).
     * 
     * HazardRatePerDivergence is used to calculate the expected number of crashes per year, h. 
     * We multiply the excess (eg, price = 1.7 fairPrice = 1, then excess is .7)
     * by hazardRatePerDivergence to say how many crashes per year you expect.
     */
    hazardRatePerDivergence: number,
    rng: RNG,
}): latentStepState {
    const bubbleGrowth = gbmIncrement(bubbleExcessMu, sigma, dt, rng.gaussian())
    const fairGrowth = gbmIncrement(mu, sigma, dt, rng.gaussian())

    const newLogFairPrice = logFairPrice + fairGrowth
    const newLogPrice = logLastPrice + fairGrowth + bubbleGrowth

    const priceRatio = Math.exp(newLogPrice - newLogFairPrice); // equals price / fairPrice

    // Translate instant hazard rate to the exact probability for this dt window.
    // P(shift in dt) = 1 - exp(-h * dt)
    const fallProbability = 1 - Math.exp(- hazardRatePerDivergence * (priceRatio - 1) * dt);
    
    return {
        logPrice: newLogPrice,
        logFairPrice: newLogFairPrice,
        regimeShift: rng.uniform() < fallProbability
    };
}

/**
 *  Price falls back into line with fair price, speed based on crash mu.
 *  Randomly be done with falling, with probability increasing as price/fairPrice stabelizes to 1.
 * @param param0 
 */
export function fallingLatentStep({
    sigma,
    mu,
    dt,
    crashMu,
    crashEndRate,
    logFairPrice,
    logLastPrice,
    rng
}:{
    sigma: number,
    mu: number,
    dt: number,
    crashMu: number, // Should be large and negative.
    crashEndRate: number, // 0-1 valued. Modifies how likely the crash is to lose steam, and for us to return to bubble regime. 
    logFairPrice: number,
    logLastPrice: number,
    rng: RNG,
}) : latentStepState {
    const crashStepSize = gbmIncrement(crashMu, sigma, dt, rng.gaussian())
    const fairStepSize = gbmIncrement(mu, sigma, dt, rng.gaussian())

    const newLogFairPrice = logFairPrice + fairStepSize
    const newLogPrice = logLastPrice + crashStepSize + fairStepSize

    // For crashOverHazardRage,
    // I just picked a formula that felt right, to get numbers near these:
    // (price to fairPrice ratio -> crashOverEventsPerYear)
    // 1 -> 1
    // 1.2 -> .7
    // 2 -> .25
    // .8 -> .5
    const ratio = Math.exp(newLogPrice - newLogFairPrice)
    const crashOverHazardRate = 1 / (ratio ** 2) * crashEndRate

    const crashOverProbability = 1 - Math.exp( - crashOverHazardRate * dt)

    return {
        logFairPrice: newLogFairPrice,
        logPrice: newLogPrice,
        regimeShift: rng.uniform() < crashOverProbability
    }

}




export interface LatentModelParams {
  mu: number;
  sigma: number;
  bubbleExcessMu: number;
  hazardRatePerDivergence: number;
  crashMu: number;       // should be large & negative
  crashEndRate: number;  // 0-1
  initialPrice: number;
  initialFairPrice: number;
}

export interface LatentPathPoint {
  t: number;
  price: number;
  fairPrice: number;
  regime: "rising" | "falling";
}

export function generateLatentPath(
  params: LatentModelParams,
  years: number,
  stepsPerYear: number,
  rng: RNG
): LatentPathPoint[] {
  const dt = 1 / stepsPerYear;
  const totalSteps = Math.round(years * stepsPerYear);

  let logPrice = Math.log(params.initialPrice);
  let logFairPrice = Math.log(params.initialFairPrice);
  let regime: "rising" | "falling" = "rising";

  const path: LatentPathPoint[] = [
    { t: 0, price: params.initialPrice, fairPrice: params.initialFairPrice, regime },
  ];

  for (let i = 1; i <= totalSteps; i++) {
    const result =
      regime === "rising"
        ? risingLatentStep({
            mu: params.mu,
            sigma: params.sigma,
            dt,
            logFairPrice,
            logLastPrice: logPrice,
            bubbleExcessMu: params.bubbleExcessMu,
            hazardRatePerDivergence: params.hazardRatePerDivergence,
            rng,
          })
        : fallingLatentStep({
            mu: params.mu,
            sigma: params.sigma,
            dt,
            crashMu: params.crashMu,
            crashEndRate: params.crashEndRate,
            logFairPrice,
            logLastPrice: logPrice,
            rng,
          });

    logPrice = result.logPrice;
    logFairPrice = result.logFairPrice;

    if (result.regimeShift) {
      regime = regime === "rising" ? "falling" : "rising";
    }

    path.push({
      t: i * dt,
      price: Math.exp(logPrice),
      fairPrice: Math.exp(logFairPrice),
      regime,
    });
  }

  return path;
}




