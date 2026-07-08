"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import CreationThumb from "./CreationThumb";

export type MySpaceRow = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  is_public: boolean;
  updated_at: string;
};

export default function MySpaceCard({
  creation,
}: Readonly<{ creation: MySpaceRow }>) {
  const t = useTranslations("mySpaces");
  const router = useRouter();
  const [title, setTitle] = useState(creation.title);
  const [renaming, setRenaming] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  async function commitRename() {
    setRenaming(false);
    const next = title.trim();
    if (!next || next === creation.title) {
      setTitle(creation.title);
      return;
    }
    const supabase = createClient();
    await supabase.from("creations").update({ title: next }).eq("id", creation.id);
    router.refresh();
  }

  async function togglePublic() {
    setBusy(true);
    const supabase = createClient();
    await supabase
      .from("creations")
      .update({ is_public: !creation.is_public })
      .eq("id", creation.id);
    setBusy(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      setTimeout(() => setConfirmingDelete(false), 3000);
      return;
    }
    setBusy(true);
    const supabase = createClient();
    await supabase.from("creations").delete().eq("id", creation.id);
    router.refresh();
  }

  const actionClass =
    "seed-pill px-3 py-1.5 text-xs font-semibold transition-colors";

  return (
    <div className="glass-leaf overflow-hidden">
      <Link href={`/space/${creation.id}`} className="block">
        <CreationThumb
          thumbnailUrl={creation.thumbnail_url}
          title={creation.title}
          seed={creation.id}
        />
      </Link>
      <div className="flex flex-col gap-3 px-5 py-4">
        {renaming ? (
          <input
            autoFocus
            value={title}
            maxLength={60}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => e.key === "Enter" && commitRename()}
            className="seed-pill border border-mist-deep bg-white/70 px-3 py-1.5 font-display text-lg font-bold text-fir outline-none focus:border-moss"
          />
        ) : (
          <button
            onClick={() => setRenaming(true)}
            title={t("rename")}
            className="text-left font-display text-lg font-bold text-fir hover:text-moss"
          >
            {title}
          </button>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Link
            href={`/create?edit=${creation.id}`}
            className={`${actionClass} bg-moss text-mist hover:scale-105`}
          >
            {t("edit")}
          </Link>
          <button
            onClick={togglePublic}
            disabled={busy}
            className={`${actionClass} ${
              creation.is_public
                ? "bg-pollen text-fir"
                : "bg-mist-deep text-fir-soft"
            } hover:scale-105 disabled:opacity-60`}
          >
            {creation.is_public ? t("public") : t("private")}
          </button>
          <button
            onClick={handleDelete}
            disabled={busy}
            className={`${actionClass} ${
              confirmingDelete
                ? "bg-red-700 text-white"
                : "bg-white/50 text-red-800/80"
            } hover:scale-105 disabled:opacity-60`}
          >
            {confirmingDelete ? t("confirmDelete") : t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
