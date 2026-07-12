"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

type FlowerProps = {
  position?: [number, number, number];
  scale?: number;
  tint?: string;
  windPhase?: number;
  windStrength?: number;
  /** Geometry richness 0 rough → 1 smooth; 0.35 matches the classic look */
  detail?: number;
};

const STEM = "#4c8552";
const HEART = "#e8b54a";

export default function Flower({
  position = [0, 0, 0],
  scale = 1,
  tint = "#f2f0e4",
  windPhase = 0,
  windStrength = 1,
  detail = 0.35,
}: FlowerProps) {
  const head = useRef<Group>(null);
  const seg = (lo: number, hi: number) => Math.round(lo + detail * (hi - lo));
  const sphereW = seg(4, 10);
  const sphereH = seg(4, 8);
  const stemSeg = seg(4, 8);
  const petals = detail >= 0.7 ? 8 : 5;
  const flat = detail < 0.65;

  useFrame(({ clock }) => {
    if (!head.current) return;
    head.current.rotation.z =
      Math.sin(clock.elapsedTime * 1.6 + windPhase) * 0.12 * windStrength;
  });

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 0.36, stemSeg]} />
        <meshStandardMaterial key={String(flat)} color={STEM} flatShading={flat} />
      </mesh>
      <group ref={head} position={[0, 0.38, 0]}>
        <mesh>
          <sphereGeometry args={[0.05, sphereW, sphereH]} />
          <meshStandardMaterial key={String(flat)} color={HEART} flatShading={flat} />
        </mesh>
        {Array.from({ length: petals }, (_, i) => {
          const a = (i / petals) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.075, 0, Math.sin(a) * 0.075]}
              scale={[1, 0.4, 1]}
            >
              <sphereGeometry args={[0.055, sphereW, sphereH]} />
              <meshStandardMaterial key={String(flat)} color={tint} flatShading={flat} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
