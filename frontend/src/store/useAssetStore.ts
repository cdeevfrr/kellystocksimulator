import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AssetConfig } from "../engine/AssetTypes";

interface AssetStore {
  assets: AssetConfig[];
  addAsset: (a: AssetConfig) => void;
  updateAsset: (id: string, patch: Partial<AssetConfig>) => void;
  removeAsset: (id: string) => void;
}

export const useAssetStore = create<AssetStore>()(
  persist(
    (set) => ({
      assets: [],
      addAsset: (a) => set((s) => ({ assets: [...s.assets, a] })),
      updateAsset: (id, patch) =>
        set((s) => ({
          assets: s.assets.map((a) => (a.id === id ? ({ ...a, ...patch } as AssetConfig) : a)),
        })),
      removeAsset: (id) => set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),
    }),
    { name: "asset-store" } // localStorage key
  )
);