"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEditorStore } from "@/stores/editorStore";
import { useUser } from "@/lib/supabase/useUser";
import { isSupabaseConfigured } from "@/lib/supabase/config";

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

    if (creationId) {
      const { error } = await supabase
        .from("creations")
        .update({ title: finalTitle, scene_data: sceneData })
        .eq("id", creationId);
      setStatus(error ? "error" : "saved");
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
      if (data) {
        useEditorStore.setState({ creationId: data.id });
      }
      setStatus(error ? "error" : "saved");
    }
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
        className="seed-pill w-36 border border-mist-deep bg-white/70 px-3 py-1.5 text-sm text-fir outline-none transition focus:border-moss sm:w-52"
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
