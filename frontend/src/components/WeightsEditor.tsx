import { SliderField } from "./SliderField";

export function WeightsEditor({
  weights,
  assetIds,
  onChange,
}: {
  weights: Record<string, number>;
  assetIds: string[];
  onChange: (weights: Record<string, number>) => void;
}) {
  return (
    <>
      {assetIds.map((id) => (
        <SliderField
          key={id}
          label={`weight: ${id}`}
          min={0}
          max={1}
          step={0.01}
          value={weights[id] ?? 0}
          onChange={(v) => onChange({ ...weights, [id]: v })}
        />
      ))}
      <p style={{ opacity: 0.7 }}>
        Sum of weights: {Object.values(weights).reduce((a, b) => a + b, 0).toFixed(2)} — doesn't need to
        be exactly 1; evaluate() will treat the rest as uninvested cash.
      </p>
    </>
  );
}