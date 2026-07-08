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
};

const STEM = "#4c8552";
const HEART = "#e8b54a";

export default function Flower({
  position = [0, 0, 0],
  scale = 1,
  tint = "#f2f0e4",
  windPhase = 0,
  windStrength = 1,
}: FlowerProps) {
  const head = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!head.current) return;
    head.current.rotation.z =
      Math.sin(clock.elapsedTime * 1.6 + windPhase) * 0.12 * windStrength;
  });

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 0.36, 5]} />
        <meshStandardMaterial color={STEM} flatShading />
      </mesh>
      <group ref={head} position={[0, 0.38, 0]}>
        <mesh>
          <sphereGeometry args={[0.05, 6, 5]} />
          <meshStandardMaterial color={HEART} flatShading />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.075, 0, Math.sin(a) * 0.075]}
              scale={[1, 0.4, 1]}
            >
              <sphereGeometry args={[0.055, 6, 5]} />
              <meshStandardMaterial color={tint} flatShading />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
