"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { mulberry32 } from "@/lib/random";

type CloudPuffProps = {
  scale?: number;
  tint?: string;
  seed?: number;
  /** Desynchronizes the bob between clouds */
  phase?: number;
};

/** A placeable puffy cloud that hovers in place with a gentle bob. */
export default function CloudPuff({
  scale = 1,
  tint = "#ffffff",
  seed = 4242,
  phase = 0,
}: CloudPuffProps) {
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
    group.current.position.y = Math.sin(clock.elapsedTime * 0.4 + phase) * 0.15;
  });

  return (
    <group ref={group} scale={scale}>
      {puffs.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]} scale={[1, 0.6, 0.8]}>
          <sphereGeometry args={[p.r, 7, 6]} />
          <meshStandardMaterial
            color={tint}
            emissive={tint}
            emissiveIntensity={0.45}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}
