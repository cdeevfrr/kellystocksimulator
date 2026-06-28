import { equalWeights } from "../../util";
import type { PortfolioConfigBase, PortfolioObservation, PortfolioTypeModule } from "./PortfolioModuleTypes";

export interface BuyAndHoldParams {
  weights: Record<string, number>;
}

export type BuyAndHoldConfig = PortfolioConfigBase<"buyAndHold", BuyAndHoldParams>;

function decide(params: BuyAndHoldParams, observation: PortfolioObservation) {
  return observation.stepIndex === 0 ? params.weights : null
}

// `satisfies` checks this object against the interface — every required field
// must be present with a compatible type, or this line fails to compile —
// while keeping the literal type "buyAndHold" (not widened to `string`).
export const buyAndHoldModule = {
  type: "buyAndHold",
  label: "Buy & Hold",
  createDefaultParams: (assetIds) => ({ weights: equalWeights(assetIds) }),
  decide,
} satisfies PortfolioTypeModule<"buyAndHold", BuyAndHoldParams>;