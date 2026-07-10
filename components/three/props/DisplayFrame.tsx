"use client";

import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { DoubleSide, type Group } from "three";
import { makePlaceholderDataUrl } from "@/components/gallery/placeholderTexture";

type DisplayFrameProps = {
  position?: [number, number, number];
  rotationY?: number;
  /** Tilt forward/back (radians) */
  rotationX?: number;
  /** Tilt sideways (radians) */
  rotationZ?: number;
  scale?: number;
  /** Frame color */
  tint?: string;
  /** Public URL of the picture; a generated placeholder when omitted */
  imageUrl?: string;
  seed?: number;
  phase?: number;
  /** Hangs flush on a wall: no floating drift, no ground shadow */
  mounted?: boolean;
  /** Sideways offset of the picture (local units — slides along a wall) */
  offsetX?: number;
  /** Vertical offset from the default hang height (local units) */
  offsetY?: number;
};

/** Picture + frame sized to the image's real aspect ratio (no stretching). */
function Picture({
  imageUrl,
  seed,
  tint,
}: Readonly<{ imageUrl?: string; seed: number; tint: string }>) {
  const fallback = useMemo(() => makePlaceholderDataUrl(seed), [seed]);
  const texture = useTexture(imageUrl ?? fallback);

  const [w, h] = useMemo(() => {
    const img = texture.image as { width?: number; height?: number } | undefined;
    const aspect =
      img?.width && img?.height ? img.width / img.height : 4 / 3;
    // Longest side is 1.5 units; the other follows the image
    return aspect >= 1 ? [1.5, 1.5 / aspect] : [1.5 * aspect, 1.5];
  }, [texture]);

  return (
    <>
      {/* Frame sits clearly behind the picture plane to avoid z-fighting */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[w + 0.15, h + 0.15, 0.04]} />
        <meshStandardMaterial color={tint} />
      </mesh>
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          map={texture}
          emissive="#ffffff"
          emissiveMap={texture}
          emissiveIntensity={0.25}
          toneMapped={false}
          side={DoubleSide}
        />
      </mesh>
    </>
  );
}

/**
 * A floating framed picture — the signature Natura78 way of showing an image.
 * Hovers and breathes gently above its spot, like the gallery frames.
 */
export default function DisplayFrame({
  position = [0, 0, 0],
  rotationY = 0,
  rotationX = 0,
  rotationZ = 0,
  scale = 1,
  tint = "#f6f3ea",
  imageUrl,
  seed = 4242,
  phase = 0,
  mounted = false,
  offsetX = 0,
  offsetY = 0,
}: DisplayFrameProps) {
  const frame = useRef<Group>(null);
  const hangY = 1.55 + offsetY;

  useFrame(({ clock }) => {
    if (!frame.current || mounted) return;
    const t = clock.elapsedTime;
    frame.current.position.y = hangY + Math.sin(t * 0.7 + phase) * 0.07;
    // Breathe around the user-chosen tilt instead of overwriting it
    frame.current.rotation.x = rotationX + Math.sin(t * 0.45 + phase) * 0.02;
    frame.current.rotation.z = rotationZ;
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Soft anchor shadow so the floating frame feels placed */}
      {!mounted && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <circleGeometry args={[0.55, 20]} />
          <meshBasicMaterial color="#1c2e1f" transparent opacity={0.14} />
        </mesh>
      )}
      <group
        ref={frame}
        position={[offsetX, hangY, 0]}
        rotation={mounted ? [0, 0, 0] : [rotationX, 0, rotationZ]}
      >
        <Suspense fallback={null}>
          <Picture imageUrl={imageUrl} seed={seed} tint={tint} />
        </Suspense>
      </group>
    </group>
  );
}
