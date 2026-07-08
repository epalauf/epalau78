"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

type PondProps = {
  position?: [number, number, number];
  scale?: number;
  tint?: string;
  rotationY?: number;
};

export default function Pond({
  position = [0, 0, 0],
  scale = 1,
  tint = "#7ab5c4",
  rotationY = 0,
}: PondProps) {
  const water = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!water.current) return;
    // Gentle breathing ripple
    const s = 1 + Math.sin(clock.elapsedTime * 1.2) * 0.008;
    water.current.scale.set(s, s, 1);
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Sandy rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <circleGeometry args={[1.35, 24]} />
        <meshStandardMaterial color="#cbbd93" />
      </mesh>
      <mesh
        ref={water}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.024, 0]}
      >
        <circleGeometry args={[1.15, 24]} />
        <meshStandardMaterial
          color={tint}
          transparent
          opacity={0.9}
          roughness={0.15}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}
