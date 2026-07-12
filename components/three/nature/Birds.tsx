"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

type BirdsProps = {
  scale?: number;
  tint?: string;
  seed?: number;
  /** Desynchronizes flocks placed side by side */
  phase?: number;
};

const BIRD_COUNT = 4;

/** A small flock of minimal birds circling the placement point. */
export default function Birds({
  scale = 1,
  tint = "#3a4252",
  seed = 4242,
  phase = 0,
}: BirdsProps) {
  const birds = useRef<(Group | null)[]>([]);
  const speed = 0.55 + (seed % 7) * 0.03;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const radius = 1.6;
    for (let i = 0; i < BIRD_COUNT; i++) {
      const bird = birds.current[i];
      if (!bird) continue;
      const a = t * speed + phase + (i * Math.PI * 2) / BIRD_COUNT;
      bird.position.set(
        Math.cos(a) * radius,
        Math.sin(t * 1.4 + i * 2.1) * 0.18,
        Math.sin(a) * radius,
      );
      // Face along the flight direction (circle tangent)
      bird.rotation.y = -a;
      // Wing flap — wings span the local z axis, so they hinge around x
      const flap = Math.sin(t * 10 + i) * 0.5;
      bird.children[1].rotation.x = flap;
      bird.children[2].rotation.x = -flap;
    }
  });

  return (
    <group scale={scale}>
      {Array.from({ length: BIRD_COUNT }, (_, i) => (
        <group
          key={i}
          ref={(el) => {
            birds.current[i] = el;
          }}
        >
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.05, 0.22, 4]} />
            <meshStandardMaterial color={tint} flatShading />
          </mesh>
          <mesh position={[0, 0.02, 0.09]}>
            <boxGeometry args={[0.1, 0.015, 0.18]} />
            <meshStandardMaterial color={tint} flatShading />
          </mesh>
          <mesh position={[0, 0.02, -0.09]}>
            <boxGeometry args={[0.1, 0.015, 0.18]} />
            <meshStandardMaterial color={tint} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}
