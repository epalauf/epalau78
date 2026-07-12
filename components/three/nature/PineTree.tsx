"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

type PineTreeProps = {
  position?: [number, number, number];
  scale?: number;
  tint?: string;
  windPhase?: number;
  windStrength?: number;
  /** Geometry richness 0 rough → 1 smooth; 0.35 matches the classic look */
  detail?: number;
};

const TRUNK = "#6b5138";

export default function PineTree({
  position = [0, 0, 0],
  scale = 1,
  tint = "#3f7145",
  windPhase = 0,
  windStrength = 1,
  detail = 0.35,
}: PineTreeProps) {
  const crown = useRef<Group>(null);
  const seg = (lo: number, hi: number) => Math.round(lo + detail * (hi - lo));
  const trunkSeg = seg(4, 10);
  const coneSeg = seg(5, 12);
  const flat = detail < 0.65;

  useFrame(({ clock }) => {
    if (!crown.current) return;
    const t = clock.elapsedTime;
    crown.current.rotation.z =
      Math.sin(t * 1.1 + windPhase) * 0.025 * windStrength;
    crown.current.rotation.x =
      Math.cos(t * 0.9 + windPhase) * 0.018 * windStrength;
  });

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 1, trunkSeg]} />
        <meshStandardMaterial key={String(flat)} color={TRUNK} flatShading={flat} />
      </mesh>
      <group ref={crown}>
        <mesh position={[0, 1.3, 0]}>
          <coneGeometry args={[0.9, 1.4, coneSeg]} />
          <meshStandardMaterial key={String(flat)} color={tint} flatShading={flat} />
        </mesh>
        <mesh position={[0, 2.15, 0]}>
          <coneGeometry args={[0.65, 1.15, coneSeg]} />
          <meshStandardMaterial key={String(flat)} color={tint} flatShading={flat} />
        </mesh>
        <mesh position={[0, 2.85, 0]}>
          <coneGeometry args={[0.4, 0.9, coneSeg]} />
          <meshStandardMaterial key={String(flat)} color={tint} flatShading={flat} />
        </mesh>
        {detail >= 0.75 && (
          <mesh position={[0, 3.35, 0]}>
            <coneGeometry args={[0.22, 0.6, coneSeg]} />
            <meshStandardMaterial key={String(flat)} color={tint} flatShading={flat} />
          </mesh>
        )}
      </group>
    </group>
  );
}
