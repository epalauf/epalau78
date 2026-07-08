"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { mulberry32 } from "@/lib/random";

function PuffCloud({
  position,
  scale,
  seed,
  driftSpeed,
}: Readonly<{
  position: [number, number, number];
  scale: number;
  seed: number;
  driftSpeed: number;
}>) {
  const group = useRef<Group>(null);

  const puffs = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: 5 }, (_, i) => ({
      x: (i - 2) * 0.75 + (rand() - 0.5) * 0.4,
      y: (rand() - 0.5) * 0.35,
      z: (rand() - 0.5) * 0.6,
      r: 0.55 + rand() * 0.5 - Math.abs(i - 2) * 0.12,
    }));
  }, [seed]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    // Drift across the sky and wrap around
    const x =
      ((position[0] + clock.elapsedTime * driftSpeed + 40) % 80) - 40;
    group.current.position.set(x, position[1], position[2]);
  });

  return (
    <group ref={group} position={position} scale={scale}>
      {puffs.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]} scale={[1, 0.6, 0.8]}>
          <sphereGeometry args={[p.r, 7, 6]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.45}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

type PuffCloudsProps = {
  count?: number;
  seed?: number;
};

export default function PuffClouds({ count = 5, seed = 11 }: PuffCloudsProps) {
  const clouds = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (rand() - 0.5) * 60,
        8.5 + rand() * 4,
        -10 - rand() * 18,
      ] as [number, number, number],
      scale: 0.9 + rand() * 1.4,
      seed: seed + i * 131,
      driftSpeed: 0.25 + rand() * 0.35,
    }));
  }, [count, seed]);

  return (
    <group>
      {clouds.map((c, i) => (
        <PuffCloud key={i} {...c} />
      ))}
    </group>
  );
}
