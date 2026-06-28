import { equalWeights } from "../../util";
import type { PortfolioConfigBase, PortfolioObservation, PortfolioTypeModule } from "./PortfolioModuleTypes";

export interface PeriodicRebalanceParams {
    weights: Record<string, number>,
    frequency: number, // in days
}

export type PeriodicRebalanceConfig = PortfolioConfigBase<"periodicRebalance", PeriodicRebalanceParams>;

function decide(params: PeriodicRebalanceParams, observation: PortfolioObservation) {
    return observation.stepIndex % params.frequency === 0 ? params.weights : null
}

export const periodicRebalanceModule = {
    type: "periodicRebalance",
    label: "Periodic Rebalance",
    createDefaultParams: (assetIds) => ({ weights: equalWeights(assetIds), frequency: 7 }),
    decide,
} satisfies PortfolioTypeModule<"periodicRebalance", PeriodicRebalanceParams>;