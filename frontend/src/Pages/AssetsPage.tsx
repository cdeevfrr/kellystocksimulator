import { useState } from "react";
import { ASSET_REGISTRY } from "../engine/AssetRegistry.ts";
import { AssetPreview } from "../components/AssetPreview.tsx";
import type { AssetType } from "../engine/AssetTypes.ts";
import { useAssetStore } from "../store/useAssetStore.ts"
import { SliderField } from "../components/SliderField.tsx";

// pages/AssetsPage.tsx
export function AssetsPage() {
  const { assets, addAsset, updateAsset, removeAsset } = useAssetStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [years, setYears] = useState(5);
  const [stepsPerYear, setStepsPerYear] = useState(252);

  const selected = assets.find((a) => a.id === selectedId);

  function createAsset(type: AssetType) {
    const def = ASSET_REGISTRY[type];
    const newAsset = { id: crypto.randomUUID(), name: `New ${def.label}`, color: "#888", type, params: def.defaultParams };
    addAsset(newAsset);
    setSelectedId(newAsset.id);
  }

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: 220 }}>
        {assets.map((a) => (
          <div key={a.id} onClick={() => setSelectedId(a.id)}>
            {a.name} <button onClick={() => removeAsset(a.id)}>✕</button>
          </div>
        ))}
        {Object.keys(ASSET_REGISTRY).map((t) => (
          <button key={t} onClick={() => createAsset(t as AssetType)}>+ {ASSET_REGISTRY[t as AssetType].label}</button>
        ))}
      </div>
      {selected && (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '0.5em'}}>
                <h2>Previewing: </h2>
                <input
                    value={selected.name}
                    onChange={(e) => updateAsset(selected.id, { name: e.target.value })}
                    style={{ }}
                />
            </div>
            <div style={{width:"40%"}}>
                <SliderField
                  label="years"
                  min={1}
                  max={20}
                  step={.25}
                  value={years}
                  onChange={(newVal) => setYears(newVal)}
                />
                <SliderField
                  label="Steps Per Year"
                  min={12}
                  max={365}
                  step={1}
                  value={stepsPerYear}
                  onChange={(newVal) => setStepsPerYear(newVal)}
                />
            </div>
            <AssetPreview
            config={selected}
            years={years}
            stepsPerYear={stepsPerYear}
            onParamsChange={(params) => updateAsset(selected.id, { params })}
            />
        </div>
      )}
    </div>
  );
}