// store/useSimConfigStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SimConfigStore {
    years: number;
    stepsPerYear: number;
    numSimulations: number;
    setYears: (y: number) => void;
    setStepsPerYear: (s: number) => void;
    setNumSimulations: (n: number) => void;
}

export const useSimConfigStore = create<SimConfigStore>()(
    persist(
        (set) => ({
            years: 5,
            stepsPerYear: 252,
            numSimulations: 100,
            setYears: (years) => set({ years }),
            setStepsPerYear: (stepsPerYear) => set({ stepsPerYear }),
            setNumSimulations: (numSimulations) => set({ numSimulations }),
        }),
        { name: "sim-config-store" }
    )
);