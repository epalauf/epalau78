"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { DoubleSide, Group, MathUtils, Vector3 } from "three";
import type { GalleryImageData } from "@/lib/gallery";
import { DEFAULT_ENVIRONMENT, GROUND_RADIUS } from "@/lib/scene";
import { mulberry32, pick } from "@/lib/random";
import LivingEnvironment from "@/components/three/LivingEnvironment";
import PineTree from "@/components/three/nature/PineTree";
import GrassTufts from "@/components/three/nature/GrassTufts";
import { makePlaceholderDataUrl } from "./placeholderTexture";

type PlacedImage = GalleryImageData & {
  url: string;
  position: [number, number, number];
  rotationY: number;
  phase: number;
};

const TREE_GREENS = ["#3f7145", "#4c8552", "#35643c"] as const;

function FloatingImage({
  image,
  focused,
  onFocus,
}: Readonly<{
  image: PlacedImage;
  focused: boolean;
  onFocus: () => void;
}>) {
  const group = useRef<Group>(null);
  const texture = useTexture(image.url);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock, pointer }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    // Gentle vertical drift
    group.current.position.y =
      image.position[1] + Math.sin(t * 0.6 + image.phase) * 0.18;
    // Lean toward the cursor, more when hovered
    const lean = hovered || focused ? 0.22 : 0.1;
    group.current.rotation.y = MathUtils.lerp(
      group.current.rotation.y,
      image.rotationY + pointer.x * lean,
      0.05,
    );
    group.current.rotation.x = MathUtils.lerp(
      group.current.rotation.x,
      -pointer.y * lean * 0.6 + Math.sin(t * 0.4 + image.phase) * 0.02,
      0.05,
    );
    const s = focused ? 1.12 : hovered ? 1.05 : 1;
    group.current.scale.lerp(new Vector3(s, s, s), 0.08);
  });

  return (
    <group
      ref={group}
      position={image.position}
      rotation={[0, image.rotationY, 0]}
    >
      {/* Frame */}
      <mesh position={[0, 0, -0.015]}>
        <boxGeometry args={[2.3, 1.75, 0.02]} />
        <meshStandardMaterial color="#f6f3ea" />
      </mesh>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onFocus();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[2.15, 1.6]} />
        <meshStandardMaterial map={texture} side={DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
}

function CameraRig({
  focusedImage,
}: Readonly<{ focusedImage: PlacedImage | null }>) {
  const target = useRef(new Vector3());
  const lookTarget = useRef(new Vector3(0, 2, 0));

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (focusedImage) {
      const [x, y, z] = focusedImage.position;
      // Stand in front of the image, along its facing direction
      const nx = Math.sin(focusedImage.rotationY);
      const nz = Math.cos(focusedImage.rotationY);
      target.current.set(x + nx * 3.4, y + 0.1, z + nz * 3.4);
      lookTarget.current.lerp(new Vector3(x, y, z), 0.08);
    } else {
      const a = t * 0.04;
      target.current.set(
        Math.sin(a) * 13 + state.pointer.x * 1.5,
        3.8 + state.pointer.y * 0.8,
        Math.cos(a) * 13,
      );
      lookTarget.current.lerp(new Vector3(0, 2, 0), 0.04);
    }
    state.camera.position.lerp(target.current, 0.035);
    state.camera.lookAt(lookTarget.current);
  });

  return null;
}

function Backdrop() {
  const trees = useMemo(() => {
    const rand = mulberry32(99);
    return Array.from({ length: 18 }, () => {
      const a = rand() * Math.PI * 2;
      const r = 14 + Math.sqrt(rand()) * 10;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        scale: 0.9 + rand() * 1.2,
        tint: pick(rand, TREE_GREENS),
        phase: rand() * Math.PI * 2,
      };
    });
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[GROUND_RADIUS, 48]} />
        <meshStandardMaterial color="#7cb56b" />
      </mesh>
      <GrassTufts count={220} radius={16} seed={31} />
      {trees.map((t, i) => (
        <PineTree
          key={i}
          position={[t.x, 0, t.z]}
          scale={t.scale}
          tint={t.tint}
          windPhase={t.phase}
        />
      ))}
    </group>
  );
}

export default function GalleryExperience({
  images,
}: Readonly<{ images: GalleryImageData[] }>) {
  const t = useTranslations("gallery");
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const placed: PlacedImage[] = useMemo(() => {
    const rand = mulberry32(7);
    return images.map((img, i) => {
      const a = (i / images.length) * Math.PI * 2 + rand() * 0.4;
      const r = 4.5 + rand() * 3.5;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      return {
        ...img,
        url: img.url ?? makePlaceholderDataUrl(1000 + i * 137),
        position: [x, 2.1 + rand() * 1.6, z] as [number, number, number],
        // Face outward, away from the center, toward the orbiting camera
        rotationY: Math.atan2(x, z),
        phase: rand() * Math.PI * 2,
      };
    });
  }, [images]);

  const focusedImage = placed.find((p) => p.id === focusedId) ?? null;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Canvas
        camera={{ position: [0, 4, 14], fov: 45 }}
        dpr={[1, 1.75]}
        className="!absolute inset-0"
        onPointerMissed={() => setFocusedId(null)}
      >
        <LivingEnvironment environment={DEFAULT_ENVIRONMENT} />
        <Backdrop />
        <Suspense fallback={null}>
          {placed.map((img) => (
            <FloatingImage
              key={img.id}
              image={img}
              focused={img.id === focusedId}
              onFocus={() => setFocusedId(img.id)}
            />
          ))}
        </Suspense>
        <CameraRig focusedImage={focusedImage} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-4">
        <AnimatePresence mode="wait">
          {focusedImage ? (
            <motion.div
              key={focusedImage.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="glass-leaf pointer-events-auto flex items-center gap-4 px-6 py-3"
            >
              <h2 className="font-display text-lg font-bold text-fir">
                {focusedImage.title}
              </h2>
              <button
                onClick={() => setFocusedId(null)}
                className="seed-pill bg-mist-deep px-3 py-1 text-sm font-medium text-fir-soft hover:bg-moss hover:text-mist"
              >
                {t("back")}
              </button>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-leaf px-5 py-2 text-sm text-fir-soft"
            >
              {t("hint")}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
