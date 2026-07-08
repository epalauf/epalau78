"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useEditorStore } from "@/stores/editorStore";
import { useUser } from "@/lib/supabase/useUser";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { parseSceneData } from "@/lib/scene";
import EditorScene from "./EditorScene";
import AssetPalette from "./AssetPalette";
import Inspector from "./Inspector";
import SaveControls from "./SaveControls";
import EnvironmentPanel from "./EnvironmentPanel";

export default function Editor() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { user, loading, supabase } = useUser();

  useEffect(() => {
    const store = useEditorStore.getState();

    if (!editId || !isSupabaseConfigured || !supabase || loading) {
      if (!editId && store.creationId) store.clearScene();
      return;
    }

    let cancelled = false;
    supabase
      .from("creations")
      .select("id, user_id, title, scene_data")
      .eq("id", editId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        const scene = parseSceneData(data.scene_data);
        if (!scene) return;
        // Editing your own space updates it; opening someone else's remixes it
        const isOwner = user?.id === data.user_id;
        useEditorStore
          .getState()
          .loadScene(scene, isOwner ? data.id : null, data.title);
      });
    return () => {
      cancelled = true;
    };
  }, [editId, supabase, loading, user?.id]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <EditorScene />

      {/* UI overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col">
        <div className="flex items-start justify-between px-4 pt-20">
          <EnvironmentPanel />
          <SaveControls />
        </div>
        <div className="flex flex-1 items-end justify-between gap-3 px-4 pb-4 sm:items-center">
          <AssetPalette />
          <Inspector />
        </div>
      </div>
    </div>
  );
}
