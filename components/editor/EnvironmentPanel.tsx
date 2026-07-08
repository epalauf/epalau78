"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useEditorStore } from "@/stores/editorStore";

const GROUND_SWATCHES = [
  "#7cb56b",
  "#8ec07a",
  "#a9b665",
  "#8a9a5b",
  "#c9b458",
  "#d4c39a",
  "#e8e4da",
] as const;

const EFFECTS = ["butterflies", "clouds", "fireflies"] as const;
const EFFECT_ICONS: Record<(typeof EFFECTS)[number], string> = {
  butterflies: "🦋",
  clouds: "☁️",
  fireflies: "✨",
};

export default function EnvironmentPanel() {
  const t = useTranslations("editor.environment");
  const [open, setOpen] = useState(true);
  const environment = useEditorStore((s) => s.environment);
  const setEnvironment = useEditorStore((s) => s.setEnvironment);
  const setEffect = useEditorStore((s) => s.setEffect);
  const groundColor = useEditorStore((s) => s.groundColor);
  const setGroundColor = useEditorStore((s) => s.setGroundColor);

  return (
    <div className="glass-leaf pointer-events-auto w-56 px-5 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between font-display text-base font-bold text-fir"
        aria-expanded={open}
      >
        {t("title")}
        <span aria-hidden className="text-fir-soft">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-3.5">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-fir-soft">
            <span>
              🌅 {t("time")}
            </span>
            <input
              type="range"
              min={0.02}
              max={0.98}
              step={0.01}
              value={environment.timeOfDay}
              onChange={(e) =>
                setEnvironment({ timeOfDay: Number(e.target.value) })
              }
              className="accent-moss"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-fir-soft">
            <span>🍃 {t("wind")}</span>
            <input
              type="range"
              min={0}
              max={1.6}
              step={0.05}
              value={environment.windStrength}
              onChange={(e) =>
                setEnvironment({ windStrength: Number(e.target.value) })
              }
              className="accent-moss"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-fir-soft">
              {t("effects")}
            </span>
            <div className="flex gap-1.5">
              {EFFECTS.map((effect) => (
                <button
                  key={effect}
                  onClick={() =>
                    setEffect(effect, !environment.effects[effect])
                  }
                  title={t(effect)}
                  aria-pressed={environment.effects[effect]}
                  className={`seed-pill flex-1 px-2 py-1.5 text-base transition-all ${
                    environment.effects[effect]
                      ? "bg-moss/20 ring-1 ring-moss"
                      : "opacity-40 grayscale hover:opacity-70"
                  }`}
                >
                  {EFFECT_ICONS[effect]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-fir-soft">
              {t("ground")}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {GROUND_SWATCHES.map((color) => (
                <button
                  key={color}
                  onClick={() => setGroundColor(color)}
                  aria-label={color}
                  className={`size-6 rounded-full border-2 transition-transform hover:scale-110 ${
                    groundColor === color ? "border-fir" : "border-white/60"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
