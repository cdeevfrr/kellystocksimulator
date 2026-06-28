// store/usePortfolioStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PortfolioConfig } from "../engine/Portfolio/PortfolioTypes";

interface PortfolioStore {
    portfolios: PortfolioConfig[];
    addPortfolio: (p: PortfolioConfig) => void;
    updatePortfolio: (id: string, patch: Partial<PortfolioConfig>) => void;
    removePortfolio: (id: string) => void;
}

export const usePortfolioStore = create<PortfolioStore>()(
    persist(
        (set) => ({
            portfolios: [],
            addPortfolio: (p) => set((s) => ({ portfolios: [...s.portfolios, p] })),
            updatePortfolio: (id, patch) =>
                set((s) => ({ portfolios: s.portfolios.map((p) => (p.id === id ? ({ ...p, ...patch } as PortfolioConfig) : p)) })),
            removePortfolio: (id) => set((s) => ({ portfolios: s.portfolios.filter((p) => p.id !== id) })),
        }),
        { name: "portfolio-store" }
    )
);