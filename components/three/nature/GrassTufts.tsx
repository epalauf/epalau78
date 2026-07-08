"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Object3D, type InstancedMesh } from "three";
import { mulberry32 } from "@/lib/random";

type GrassTuftsProps = {
  count?: number;
  radius?: number;
  seed?: number;
  windStrength?: number;
};

export default function GrassTufts({
  count = 350,
  radius = 24,
  seed = 7,
  windStrength = 1,
}: GrassTuftsProps) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  const blades = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, () => {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * radius;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        scale: 0.5 + rand() * 0.9,
        phase: rand() * Math.PI * 2,
      };
    });
  }, [count, radius, seed]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    blades.forEach((b, i) => {
      dummy.position.set(b.x, 0.12 * b.scale, b.z);
      dummy.scale.setScalar(b.scale);
      dummy.rotation.z = Math.sin(t * 1.4 + b.phase) * 0.14 * windStrength;
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <coneGeometry args={[0.05, 0.3, 4]} />
      <meshStandardMaterial color="#5c9861" flatShading />
    </instancedMesh>
  );
}
