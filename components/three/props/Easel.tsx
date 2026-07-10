"use client";

import { Suspense, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { makePlaceholderDataUrl } from "@/components/gallery/placeholderTexture";

type EaselProps = {
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  tint?: string;
  /** Public URL of the canvas image; a generated placeholder when omitted */
  imageUrl?: string;
  seed?: number;
};

function EaselCanvas({ imageUrl, seed }: Readonly<{ imageUrl?: string; seed: number }>) {
  const fallback = useMemo(() => makePlaceholderDataUrl(seed), [seed]);
  const texture = useTexture(imageUrl ?? fallback);
  return (
    <mesh>
      <planeGeometry args={[0.94, 0.72]} />
      <meshStandardMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

/** A wooden easel holding a small canvas. */
export default function Easel({
  position = [0, 0, 0],
  rotationY = 0,
  scale = 1,
  tint = "#8a6f4d",
  imageUrl,
  seed = 8811,
}: EaselProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[-0.42, 0.95, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.06, 1.95, 0.06]} />
        <meshStandardMaterial color={tint} flatShading />
      </mesh>
      <mesh position={[0.42, 0.95, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.06, 1.95, 0.06]} />
        <meshStandardMaterial color={tint} flatShading />
      </mesh>
      <mesh position={[0, 0.9, -0.34]} rotation={[-0.32, 0, 0]}>
        <boxGeometry args={[0.06, 1.9, 0.06]} />
        <meshStandardMaterial color={tint} flatShading />
      </mesh>
      <mesh position={[0, 0.82, 0.08]}>
        <boxGeometry args={[1.05, 0.08, 0.1]} />
        <meshStandardMaterial color={tint} flatShading />
      </mesh>
      <group position={[0, 1.35, 0.09]} rotation={[-0.06, 0, 0]}>
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[1.02, 0.82, 0.03]} />
          <meshStandardMaterial color="#f6f3ea" />
        </mesh>
        <Suspense fallback={null}>
          <EaselCanvas imageUrl={imageUrl} seed={seed} />
        </Suspense>
      </group>
    </group>
  );
}
