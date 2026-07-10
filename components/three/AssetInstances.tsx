"use client";

import type { SceneObject } from "@/lib/scene";
import { hashSeed } from "@/lib/random";
import { userImagePublicUrl } from "@/lib/images";
import AssetMesh from "./nature/AssetMesh";

export const ARTWORK_ASSETS = new Set(["frame", "easel"]);

/** Render of a scene's objects; artworks become clickable when onArtClick is set. */
export default function AssetInstances({
  objects,
  windStrength,
  onArtClick,
}: Readonly<{
  objects: SceneObject[];
  windStrength: number;
  onArtClick?: (id: string) => void;
}>) {
  return (
    <>
      {objects.map((o, i) => {
        const clickable = onArtClick && ARTWORK_ASSETS.has(o.asset);
        return (
          <group
            key={o.id}
            position={o.position}
            onClick={
              clickable
                ? (e) => {
                    e.stopPropagation();
                    onArtClick(o.id);
                  }
                : undefined
            }
            onPointerOver={
              clickable
                ? (e) => {
                    e.stopPropagation();
                    document.body.style.cursor = "pointer";
                  }
                : undefined
            }
            onPointerOut={
              clickable
                ? () => {
                    document.body.style.cursor = "";
                  }
                : undefined
            }
          >
            <AssetMesh
              asset={o.asset}
              tint={o.tint}
              rotationY={o.rotationY}
              rotationX={o.rotationX}
              rotationZ={o.rotationZ}
              scale={o.scale}
              windPhase={(i * 1.37) % (Math.PI * 2)}
              windStrength={windStrength}
              imageUrl={o.image ? userImagePublicUrl(o.image) : undefined}
              seed={hashSeed(o.id)}
              mounted={o.mounted}
            />
          </group>
        );
      })}
    </>
  );
}
