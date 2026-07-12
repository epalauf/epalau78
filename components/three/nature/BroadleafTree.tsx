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
  /** Geometry richness 0 rough → 1 smooth; 0.35 matches the classic look */
  detail?: number;
};

const TRUNK = "#7a5c3e";

export default function BroadleafTree({
  position = [0, 0, 0],
  scale = 1,
  tint = "#4c8552",
  windPhase = 0,
  windStrength = 1,
  detail = 0.35,
}: BroadleafTreeProps) {
  const crown = useRef<Group>(null);
  const trunkSeg = Math.round(4 + detail * 6);
  const subdiv = detail < 0.45 ? 0 : detail < 0.8 ? 1 : 2;
  const flat = detail < 0.65;

  useFrame(({ clock }) => {
    if (!crown.current) return;
    const t = clock.elapsedTime;
    crown.current.rotation.z =
      Math.sin(t * 0.9 + windPhase) * 0.03 * windStrength;
    crown.current.rotation.x =
      Math.cos(t * 0.7 + windPhase) * 0.02 * windStrength;
  });

  const blobs: [number, number, number, number][] = [
    [0, 0, 0, 0.85],
    [0.55, -0.25, 0.15, 0.5],
    [-0.5, -0.2, -0.2, 0.45],
    [0.05, 0.5, -0.35, 0.45],
  ];
  if (detail >= 0.7) {
    blobs.push([-0.3, 0.45, 0.3, 0.35], [0.45, 0.3, -0.35, 0.3]);
  }

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.14, 0.22, 1.3, trunkSeg]} />
        <meshStandardMaterial key={String(flat)} color={TRUNK} flatShading={flat} />
      </mesh>
      <group ref={crown} position={[0, 1.7, 0]}>
        {blobs.map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]}>
            <icosahedronGeometry args={[r, subdiv]} />
            <meshStandardMaterial key={String(flat)} color={tint} flatShading={flat} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
