import type { AssetId } from "../Asset/AssetTypes";
import { buyAndHoldModule, type BuyAndHoldConfig } from "./BuyAndHold"
import { periodicRebalanceModule, type PeriodicRebalanceConfig } from "./PeriodicRebalance";

// A portfolio could also be called a strategy.
// It represents "I will do these things over time to manage my portfolio."
// It has a config type (string, like "buy and hold") and a known
// params shape (eg, buy and hold has an allocation, weights for each asset.)
// Types on a portfolio's params are enforced via the code in the PortfolioModule.ts.
// To use a portfolio, you ask it to decide what to do given a current observation of
// the world; Eg, PORTFOLIO_TYPE_LIST[portfolioConfig.type].decide(portfolioConfig.params, myMarketState).
// Similar patterns let you access any particular deatils of this portfolio's type, 
// like a UI friendly string for this type of portfolio.
export type PortfolioConfig = BuyAndHoldConfig | PeriodicRebalanceConfig;
export type PortfolioType = PortfolioConfig["type"]; // this type is equal to a union of strings.

export const PORTFOLIO_MODULES = {
    [buyAndHoldModule.type]: buyAndHoldModule, 
    [periodicRebalanceModule.type]: periodicRebalanceModule,
 } as const;


 export type Allocation = Record<AssetId, number>

 export function totalAllocated(allocation: Allocation){
    return Object.entries(allocation).reduce((previousValue, currentValue) => ["sum", previousValue[1] + currentValue[1]])[1]
 }