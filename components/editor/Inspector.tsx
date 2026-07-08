"use client";

import { useTranslations } from "next-intl";
import { TINT_SWATCHES } from "@/lib/scene";
import { useEditorStore } from "@/stores/editorStore";

export default function Inspector() {
  const t = useTranslations("editor");
  const selectedId = useEditorStore((s) => s.selectedId);
  const object = useEditorStore((s) =>
    s.objects.find((o) => o.id === s.selectedId),
  );
  const updateObject = useEditorStore((s) => s.updateObject);
  const removeObject = useEditorStore((s) => s.removeObject);

  if (!selectedId || !object) return null;

  return (
    <div className="glass-leaf glass-leaf-flip pointer-events-auto flex w-60 flex-col gap-4 px-5 py-5">
      <h3 className="font-display text-lg font-bold text-fir">
        {t(`assets.${object.asset}`)}
      </h3>

      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-fir-soft">
        {t("size")}
        <input
          type="range"
          min={0.4}
          max={2.5}
          step={0.05}
          value={object.scale}
          onChange={(e) =>
            updateObject(selectedId, { scale: Number(e.target.value) })
          }
          className="accent-moss"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-fir-soft">
        {t("rotation")}
        <input
          type="range"
          min={0}
          max={Math.PI * 2}
          step={0.05}
          value={object.rotationY}
          onChange={(e) =>
            updateObject(selectedId, { rotationY: Number(e.target.value) })
          }
          className="accent-moss"
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-fir-soft">
          {t("color")}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {TINT_SWATCHES.map((tint) => (
            <button
              key={tint}
              onClick={() => updateObject(selectedId, { tint })}
              aria-label={tint}
              className={`size-6 rounded-full border-2 transition-transform hover:scale-110 ${
                object.tint === tint ? "border-fir" : "border-white/60"
              }`}
              style={{ backgroundColor: tint }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => removeObject(selectedId)}
        className="seed-pill mt-1 bg-red-700/85 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
      >
        {t("delete")}
      </button>
    </div>
  );
}
