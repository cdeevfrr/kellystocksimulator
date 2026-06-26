// LatentBubbleChart.tsx
import { useMemo, useState } from "react";
import { generateLatentPath, type LatentModelParams } from "../engine/LatentModel";
import { rng } from "../engine/random";

const defaultParams: LatentModelParams = {
  mu: 0.06,
  sigma: 0.2,
  bubbleExcessMu: 0.15,
  hazardRatePerDivergence: 0.5,
  crashMu: -1.5,
  crashEndRate: 0.3,
  initialPrice: 100,
  initialFairPrice: 100,
};

const NUM_PATHS = 3;
const COLORS = ["#2563eb", "#dc2626", "#16a34a"];
const WIDTH = 700;
const HEIGHT = 400;
const PAD = 40;

export default function LatentBubbleChart() {
  const [params, setParams] = useState(defaultParams);
  const [years, setYears] = useState(3);
  const [stepsPerYear, setStepsPerYear] = useState(252);
  const [seedBase, setSeedBase] = useState(1);

  const paths = useMemo(
    () =>
      Array.from({ length: NUM_PATHS }, (_, i) =>
        generateLatentPath(params, years, stepsPerYear, rng)
      ),
    [params, years, stepsPerYear, seedBase]
  );

  const allPrices = paths.flat().flatMap(p => [p.price, p.fairPrice]);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);

  function toXY(t: number, price: number): [number, number] {
    const x = PAD + (t / years) * (WIDTH - 2 * PAD);
    const y = HEIGHT - PAD - ((price - minP) / (maxP - minP || 1)) * (HEIGHT - 2 * PAD);
    return [x, y];
  }

  function field(label: string, key: keyof LatentModelParams, step = 0.01) {
    return (
      <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
        {label}
        <input
          type="value"
          step={step}
          value={params[key]}
          onChange={e =>
            setParams(p => ({ ...p, [key]: parseFloat(e.target.value) }))
          }
          style={{ marginLeft: 8, width: 90 }}
        />
      </label>
    );
  }

  return (
    <div style={{ display: "flex", gap: 24, fontFamily: "sans-serif" }}>
      <div style={{ minWidth: 220 }}>
        <h3>Latent Bubble Model</h3>
        {field("Fair drift (mu)", "mu")}
        {field("Volatility (sigma)", "sigma")}
        {field("Bubble excess mu", "bubbleExcessMu")}
        {field("Hazard / divergence", "hazardRatePerDivergence")}
        {field("Crash mu", "crashMu", 0.1)}
        {field("Crash end rate", "crashEndRate")}
        {field("Initial price", "initialPrice", 1)}
        {field("Initial fair price", "initialFairPrice", 1)}

        <label style={{ display: "block", marginTop: 12 }}>
          Years
          <input
            type="number"
            min={1}
            max={5}
            value={years}
            onChange={e => setYears(parseFloat(e.target.value))}
            style={{ marginLeft: 8, width: 60 }}
          />
        </label>
        <label style={{ display: "block", marginTop: 6 }}>
          Steps/year
          <input
            type="number"
            value={stepsPerYear}
            onChange={e => setStepsPerYear(parseInt(e.target.value))}
            style={{ marginLeft: 8, width: 60 }}
          />
        </label>

        <button style={{ marginTop: 12 }} onClick={() => setSeedBase(s => s + 1)}>
          Resample (new seed)
        </button>
      </div>

      <svg width={WIDTH} height={HEIGHT} style={{ border: "1px solid #ccc" }}>
        {/* fair price reference, dashed */}
        <polyline
          fill="none"
          stroke="#999"
          strokeDasharray="4 4"
          strokeWidth={1}
          points={paths[0].map(p => toXY(p.t, p.fairPrice).join(",")).join(" ")}
        />
        {paths.map((path, i) => (
          <polyline
            key={i}
            fill="none"
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={1.5}
            points={path.map(p => toXY(p.t, p.price).join(",")).join(" ")}
          />
        ))}
      </svg>
    </div>
  );
}