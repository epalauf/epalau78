"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

type BroadleafTreeProps = {
  position?: [number, number, number];
  scale?: number;
  tint?: string;
  windPhase?: number;
  windStrength?: number;
};

const TRUNK = "#7a5c3e";

export default function BroadleafTree({
  position = [0, 0, 0],
  scale = 1,
  tint = "#4c8552",
  windPhase = 0,
  windStrength = 1,
}: BroadleafTreeProps) {
  const crown = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!crown.current) return;
    const t = clock.elapsedTime;
    crown.current.rotation.z =
      Math.sin(t * 0.9 + windPhase) * 0.03 * windStrength;
    crown.current.rotation.x =
      Math.cos(t * 0.7 + windPhase) * 0.02 * windStrength;
  });

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.14, 0.22, 1.3, 6]} />
        <meshStandardMaterial color={TRUNK} flatShading />
      </mesh>
      <group ref={crown} position={[0, 1.7, 0]}>
        <mesh>
          <icosahedronGeometry args={[0.85, 0]} />
          <meshStandardMaterial color={tint} flatShading />
        </mesh>
        <mesh position={[0.55, -0.25, 0.15]}>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color={tint} flatShading />
        </mesh>
        <mesh position={[-0.5, -0.2, -0.2]}>
          <icosahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial color={tint} flatShading />
        </mesh>
        <mesh position={[0.05, 0.5, -0.35]}>
          <icosahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial color={tint} flatShading />
        </mesh>
      </group>
    </group>
  );
}
