"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type Group, type Mesh } from "three";
import { mulberry32, pick } from "@/lib/random";

const WING_COLORS = ["#e8b54a", "#7ab5c4", "#e2926e", "#c9a0dc"] as const;

function Butterfly({
  seed,
  areaRadius,
}: Readonly<{ seed: number; areaRadius: number }>) {
  const body = useRef<Group>(null);
  const wingL = useRef<Mesh>(null);
  const wingR = useRef<Mesh>(null);

  const cfg = useMemo(() => {
    const rand = mulberry32(seed);
    return {
      cx: (rand() - 0.5) * areaRadius * 1.6,
      cz: (rand() - 0.5) * areaRadius * 1.2,
      rx: 1.5 + rand() * 3,
      rz: 1.5 + rand() * 3,
      baseY: 1.4 + rand() * 1.4,
      speed: 0.25 + rand() * 0.3,
      phase: rand() * Math.PI * 2,
      flap: 9 + rand() * 5,
      color: pick(rand, WING_COLORS),
    };
  }, [seed, areaRadius]);

  useFrame(({ clock }) => {
    if (!body.current) return;
    const t = clock.elapsedTime * cfg.speed + cfg.phase;

    const x = cfg.cx + Math.sin(t) * cfg.rx;
    const z = cfg.cz + Math.cos(t * 0.8) * cfg.rz;
    const y = cfg.baseY + Math.sin(t * 2.3) * 0.35;
    // Face direction of travel (derivative of the path)
    const dx = Math.cos(t) * cfg.rx * cfg.speed;
    const dz = -Math.sin(t * 0.8) * cfg.rz * 0.8 * cfg.speed;
    body.current.position.set(x, y, z);
    body.current.rotation.y = Math.atan2(dx, dz);

    const flap = Math.sin(clock.elapsedTime * cfg.flap) * 0.95;
    if (wingL.current) wingL.current.rotation.z = flap;
    if (wingR.current) wingR.current.rotation.z = -flap;
  });

  return (
    <group ref={body}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.015, 0.09, 3, 5]} />
        <meshStandardMaterial color="#3a3226" />
      </mesh>
      <mesh ref={wingL} position={[0, 0.01, 0]}>
        <planeGeometry args={[0.16, 0.12]} />
        <meshStandardMaterial color={cfg.color} side={DoubleSide} />
      </mesh>
      <mesh ref={wingR} position={[0, 0.01, 0]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.16, 0.12]} />
        <meshStandardMaterial color={cfg.color} side={DoubleSide} />
      </mesh>
    </group>
  );
}

type ButterfliesProps = {
  count?: number;
  areaRadius?: number;
  seed?: number;
};

export default function Butterflies({
  count = 6,
  areaRadius = 8,
  seed = 21,
}: ButterfliesProps) {
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <Butterfly key={i} seed={seed + i * 97} areaRadius={areaRadius} />
      ))}
    </group>
  );
}
