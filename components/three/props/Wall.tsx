"use client";

import { WALL_HEIGHT, WALL_THICKNESS, WALL_WIDTH } from "@/lib/scene";

type WallProps = {
  rotationY?: number;
  scale?: number;
  tint?: string;
};

/** A straight gallery wall segment; line several up to shape rooms. */
export default function Wall({
  rotationY = 0,
  scale = 1,
  tint = "#ece7db",
}: WallProps) {
  return (
    <group rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[0, WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[WALL_WIDTH, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={tint} flatShading />
      </mesh>
      {/* Baseboard grounds the wall visually */}
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[WALL_WIDTH, 0.18, WALL_THICKNESS + 0.06]} />
        <meshStandardMaterial color="#8a8578" flatShading />
      </mesh>
    </group>
  );
}
