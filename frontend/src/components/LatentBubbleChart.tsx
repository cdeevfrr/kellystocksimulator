// LatentBubbleChart.tsx
import { useMemo, useState } from "react";
import { generateLatentPath, type LatentModelParams } from "../engine/LatentModel";
import { rng } from "../engine/random";

type ParamsList = LatentModelParams & {
    years: number,
    stepsPerYear: number,
    seedBase: number,
}

const SLIDER_CONFIG: Record<keyof Omit<ParamsList, "seedBase">, { min: number; max: number; step: number }> = {
    mu: { min: -0.2, max: 0.3, step: 0.01 },
    sigma: { min: 0, max: 0.6, step: 0.01 },
    bubbleExcessMu: { min: 0, max: 0.5, step: 0.01 },
    hazardRatePerDivergence: { min: 0, max: 3, step: 0.05 },
    crashMu: { min: -3, max: 0, step: 0.05 },
    crashEndRate: { min: 0, max: 1, step: 0.05 },
    initialPrice: { min: 1, max: 500, step: 1 },
    initialFairPrice: { min: 1, max: 500, step: 1 },
    years: { min: 1, max: 20, step: 1 },
    stepsPerYear: { min: 12, max: 365, step: 1 },
};

const defaultParams: ParamsList = {
    mu: 0.06,
    sigma: 0.2,
    bubbleExcessMu: 0.15,
    hazardRatePerDivergence: 0.5,
    crashMu: -1.5,
    crashEndRate: 0.3,
    initialPrice: 100,
    initialFairPrice: 100,
    years: 3,
    stepsPerYear: 252,
    seedBase: Math.round(Math.random() * 100),
};

const NUM_PATHS = 3;
const COLORS: Array<{ base: string, light: string }> = [
    { base: "#2563eb", light: "" },
    { base: "#dc2626", light: "" },
    { base: "#16a34a", light: "" },
]
const WIDTH = 700;
const HEIGHT = 400;
const PAD = 40;

export default function LatentBubbleChart() {
    const [params, setParams] = useState<ParamsList>(defaultParams);

    // Because we memo on seedBase (part of params), 
    // this will recalculate whenever seed base is changed.
    // The fact that generatePath doesn't use seedBase for now is ignored. If we want
    // reproducability, just make RNG be generatable from a seed base; not currently a
    // needed feature.
    const paths = useMemo(
        () =>
            Array.from({ length: NUM_PATHS }, (_, _i) =>
                generateLatentPath(params, params.years, params.stepsPerYear, rng)
            ),
        [params]
    );

    const allPrices = paths.flat().flatMap(p => [p.price, p.fairPrice]);
    const minP = Math.min(...allPrices);
    const maxP = Math.max(...allPrices);

    function toXY(t: number, price: number): [number, number] {
        const x = PAD + (t / params.years) * (WIDTH - 2 * PAD);
        const y = HEIGHT - PAD - ((price - minP) / (maxP - minP || 1)) * (HEIGHT - 2 * PAD);
        return [x, y];
    }

    function sliderField(label: string, key: keyof Omit<ParamsList, 'seedBase'>) {
        const { min, max, step } = SLIDER_CONFIG[key];
        return (
            <label style={{ display: "block", marginBottom: 10, fontSize: 13 }}>
                {label}: {params[key]}
                <input
                    type="range"
                    min={min} max={max} step={step}
                    value={params[key]}
                    onChange={e => setParams(p => ({ ...p, [key]: parseFloat(e.target.value) }))}
                    style={{ display: "block", width: "100%" }}
                />
            </label>
        );
    }

    return (
        <div style={{ display: "flex", gap: 24, fontFamily: "sans-serif" }}>
            <div style={{ minWidth: 220 }}>
                <h3>Latent Bubble Model</h3>
                {sliderField("Fair drift (mu)", "mu")}
                {sliderField("Volatility (sigma)", "sigma")}
                {sliderField("Bubble excess mu", "bubbleExcessMu")}
                {sliderField("Hazard / divergence", "hazardRatePerDivergence")}
                {sliderField("Crash mu", "crashMu")}
                {sliderField("Crash end rate", "crashEndRate")}
                {sliderField("Initial price", "initialPrice")}
                {sliderField("Initial fair price", "initialFairPrice")}
                {sliderField("Years", "years")}
                {sliderField("Steps/year", "stepsPerYear")}

                <button style={{ marginTop: 12 }} onClick={() => {
                    setParams(p => ({ ...p, seedBase: params.seedBase + 1 }))
                }}>
                    Resample (new seed)
                </button>
            </div>

            <svg width={WIDTH} height={HEIGHT} style={{ border: "1px solid #ccc" }}>
                {paths.map((path, i) => (
                    <polyline
                        key={i}
                        fill="none"
                        stroke={COLORS[i % COLORS.length].base}
                        strokeWidth={1.5}
                        points={path.map(p => toXY(p.t, p.price).join(",")).join(" ")}
                    />
                ))}
                {/* fair price reference, dashed */}
                {paths.map((path, i) => (
                    <polyline
                        fill="none"
                        stroke={COLORS[i % COLORS.length].base}
                        strokeDasharray="4 4"
                        strokeWidth={1}
                        points={path.map(p => toXY(p.t, p.fairPrice).join(",")).join(" ")}
                    />
                ))}

            </svg>
        </div>
    );
}