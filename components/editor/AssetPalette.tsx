"use client";

import { useTranslations } from "next-intl";
import { ASSET_DEFAULTS, ASSET_IDS, type AssetId } from "@/lib/scene";
import { useEditorStore } from "@/stores/editorStore";

const ASSET_ICONS: Record<AssetId, string> = {
  pine: "🌲",
  broadleaf: "🌳",
  bush: "🌿",
  rock: "🪨",
  flower: "🌸",
  mushroom: "🍄",
  pond: "💧",
};

export default function AssetPalette() {
  const t = useTranslations("editor.assets");
  const tui = useTranslations("editor");
  const placingAsset = useEditorStore((s) => s.placingAsset);
  const setPlacingAsset = useEditorStore((s) => s.setPlacingAsset);

  return (
    <div className="glass-leaf pointer-events-auto flex max-w-full gap-1 overflow-x-auto px-3 py-2 sm:flex-col sm:gap-1.5 sm:px-3 sm:py-4">
      {ASSET_IDS.map((asset) => {
        const active = placingAsset === asset;
        return (
          <button
            key={asset}
            onClick={() => setPlacingAsset(active ? null : asset)}
            title={t(asset)}
            aria-pressed={active}
            className={`seed-pill flex shrink-0 items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-moss text-mist" : "text-fir-soft hover:bg-mist-deep"
            }`}
          >
            <span aria-hidden>{ASSET_ICONS[asset]}</span>
            <span className="hidden sm:inline">{t(asset)}</span>
            <span
              aria-hidden
              className="ml-auto hidden size-3 rounded-full sm:block"
              style={{ backgroundColor: ASSET_DEFAULTS[asset].tint }}
            />
          </button>
        );
      })}
      {placingAsset && (
        <p className="hidden max-w-36 px-2 pt-2 text-xs text-fir-soft sm:block">
          {tui("plantHint")}
        </p>
      )}
    </div>
  );
}
