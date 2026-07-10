"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@/lib/supabase/useUser";
import {
  USER_IMAGES_BUCKET,
  compressImage,
  userImagePublicUrl,
} from "@/lib/images";
import { useEditorStore } from "@/stores/editorStore";

type StoredImage = { path: string; url: string };

export default function MyImagesPanel() {
  const t = useTranslations("editor.images");
  const { user, supabase } = useUser();
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<StoredImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const startPlacingImage = useEditorStore((s) => s.startPlacingImage);
  const placingImage = useEditorStore((s) => s.placingImage);

  const refresh = useCallback(async () => {
    if (!user || !supabase) return;
    const { data, error: listError } = await supabase.storage
      .from(USER_IMAGES_BUCKET)
      .list(user.id, {
        limit: 60,
        sortBy: { column: "created_at", order: "desc" },
      });
    if (listError) {
      setError(t("loadError"));
      return;
    }
    setImages(
      (data ?? [])
        .filter((f) => !f.name.startsWith("."))
        .map((f) => ({
          path: `${user.id}/${f.name}`,
          url: userImagePublicUrl(`${user.id}/${f.name}`),
        })),
    );
  }, [user, supabase, t]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user || !supabase) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await compressImage(file);
      const path = `${user.id}/${crypto.randomUUID()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from(USER_IMAGES_BUCKET)
        .upload(path, blob, { contentType: "image/webp" });
      if (uploadError) throw uploadError;
      await refresh();
    } catch {
      setError(t("uploadError"));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(path: string) {
    if (!supabase) return;
    await supabase.storage.from(USER_IMAGES_BUCKET).remove([path]);
    setImages((imgs) => imgs.filter((i) => i.path !== path));
  }

  return (
    <div className="pointer-events-auto flex flex-col items-start gap-2">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`glass-leaf seed-pill px-4 py-2 text-sm font-medium transition-colors ${
          open ? "text-fir" : "text-fir-soft"
        }`}
      >
        🖼️ {t("title")}
      </button>

      {open && (
        <div className="glass-leaf flex w-60 flex-col gap-2 px-4 py-4">
          {!user ? (
            <p className="text-xs text-fir-soft">{t("signInPrompt")}</p>
          ) : (
            <>
              <button
                onClick={() => fileInput.current?.click()}
                disabled={busy}
                className="seed-pill bg-moss px-3 py-2 text-sm font-semibold text-mist transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {busy ? t("uploading") : `+ ${t("upload")}`}
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />

              {error && (
                <p className="text-xs font-medium text-red-700" role="alert">
                  {error}
                </p>
              )}

              {images.length === 0 && !busy ? (
                <p className="text-xs text-fir-soft">{t("empty")}</p>
              ) : (
                <div className="grid max-h-56 grid-cols-3 gap-1.5 overflow-y-auto">
                  {images.map((img) => (
                    <div key={img.path} className="group relative">
                      <button
                        onClick={() => startPlacingImage(img.path)}
                        title={t("hang")}
                        className={`block w-full overflow-hidden rounded-lg border-2 transition ${
                          placingImage === img.path
                            ? "border-moss"
                            : "border-transparent hover:border-pollen"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt=""
                          className="aspect-square w-full object-cover"
                          loading="lazy"
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(img.path)}
                        title={t("delete")}
                        className="absolute -right-1 -top-1 hidden size-5 items-center justify-center rounded-full bg-fir text-[10px] text-mist group-hover:flex"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-fir-soft">{t("hint")}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
