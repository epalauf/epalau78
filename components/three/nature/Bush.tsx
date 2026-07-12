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
  /** Geometry richness 0 rough → 1 smooth; 0.35 matches the classic look */
  detail?: number;
};

export default function Bush({
  position = [0, 0, 0],
  scale = 1,
  tint = "#57904f",
  windPhase = 0,
  windStrength = 1,
  detail = 0.35,
}: BushProps) {
  const group = useRef<Group>(null);
  const subdiv = detail < 0.45 ? 0 : detail < 0.8 ? 1 : 2;
  const flat = detail < 0.65;

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.z =
      Math.sin(clock.elapsedTime * 1.3 + windPhase) * 0.02 * windStrength;
  });

  const lobes: [number, number, number, number][] = [
    [0, 0.28, 0, 0.42],
    [0.35, 0.2, 0.1, 0.3],
    [-0.32, 0.18, -0.08, 0.28],
  ];
  if (detail >= 0.7) {
    lobes.push([0.08, 0.42, -0.18, 0.24], [-0.15, 0.34, 0.22, 0.22]);
  }

  return (
    <group ref={group} position={position} scale={scale}>
      {lobes.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[r, subdiv]} />
          <meshStandardMaterial key={String(flat)} color={tint} flatShading={flat} />
        </mesh>
      ))}
    </group>
  );
}
