"use client";

import type { AssetId } from "@/lib/scene";
import PineTree from "./PineTree";
import BroadleafTree from "./BroadleafTree";
import Bush from "./Bush";
import Rock from "./Rock";
import Flower from "./Flower";
import Mushroom from "./Mushroom";
import Pond from "./Pond";

type AssetMeshProps = {
  asset: AssetId;
  tint: string;
  rotationY?: number;
  scale?: number;
  windPhase?: number;
  windStrength?: number;
};

/** Renders the procedural mesh for a catalog asset, at the local origin. */
export default function AssetMesh({
  asset,
  tint,
  rotationY = 0,
  scale = 1,
  windPhase = 0,
  windStrength = 1,
}: AssetMeshProps) {
  switch (asset) {
    case "pine":
      return (
        <group rotation={[0, rotationY, 0]}>
          <PineTree
            scale={scale}
            tint={tint}
            windPhase={windPhase}
            windStrength={windStrength}
          />
        </group>
      );
    case "broadleaf":
      return (
        <group rotation={[0, rotationY, 0]}>
          <BroadleafTree
            scale={scale}
            tint={tint}
            windPhase={windPhase}
            windStrength={windStrength}
          />
        </group>
      );
    case "bush":
      return (
        <group rotation={[0, rotationY, 0]}>
          <Bush
            scale={scale}
            tint={tint}
            windPhase={windPhase}
            windStrength={windStrength}
          />
        </group>
      );
    case "rock":
      return (
        <Rock
          scale={scale}
          tint={tint}
          rotationY={rotationY}
          position={[0, scale * 0.25, 0]}
        />
      );
    case "flower":
      return (
        <group rotation={[0, rotationY, 0]}>
          <Flower
            scale={scale * 2}
            tint={tint}
            windPhase={windPhase}
            windStrength={windStrength}
          />
        </group>
      );
    case "mushroom":
      return <Mushroom scale={scale * 1.6} tint={tint} rotationY={rotationY} />;
    case "pond":
      return <Pond scale={scale} tint={tint} rotationY={rotationY} />;
  }
}
