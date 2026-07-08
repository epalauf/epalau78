"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { Vector3 } from "three";
import { mulberry32, pick } from "@/lib/random";
import PineTree from "@/components/three/nature/PineTree";
import Rock from "@/components/three/nature/Rock";
import Flower from "@/components/three/nature/Flower";
import GrassTufts from "@/components/three/nature/GrassTufts";
import Butterflies from "@/components/three/nature/Butterflies";
import PuffClouds from "@/components/three/nature/PuffClouds";

const TREE_GREENS = ["#3f7145", "#4c8552", "#35643c", "#578f57"] as const;
const FLOWER_TINTS = ["#f2f0e4", "#e8b54a", "#d98fb0", "#7ab5c4"] as const;

function Meadow() {
  const scatter = useMemo(() => {
    const rand = mulberry32(42);
    const trees = Array.from({ length: 26 }, () => {
      const a = rand() * Math.PI * 2;
      // Keep a clearing in the middle so the camera looks through open meadow
      const r = 7 + Math.sqrt(rand()) * 18;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r - 4,
        scale: 0.8 + rand() * 1.3,
        tint: pick(rand, TREE_GREENS),
        phase: rand() * Math.PI * 2,
      };
    });
    const rocks = Array.from({ length: 9 }, () => ({
      x: (rand() - 0.5) * 30,
      z: (rand() - 0.5) * 22 - 2,
      scale: 0.3 + rand() * 0.8,
      rotY: rand() * Math.PI * 2,
    }));
    const flowers = Array.from({ length: 24 }, () => {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 10;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        scale: 0.8 + rand() * 0.8,
        tint: pick(rand, FLOWER_TINTS),
        phase: rand() * Math.PI * 2,
      };
    });
    return { trees, rocks, flowers };
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[45, 48]} />
        <meshStandardMaterial color="#7cb56b" />
      </mesh>

      {scatter.trees.map((t, i) => (
        <PineTree
          key={`t${i}`}
          position={[t.x, 0, t.z]}
          scale={t.scale}
          tint={t.tint}
          windPhase={t.phase}
        />
      ))}
      {scatter.rocks.map((r, i) => (
        <Rock
          key={`r${i}`}
          position={[r.x, r.scale * 0.25, r.z]}
          scale={r.scale}
          rotationY={r.rotY}
        />
      ))}
      {scatter.flowers.map((f, i) => (
        <Flower
          key={`f${i}`}
          position={[f.x, 0, f.z]}
          scale={f.scale}
          tint={f.tint}
          windPhase={f.phase}
        />
      ))}

      <GrassTufts count={320} radius={22} />
      <Butterflies count={7} areaRadius={9} />
    </group>
  );
}

function CameraRig() {
  const target = useRef(new Vector3());

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    target.current.set(
      Math.sin(t * 0.05) * 1.5 + state.pointer.x * 1.4,
      4.2 + state.pointer.y * 0.7,
      13,
    );
    state.camera.position.lerp(target.current, 0.025);
    state.camera.lookAt(0, 1.6, 0);
  });

  return null;
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 4.2, 13], fov: 42 }}
      dpr={[1, 1.75]}
      performance={{ min: 0.5 }}
      gl={{ antialias: true }}
      className="!absolute inset-0"
    >
      <fog attach="fog" args={["#dcebd2", 20, 60]} />
      <Sky sunPosition={[6, 1.4, -8]} turbidity={6} rayleigh={1.6} />
      <ambientLight intensity={0.75} color="#fff8e7" />
      <directionalLight position={[6, 8, -4]} intensity={1.4} color="#ffe9b8" />
      <PuffClouds count={5} />
      <Meadow />
      <CameraRig />
    </Canvas>
  );
}
