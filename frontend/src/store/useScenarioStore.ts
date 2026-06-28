// store/useScenarioStore.ts
import { create } from "zustand";
import { ASSET_REGISTRY } from "../engine/AssetRegistry";
import { useAssetStore } from "./useAssetStore";
import { useSimConfigStore } from "./useSimConfigStore";
import { rng } from "../engine/random";

export interface Scenario {
    times: number[];
    prices: Record<string, number[]>; // assetId -> price series, same length as times
}

interface ScenarioStore {
    scenarios: Scenario[];
    generate: () => void;
}

export const useScenarioStore = create<ScenarioStore>((set) => ({
    scenarios: [],
    generate: () => {
        const assets = useAssetStore.getState().assets;
        const { years, stepsPerYear, numSimulations } = useSimConfigStore.getState();

        const scenarios: Scenario[] = Array.from({ length: numSimulations }, (_, _i) => {
            const prices: Record<string, number[]> = {};
            let times: number[] = [];
            for (const asset of assets) {
                const def = ASSET_REGISTRY[asset.type];
                const path = def.generatePreviewPath(asset.params, years, stepsPerYear, rng);
                prices[asset.id] = path.map((p) => p.price);
                times = path.map((p) => p.t);
            }
            return { times, prices };
        });

        set({ scenarios });
    },
}));