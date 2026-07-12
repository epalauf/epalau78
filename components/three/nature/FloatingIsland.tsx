"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { mulberry32 } from "@/lib/random";

type FloatingIslandProps = {
  scale?: number;
  tint?: string;
  rotationY?: number;
  seed?: number;
  /** Desynchronizes the bob between islands */
  phase?: number;
};

const EARTH = "#7a5c3e";
const ROCK = "#9aa48f";

/** A levitating islet: earthy underside, grassy top, a few surface rocks. */
export default function FloatingIsland({
  scale = 1,
  tint = "#7cb56b",
  rotationY = 0,
  seed = 4242,
  phase = 0,
}: FloatingIslandProps) {
  const group = useRef<Group>(null);

  const rocks = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: 3 }, () => {
      const a = rand() * Math.PI * 2;
      const d = 0.2 + rand() * 0.5;
      return {
        x: Math.cos(a) * d,
        z: Math.sin(a) * d,
        r: 0.08 + rand() * 0.08,
      };
    });
  }, [seed]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.position.y = Math.sin(t * 0.3 + phase) * 0.1;
    group.current.rotation.y = rotationY + t * 0.02;
  });

  return (
    <group ref={group} scale={scale}>
      {/* Earthy underside, tip pointing down */}
      <mesh position={[0, -0.55, 0]} scale={[1, 1.2, 1]}>
        <dodecahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color={EARTH} flatShading />
      </mesh>
      {/* Grassy top */}
      <mesh>
        <cylinderGeometry args={[1, 0.85, 0.25, 8]} />
        <meshStandardMaterial color={tint} flatShading />
      </mesh>
      {rocks.map((r, i) => (
        <mesh key={i} position={[r.x, 0.12 + r.r * 0.4, r.z]}>
          <icosahedronGeometry args={[r.r, 0]} />
          <meshStandardMaterial color={ROCK} flatShading />
        </mesh>
      ))}
    </group>
  );
}
