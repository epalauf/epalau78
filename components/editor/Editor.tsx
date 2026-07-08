"use client";

import EditorScene from "./EditorScene";
import AssetPalette from "./AssetPalette";
import Inspector from "./Inspector";
import SaveControls from "./SaveControls";

export default function Editor() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <EditorScene />

      {/* UI overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col">
        <div className="flex justify-end px-4 pt-20">
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
