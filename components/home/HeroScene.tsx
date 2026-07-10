"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import HeroScenarios from "@/components/home/HeroScenarios";
import LivingEnvironment from "@/components/three/LivingEnvironment";
import AssetInstances from "@/components/three/AssetInstances";
import { GROUND_RADIUS, type SceneData } from "@/lib/scene";

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

/** The user's featured space rendered under the drifting hero camera. */
function FeaturedSpace({ scene }: Readonly<{ scene: SceneData }>) {
  return (
    <>
      <LivingEnvironment environment={scene.environment} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[GROUND_RADIUS, 48]} />
        <meshStandardMaterial color={scene.terrain.groundColor} />
      </mesh>

      <AssetInstances
        objects={scene.objects}
        windStrength={scene.environment.windStrength}
      />
    </>
  );
}

export default function HeroScene({
  scene,
}: Readonly<{ scene?: SceneData | null }>) {
  return (
    <Canvas
      camera={{ position: [0, 4.2, 13], fov: 42 }}
      dpr={[1, 1.75]}
      performance={{ min: 0.5 }}
      gl={{ antialias: true }}
      className="!absolute inset-0"
    >
      {scene ? <FeaturedSpace scene={scene} /> : <HeroScenarios />}
      <CameraRig />
    </Canvas>
  );
}
