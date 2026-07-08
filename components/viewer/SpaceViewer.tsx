"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { SceneData } from "@/lib/scene";
import { GROUND_RADIUS } from "@/lib/scene";
import LivingEnvironment from "@/components/three/LivingEnvironment";
import AssetInstances from "@/components/three/AssetInstances";

type SpaceViewerProps = {
  scene: SceneData;
  title: string;
  author?: string;
};

export default function SpaceViewer({
  scene,
  title,
  author,
}: Readonly<SpaceViewerProps>) {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Canvas
        camera={{ position: [12, 8, 16], fov: 45 }}
        dpr={[1, 1.75]}
        performance={{ min: 0.5 }}
        className="!absolute inset-0"
      >
        <LivingEnvironment environment={scene.environment} />

        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[GROUND_RADIUS, 48]} />
          <meshStandardMaterial color={scene.terrain.groundColor} />
        </mesh>

        <AssetInstances
          objects={scene.objects}
          windStrength={scene.environment.windStrength}
        />

        <OrbitControls
          makeDefault
          autoRotate
          autoRotateSpeed={0.5}
          target={[0, 0.5, 0]}
          maxPolarAngle={Math.PI / 2 - 0.08}
          minDistance={4}
          maxDistance={45}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-4">
        <div className="glass-leaf px-6 py-3 text-center">
          <h1 className="font-display text-xl font-bold text-fir">{title}</h1>
          {author && <p className="text-sm text-fir-soft">— {author}</p>}
        </div>
      </div>
    </div>
  );
}
