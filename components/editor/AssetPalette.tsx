"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ASSET_DEFAULTS,
  ASSET_THEMES,
  USER_TYPE_THEMES,
  type AssetId,
  type AssetTheme,
} from "@/lib/scene";
import { useEditorStore } from "@/stores/editorStore";
import { useUser } from "@/lib/supabase/useUser";

const ASSET_ICONS: Record<AssetId, string> = {
  pine: "🌲",
  broadleaf: "🌳",
  bush: "🌿",
  rock: "🪨",
  flower: "🌸",
  mushroom: "🍄",
  pond: "💧",
  building: "🏢",
  streetlamp: "💡",
  bench: "🪑",
  tripod: "📷",
  frame: "🖼️",
  pedestal: "🏛️",
  easel: "🎨",
};

const THEMES: { id: AssetTheme; icon: string }[] = [
  { id: "nature", icon: "🌿" },
  { id: "urban", icon: "📷" },
  { id: "art", icon: "🎨" },
];

export default function AssetPalette() {
  const t = useTranslations("editor.assets");
  const tui = useTranslations("editor");
  const tTheme = useTranslations("editor.themes");
  const placingAsset = useEditorStore((s) => s.placingAsset);
  const setPlacingAsset = useEditorStore((s) => s.setPlacingAsset);
  const { user, supabase } = useUser();
  const [theme, setTheme] = useState<AssetTheme>("nature");
  const [themeTouched, setThemeTouched] = useState(false);
  const [chosenThemes, setChosenThemes] = useState<Set<AssetTheme>>(
    () => new Set(),
  );

  // Open the palette on the signed-in user's first chosen theme,
  // and mark every theme matching their scenario types.
  useEffect(() => {
    if (!user || !supabase) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("user_types")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const userTypes: string[] = Array.isArray(data?.user_types)
          ? data.user_types
          : [];
        const themes = userTypes
          .map((typ) => USER_TYPE_THEMES[typ])
          .filter(Boolean);
        setChosenThemes(new Set(themes));
        if (!themeTouched && themes[0]) setTheme(themes[0]);
      });
    return () => {
      cancelled = true;
    };
  }, [user, supabase, themeTouched]);

  return (
    <div className="glass-leaf pointer-events-auto flex max-w-full flex-col gap-1 overflow-x-auto px-3 py-2 sm:gap-1.5 sm:py-3">
      <div className="flex shrink-0 gap-1" role="tablist">
        {THEMES.map(({ id, icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={theme === id}
            title={tTheme(id)}
            onClick={() => {
              setTheme(id);
              setThemeTouched(true);
            }}
            className={`seed-pill flex-1 px-2 py-1.5 text-sm transition-colors ${
              theme === id
                ? "bg-pollen font-semibold text-fir"
                : "text-fir-soft hover:bg-mist-deep"
            }`}
          >
            <span aria-hidden>{icon}</span>
            <span className="ml-1 hidden text-xs sm:inline">{tTheme(id)}</span>
            {chosenThemes.has(id) && (
              <span
                aria-hidden
                className="ml-0.5 inline-block size-1.5 rounded-full bg-moss align-middle"
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-1 sm:flex-col sm:gap-1.5">
        {ASSET_THEMES[theme].map((asset) => {
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
      </div>

      {placingAsset && (
        <p className="hidden max-w-36 px-2 pt-2 text-xs text-fir-soft sm:block">
          {tui("plantHint")}
        </p>
      )}
    </div>
  );
}
