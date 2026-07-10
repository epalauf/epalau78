"use client";

import { useTranslations } from "next-intl";
import { TINT_SWATCHES } from "@/lib/scene";
import { useEditorStore } from "@/stores/editorStore";
import ColorPicker from "./ColorPicker";

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
    <div className="glass-leaf glass-leaf-flip pointer-events-auto flex max-h-full w-60 flex-col gap-4 overflow-y-auto px-5 py-5">
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

      {object.mounted && (
        <div className="flex flex-col gap-1.5 text-xs text-fir-soft">
          <span>🖼️ {t("onWall")}</span>
          <button
            onClick={() => updateObject(selectedId, { mounted: undefined })}
            className="seed-pill self-start border border-mist-deep px-3 py-1.5 font-medium transition-colors hover:bg-mist-deep"
          >
            {t("detach")}
          </button>
        </div>
      )}

      {!object.mounted && (
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
      )}

      {object.asset === "frame" && !object.mounted && (
        <>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-fir-soft">
            {t("tiltX")}
            <input
              type="range"
              min={-Math.PI / 2}
              max={Math.PI / 2}
              step={0.02}
              value={object.rotationX ?? 0}
              onChange={(e) =>
                updateObject(selectedId, { rotationX: Number(e.target.value) })
              }
              className="accent-moss"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-fir-soft">
            {t("tiltZ")}
            <input
              type="range"
              min={-Math.PI / 2}
              max={Math.PI / 2}
              step={0.02}
              value={object.rotationZ ?? 0}
              onChange={(e) =>
                updateObject(selectedId, { rotationZ: Number(e.target.value) })
              }
              className="accent-moss"
            />
          </label>
        </>
      )}

      {(object.asset === "frame" || object.asset === "easel") && (
        <>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-fir-soft">
            {t("artTitle")}
            <input
              type="text"
              maxLength={120}
              value={object.title ?? ""}
              onChange={(e) =>
                updateObject(selectedId, {
                  title: e.target.value || undefined,
                })
              }
              placeholder={t("artTitlePlaceholder")}
              className="seed-pill border border-mist-deep bg-white/70 px-3 py-1.5 text-sm font-normal normal-case tracking-normal text-fir outline-none transition focus:border-moss focus:bg-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-fir-soft">
            {t("artNote")}
            <textarea
              maxLength={600}
              rows={3}
              value={object.description ?? ""}
              onChange={(e) =>
                updateObject(selectedId, {
                  description: e.target.value || undefined,
                })
              }
              placeholder={t("artNotePlaceholder")}
              className="rounded-2xl border border-mist-deep bg-white/70 px-3 py-2 text-sm font-normal normal-case tracking-normal text-fir outline-none transition focus:border-moss focus:bg-white"
            />
          </label>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-fir-soft">
          {t("color")}
        </span>
        <ColorPicker
          swatches={TINT_SWATCHES}
          value={object.tint}
          onChange={(tint) => updateObject(selectedId, { tint })}
          customLabel={t("customColor")}
        />
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
