"use client";

import type { AssetId } from "@/lib/scene";
import PineTree from "./PineTree";
import BroadleafTree from "./BroadleafTree";
import Bush from "./Bush";
import Rock from "./Rock";
import Flower from "./Flower";
import Mushroom from "./Mushroom";
import Pond from "./Pond";
import Building from "@/components/three/props/Building";
import StreetLamp from "@/components/three/props/StreetLamp";
import Bench from "@/components/three/props/Bench";
import Tripod from "@/components/three/props/Tripod";
import DisplayFrame from "@/components/three/props/DisplayFrame";
import Pedestal from "@/components/three/props/Pedestal";
import Easel from "@/components/three/props/Easel";
import Wall from "@/components/three/props/Wall";
import Doorway from "@/components/three/props/Doorway";

type AssetMeshProps = {
  asset: AssetId;
  tint: string;
  rotationY?: number;
  rotationX?: number;
  rotationZ?: number;
  scale?: number;
  windPhase?: number;
  windStrength?: number;
  /** Resolved public URL of a user image, for picture assets */
  imageUrl?: string;
  /** Stable per-object seed for procedural variety (facades, placeholder art) */
  seed?: number;
  /** Frame hangs flush on a wall */
  mounted?: boolean;
  /** Picture offsets for the frame asset (local units) */
  offsetX?: number;
  offsetY?: number;
};

/** Renders the procedural mesh for a catalog asset, at the local origin. */
export default function AssetMesh({
  asset,
  tint,
  rotationY = 0,
  rotationX = 0,
  rotationZ = 0,
  scale = 1,
  windPhase = 0,
  windStrength = 1,
  imageUrl,
  seed = 4242,
  mounted = false,
  offsetX = 0,
  offsetY = 0,
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
    case "building":
      return (
        <Building
          scale={scale}
          tint={tint}
          rotationY={rotationY}
          seed={seed}
        />
      );
    case "streetlamp":
      return <StreetLamp scale={scale} tint={tint} rotationY={rotationY} />;
    case "bench":
      return <Bench scale={scale} tint={tint} rotationY={rotationY} />;
    case "tripod":
      return <Tripod scale={scale} tint={tint} rotationY={rotationY} />;
    case "frame":
      return (
        <DisplayFrame
          scale={scale}
          tint={tint}
          rotationY={rotationY}
          rotationX={rotationX}
          rotationZ={rotationZ}
          imageUrl={imageUrl}
          seed={seed}
          phase={windPhase}
          mounted={mounted}
          offsetX={offsetX}
          offsetY={offsetY}
        />
      );
    case "pedestal":
      return <Pedestal scale={scale} tint={tint} rotationY={rotationY} />;
    case "wall":
      return <Wall scale={scale} tint={tint} rotationY={rotationY} />;
    case "doorway":
      return <Doorway scale={scale} tint={tint} rotationY={rotationY} />;
    case "easel":
      return (
        <Easel
          scale={scale}
          tint={tint}
          rotationY={rotationY}
          imageUrl={imageUrl}
          seed={seed}
        />
      );
  }
}
