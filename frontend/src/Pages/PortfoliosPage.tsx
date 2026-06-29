// pages/PortfoliosPage.tsx
import { useState } from "react";
import {
  PORTFOLIO_MODULES,
  type PortfolioConfig,
  type PortfolioType,
} from "../engine/Portfolio/PortfolioTypes";
import { usePortfolioStore } from "../store/usePortfolioStore";
import { useAssetStore } from "../store/useAssetStore";
import { SliderField } from "../components/SliderField";
import { WeightsEditor } from "../components/WeightsEditor";

function PortfolioEditorSection({
    config,
    onChange,
}: {
    config: PortfolioConfig;
    onChange: (config: PortfolioConfig) => void;
}) {
    return (<>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '0.5em' }}>
            <h2>{PORTFOLIO_MODULES[config.type].label}</h2>
            <input
                value={config.name}
                onChange={(e) => onChange({ ...config, name: e.target.value })}
            />
        </div>
        <PortfolioEditor config={config} onChange={onChange} />
    </>)
}

function PortfolioEditor({
    config,
    onChange,
}: {
    config: PortfolioConfig;
    onChange: (config: PortfolioConfig) => void;
}) {
    switch (config.type) {
        case "buyAndHold":
            return (
                <WeightsEditor
                    weights={config.params.weights}
                    onChange={(weights) => onChange({ ...config, params: { weights } })}
                />
            );
        case "periodicRebalance":
            return (
                <>
                    <WeightsEditor
                        weights={config.params.weights}
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
        const module = PORTFOLIO_MODULES[type];
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
            {/* List portfolios */}
            <div style={{ width: 220 }}>
                {portfolios.map((p) => (
                    <div key={p.id} onClick={() => setSelectedId(p.id)}>
                        <label>{p.name}</label>
                        <button onClick={() => removePortfolio(p.id)}>✕</button>
                    </div>
                ))}
                {Object.keys(PORTFOLIO_MODULES).map((type) => (
                    <button key={type} onClick={() => createPortfolio(type as PortfolioType)}>
                        + {PORTFOLIO_MODULES[type as PortfolioType].label}
                    </button>
                ))}
            </div>
            {/* Detail view for selected portfolio */}
            {selected && (
                <div style={{ flex: 1 }}>
                    <PortfolioEditorSection
                        config={selected}
                        onChange={(updated) => updatePortfolio(selected.id, updated)}
                    />
                </div>
            )}
        </div>
    );
}