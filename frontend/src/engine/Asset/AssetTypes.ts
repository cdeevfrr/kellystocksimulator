import type { LatentModelParams } from "./LatentModel";

// engine/assetTypes.ts
export type AssetType = "latentBubble" // | "deterministic" | "gbm" | "meanReverting" ;

interface AssetConfigBase {
  id: string;
  name: string;
  color: string;
}

export interface GbmAssetConfig extends AssetConfigBase {
  type: "gbm";
  params: { mu: number; sigma: number; initialPrice: number };
}

export interface LatentBubbleAssetConfig extends AssetConfigBase {
  type: "latentBubble";
  params: LatentModelParams;
}

export interface DeterministicAssetConfig extends AssetConfigBase {
  type: "deterministic";
  params: { rate: number; initialPrice: number }; // cash / MMF
}

export type AssetConfig = LatentBubbleAssetConfig // GbmAssetConfig | LatentBubbleAssetConfig | DeterministicAssetConfig;
// add MeanRevertingAssetConfig the same way


export type AssetId = string