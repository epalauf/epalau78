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
import MyImagesPanel from "./MyImagesPanel";

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
        <div className="flex flex-wrap items-start justify-between gap-2 px-4 pt-20">
          <div className="flex flex-col items-start gap-2">
            <EnvironmentPanel />
            <MyImagesPanel />
          </div>
          <SaveControls />
        </div>
        <div className="flex flex-1 items-end justify-start gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center">
          <AssetPalette />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex justify-center sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-20 sm:items-center sm:justify-end">
          <Inspector />
        </div>
      </div>
    </div>
  );
}
