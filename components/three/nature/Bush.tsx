"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

type BushProps = {
  position?: [number, number, number];
  scale?: number;
  tint?: string;
  windPhase?: number;
  windStrength?: number;
};

export default function Bush({
  position = [0, 0, 0],
  scale = 1,
  tint = "#57904f",
  windPhase = 0,
  windStrength = 1,
}: BushProps) {
  const group = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.z =
      Math.sin(clock.elapsedTime * 1.3 + windPhase) * 0.02 * windStrength;
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <mesh position={[0, 0.28, 0]}>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color={tint} flatShading />
      </mesh>
      <mesh position={[0.35, 0.2, 0.1]}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={tint} flatShading />
      </mesh>
      <mesh position={[-0.32, 0.18, -0.08]}>
        <icosahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color={tint} flatShading />
      </mesh>
    </group>
  );
}
