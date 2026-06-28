// pages/PortfoliosPage.tsx
import { useState } from "react";
import {
  PORTFOLIO_MODULES,
  PORTFOLIO_TYPE_LIST,
  type PortfolioConfig,
  type PortfolioType,
} from "../engine/Portfolio/PortfolioTypes";
import { usePortfolioStore } from "../store/usePortfolioStore";
import { useAssetStore } from "../store/useAssetStore";
import { SliderField } from "../components/SliderField";
import { WeightsEditor } from "../components/WeightsEditor";

function PortfolioEditor({
  config,
  assetIds,
  onChange,
}: {
  config: PortfolioConfig;
  assetIds: string[];
  onChange: (config: PortfolioConfig) => void;
}) {
  switch (config.type) {
    case "buyAndHold":
      return (
        <WeightsEditor
          weights={config.params.weights}
          assetIds={assetIds}
          onChange={(weights) => onChange({ ...config, params: { weights } })}
        />
      );
    case "periodicRebalance":
      return (
        <>
          <WeightsEditor
            weights={config.params.weights}
            assetIds={assetIds}
            onChange={(weights) => onChange({ ...config, params: { ...config.params, weights } })}
          />
          <SliderField
            label="rebalance every N steps"
            min={1}
            max={60}
            step={1}
            value={config.params.frequency}
            onChange={(v) => onChange({ ...config, params: { ...config.params, frequency: v } })}
          />
        </>
      );
  }
}

export function PortfoliosPage() {
  const { portfolios, addPortfolio, updatePortfolio, removePortfolio } = usePortfolioStore();
  const { assets } = useAssetStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = portfolios.find((p) => p.id === selectedId);
  const assetIds = assets.map((a) => a.id);

  function createPortfolio(type: PortfolioType) {
    // Narrowed find, not an indexed lookup — keeps module.createDefaultParams
    // and module.type/.label tied together rather than going through `any`.
    const module = PORTFOLIO_MODULES.find((m) => m.type === type);
    if (!module) return;

    const newPortfolio = {
      id: crypto.randomUUID(),
      name: `New ${module.label}`,
      type: module.type,
      params: module.createDefaultParams(assetIds),
    } as PortfolioConfig;

    addPortfolio(newPortfolio);
    setSelectedId(newPortfolio.id);
  }

  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      <div style={{ width: 220 }}>
        {portfolios.map((p) => (
          <div key={p.id} onClick={() => setSelectedId(p.id)}>
            <input
              value={p.name}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => updatePortfolio(p.id, { name: e.target.value })}
            />
            <button onClick={() => removePortfolio(p.id)}>✕</button>
          </div>
        ))}
        {PORTFOLIO_TYPE_LIST.map(({ type, label }) => (
          <button key={type} onClick={() => createPortfolio(type)}>
            + {label}
          </button>
        ))}
      </div>

      {selected && (
        <div style={{ flex: 1 }}>
          <h2>{selected.name}</h2>
          <PortfolioEditor
            config={selected}
            assetIds={assetIds}
            onChange={(updated) => updatePortfolio(selected.id, updated)}
          />
        </div>
      )}
    </div>
  );
}