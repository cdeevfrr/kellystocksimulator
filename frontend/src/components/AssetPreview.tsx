import { useMemo, useState } from "react";
import { ASSET_REGISTRY } from "../engine/Asset/AssetRegistry";
import type { AssetConfig } from "../engine/Asset/AssetTypes";
import { rng } from "../engine/random";
import { SliderField } from "./SliderField";
import { PathChart } from "./PathChart";

// Preview asset paths. Asset specific config (eg, mu and sigma) are stored in the 'config' object.
export function AssetPreview({ config, years, stepsPerYear, onParamsChange }: {
  config: AssetConfig;
  years: number;
  stepsPerYear: number;
  onParamsChange: (params: any) => void;
}) {
  const def = ASSET_REGISTRY[config.type];
  const [seedBase, setSeedBase] = useState(Math.round(Math.random() * 100));

  // This cast is used to tell typescript to ignore whether the keys of
  // params are what it expects. It's safe because of how we 
  // constructed the registry: sliderConfig's keys always match this
  // asset's params shape. TS can't verify this across the registry's
  // type-erased boundary, so we just call all params keys "string" rather than threading
  // a generic through AssetPreview's props.
  const params = config.params as unknown as Record<string, number>;

  const paths = useMemo(
    () => Array.from({ length: 3 }, (_, i) =>
      def.generatePreviewPath(config.params, years, stepsPerYear, rng)
    ),
    [config.params, years, stepsPerYear, seedBase]
  );

  return (
    <div style={{ display: "flex", gap: 24 }}>
      <div>
        {Object.keys(def.sliderConfig).map((key) => (
          <SliderField
            key={key}
            label={key}
            value={params[key]}
            {...def.sliderConfig[key]}
            onChange={(v: any) => onParamsChange({ ...config.params, [key]: v })}
          />
        ))}
        <button onClick={() => setSeedBase((s) => s + 1)}>Resample</button>
      </div>
      <PathChart paths={paths} years={years} />
    </div>
  );
}

