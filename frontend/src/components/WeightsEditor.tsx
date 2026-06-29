import { totalAllocated, type Allocation } from "../engine/Portfolio/PortfolioTypes";
import { useAssetStore } from "../store/useAssetStore";
import { SliderField } from "./SliderField";

export function WeightsEditor({
  weights,
  onChange,
}: {
  weights: Allocation;
  onChange: (weights: Allocation) => void;
}) {
  const { assets } = useAssetStore();
  return (
    <>
      {assets.map((asset) => (
        <SliderField
          key={asset.id}
          label={`${asset.name} weight`}
          min={0}
          max={1}
          step={0.01}
          value={weights[asset.id] ?? 0}
          onChange={(v) => {
            const proposed = {...weights, [asset.id]: v}
            // If proposed sums to more than 1, rescale things other than v.
            const sum = totalAllocated(weights)
            if (sum > 1){
              const rescaledOthers = rescale({ ...proposed, [asset.id]: 0 }, 1-v)
              onChange({...rescaledOthers, [asset.id]: v})
            } else {
              onChange(proposed)
            }
          }}
        />
      ))}
      <p style={{ opacity: 0.7 }}>
        Sum of weights: {Object.values(weights).reduce((a, b) => a + b, 0).toFixed(2)} — If less than 1, the rest is uninvested cash.
      </p>
    </>
  );
}

// Helper function used in practice to rescale every _other_ weight to sum to (1-thisWeight).
function rescale(weights: Allocation, target: number): Allocation {
  // return {weights[i] / (sum[weights] / target)}
  const sum = totalAllocated(weights)
  return Object.fromEntries(Object.entries(weights).map( (entry) => {
    return [entry[0], entry[1] / sum * target]
  }))
}
