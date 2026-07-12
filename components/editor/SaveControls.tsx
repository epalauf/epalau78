"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEditorStore } from "@/stores/editorStore";
import { useUser } from "@/lib/supabase/useUser";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { captureCanvasThumbnail } from "@/lib/thumbnail";
import type { createClient } from "@/lib/supabase/client";

async function uploadThumbnail(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  creationId: string,
): Promise<string | null> {
  const blob = await captureCanvasThumbnail();
  if (!blob) return null;
  const path = `${userId}/${creationId}.jpg`;
  const { error } = await supabase.storage
    .from("thumbnails")
    .upload(path, blob, { contentType: "image/jpeg", upsert: true });
  if (error) return null;
  const { data } = supabase.storage.from("thumbnails").getPublicUrl(path);
  // Cache-bust so updated thumbnails show immediately
  return `${data.publicUrl}?v=${Date.now()}`;
}

export default function SaveControls() {
  const t = useTranslations("editor");
  const router = useRouter();
  const { user, supabase } = useUser();
  const title = useEditorStore((s) => s.title);
  const setTitle = useEditorStore((s) => s.setTitle);
  const creationId = useEditorStore((s) => s.creationId);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function handleSave() {
    if (!isSupabaseConfigured) return;
    if (!user || !supabase) {
      router.push("/login");
      return;
    }
    setStatus("saving");
    const { serialize, title: currentTitle } = useEditorStore.getState();
    const sceneData = serialize();
    const finalTitle = currentTitle.trim() || t("untitled");

    let savedId = creationId;
    let failed = false;

    if (creationId) {
      const { error } = await supabase
        .from("creations")
        .update({ title: finalTitle, scene_data: sceneData })
        .eq("id", creationId);
      failed = Boolean(error);
    } else {
      const { data, error } = await supabase
        .from("creations")
        .insert({
          user_id: user.id,
          title: finalTitle,
          scene_data: sceneData,
        })
        .select("id")
        .single();
      failed = Boolean(error);
      if (data) {
        savedId = data.id;
        useEditorStore.setState({ creationId: data.id });
      }
    }

    if (!failed && savedId) {
      const thumbnailUrl = await uploadThumbnail(supabase, user.id, savedId);
      if (thumbnailUrl) {
        await supabase
          .from("creations")
          .update({ thumbnail_url: thumbnailUrl })
          .eq("id", savedId);
      }
    }

    setStatus(failed ? "error" : "saved");
    setTimeout(() => setStatus("idle"), 2500);
  }

  const label =
    status === "saving"
      ? t("saving")
      : status === "saved"
        ? t("saved")
        : status === "error"
          ? t("saveError")
          : t("save");

  return (
    <div className="glass-leaf pointer-events-auto flex items-center gap-2 px-4 py-2">
      <input
        type="text"
        value={title}
        maxLength={60}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("titlePlaceholder")}
        className="seed-pill w-28 border border-mist-deep bg-white/70 px-3 py-1.5 text-sm text-fir outline-none transition focus:border-moss sm:w-52"
      />
      <button
        onClick={handleSave}
        disabled={status === "saving" || !isSupabaseConfigured}
        title={!isSupabaseConfigured ? t("notConfigured") : undefined}
        className={`seed-pill px-4 py-1.5 text-sm font-semibold transition-all disabled:opacity-60 ${
          status === "saved"
            ? "bg-leaf text-fir"
            : status === "error"
              ? "bg-red-700/85 text-white"
              : "bg-pollen text-fir hover:scale-105"
        }`}
      >
        {label}
      </button>
    </div>
  );
}
