"use client";

import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { Suspense } from "react";
import { mulberry32 } from "@/lib/random";

const SSR_FALLBACK =
  "data:image/gif;base64,R0lGODlhAQABAPAAAOzz5wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";

/** Paints a facade in the given base color with a grid of windows, some lit warm. */
export function makeFacadeDataUrl(seed: number, baseColor: string): string {
  if (typeof document === "undefined") return SSR_FALLBACK;
  const rand = mulberry32(seed);
  const w = 256;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, w, h);

  const cols = 5 + Math.floor(rand() * 3);
  const rows = 11 + Math.floor(rand() * 5);
  const cw = w / cols;
  const rh = h / rows;
  for (let cx = 0; cx < cols; cx++) {
    for (let ry = 0; ry < rows; ry++) {
      const lit = rand() < 0.42;
      ctx.fillStyle = lit
        ? `rgba(255, ${185 + Math.floor(rand() * 40)}, 110, ${0.75 + rand() * 0.25})`
        : "rgba(18, 22, 30, 0.85)";
      ctx.fillRect(cx * cw + cw * 0.22, ry * rh + rh * 0.2, cw * 0.56, rh * 0.55);
    }
  }
  return canvas.toDataURL("image/png");
}

type BuildingProps = {
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  /** Facade base color */
  tint?: string;
  seed?: number;
  width?: number;
  height?: number;
  depth?: number;
};

function BuildingBox({
  tint,
  seed,
  width,
  height,
  depth,
}: Readonly<{ tint: string; seed: number; width: number; height: number; depth: number }>) {
  const url = useMemo(() => makeFacadeDataUrl(seed, tint), [seed, tint]);
  const texture = useTexture(url);
  return (
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        map={texture}
        emissive="#ffc37a"
        emissiveMap={texture}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

/** A city building with procedurally lit windows. Base sits at y = 0. */
export default function Building({
  position = [0, 0, 0],
  rotationY = 0,
  scale = 1,
  tint = "#3a4252",
  seed = 900,
  width = 3.4,
  height = 8,
  depth = 3.4,
}: BuildingProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <Suspense fallback={null}>
        <BuildingBox tint={tint} seed={seed} width={width} height={height} depth={depth} />
      </Suspense>
    </group>
  );
}
