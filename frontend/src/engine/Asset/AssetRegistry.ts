import type { AssetType } from "./AssetTypes";
import { generateLatentPath, LatentSliderConfig, LatentSliderDefaultParams } from "./LatentModel";
import type { RNG } from "../random";

// engine/assetRegistry.ts
export interface PathPoint { t: number; price: number; fairPrice?: number }

export interface AssetModelDefinition<P> {
  type: AssetType;
  label: string;
  defaultParams: P;
  sliderConfig: Record<keyof P, { min: number; max: number; step: number }>;
  generatePreviewPath(params: P, years: number, stepsPerYear: number, rng: RNG): PathPoint[];
}

export const ASSET_REGISTRY: Record<AssetType, AssetModelDefinition<any>> = {
  latentBubble: {
    type: "latentBubble",
    label: "Latent Bubble",
    defaultParams: LatentSliderDefaultParams,
    sliderConfig: LatentSliderConfig, // what you already built
    generatePreviewPath: (params, years, stepsPerYear, rng) =>
      generateLatentPath(params, years, stepsPerYear, rng),
  },
//   gbm: {
//     type: "gbm",
//     label: "Geometric Brownian Motion",
//     defaultParams: { mu: 0.07, sigma: 0.2, initialPrice: 100 },
//     sliderConfig: { mu: {min:-.2,max:.3,step:.01}, sigma:{min:0,max:.6,step:.01}, initialPrice:{min:1,max:500,step:1} },
//     generatePreviewPath: (params, years, stepsPerYear, rng) => generateGbmPath(params, years, stepsPerYear, rng),
//   },
  // meanReverting similarly
  // deterministic similarly
};