/**
 * If you want to make a new kind of portfolio, you need to satisfy PortfolioTypeModule,
 * and then add your module to PortfolioTypes.ts
 * 
 * See BuyAndHold for an example.
 * 
 */

type TargetAllocation = Record<string, number> | null; // null = no updates this step

export interface PortfolioObservation {
    stepIndex: number;
    t: number;
    pricesSoFar: Record<string, number[]>;
    holdings: Record<string, number>;
}

// The generic shape every "portfolio type module" file must conform to.
export interface PortfolioTypeModule<TType extends string, TParams> {
    type: TType;
    label: string; // for the UI
    createDefaultParams(assetIds: string[]): TParams;
    decide: (params: TParams, observation: PortfolioObservation) => TargetAllocation
}

// Shared base for the config objects each per-type file will declare.
export interface PortfolioConfigBase<TType extends string, TParams> {
    id: string;
    name: string;
    type: TType;
    params: TParams;
}