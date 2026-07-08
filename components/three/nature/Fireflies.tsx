"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Object3D, type InstancedMesh } from "three";
import { mulberry32 } from "@/lib/random";

type FirefliesProps = {
  count?: number;
  areaRadius?: number;
  seed?: number;
  /** 0..1 — how strongly they glow (night = 1) */
  glow?: number;
};

export default function Fireflies({
  count = 40,
  areaRadius = 12,
  seed = 5,
  glow = 1,
}: FirefliesProps) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  const flies = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      cx: (rand() - 0.5) * areaRadius * 2,
      cz: (rand() - 0.5) * areaRadius * 2,
      baseY: 0.4 + rand() * 1.6,
      rx: 0.5 + rand() * 1.5,
      rz: 0.5 + rand() * 1.5,
      speed: 0.2 + rand() * 0.5,
      phase: rand() * Math.PI * 2,
    }));
  }, [count, areaRadius, seed]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    flies.forEach((f, i) => {
      const a = t * f.speed + f.phase;
      dummy.position.set(
        f.cx + Math.sin(a) * f.rx + Math.sin(a * 2.3) * 0.3,
        f.baseY + Math.sin(a * 1.7) * 0.4,
        f.cz + Math.cos(a * 0.9) * f.rz,
      );
      // Blink: each fly pulses on its own rhythm
      const pulse = Math.max(0, Math.sin(a * 3 + f.phase * 2));
      dummy.scale.setScalar(0.5 + pulse * 0.8);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.035, 5, 4]} />
      <meshStandardMaterial
        color="#fff3c4"
        emissive="#ffd97a"
        emissiveIntensity={2.5 * glow}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
