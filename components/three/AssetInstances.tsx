"use client";

import type { SceneObject } from "@/lib/scene";
import { hashSeed } from "@/lib/random";
import { userImagePublicUrl } from "@/lib/images";
import AssetMesh from "./nature/AssetMesh";

/** Non-interactive render of a scene's objects (used by viewers). */
export default function AssetInstances({
  objects,
  windStrength,
}: Readonly<{ objects: SceneObject[]; windStrength: number }>) {
  return (
    <>
      {objects.map((o, i) => (
        <group key={o.id} position={o.position}>
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
          />
        </group>
      ))}
    </>
  );
}
