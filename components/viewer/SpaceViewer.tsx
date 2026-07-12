"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useTranslations } from "next-intl";
import { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { SceneData, SceneObject } from "@/lib/scene";
import { GROUND_RADIUS } from "@/lib/scene";
import LivingEnvironment from "@/components/three/LivingEnvironment";
import { useIsTouch } from "@/lib/useIsTouch";
import AssetInstances, {
  ARTWORK_ASSETS,
} from "@/components/three/AssetInstances";
import WalkControls from "./WalkControls";
import { artworkViewpoint } from "./walk";

type SpaceViewerProps = {
  scene: SceneData;
  title: string;
  author?: string;
};

type ViewMode = "orbit" | "walk";

/** Glides the camera to face the focused artwork. */
function FocusRig({ target }: Readonly<{ target: SceneObject }>) {
  const pose = useMemo(() => artworkViewpoint(target), [target]);
  const lookPoint = useRef<Vector3 | null>(null);
  const goal = useRef(new Vector3());

  useFrame(({ camera }, delta) => {
    const ease = Math.min(1, delta * 4);
    if (!lookPoint.current) {
      // Start looking wherever the camera is currently pointed
      lookPoint.current = camera
        .getWorldDirection(new Vector3())
        .multiplyScalar(4)
        .add(camera.position);
    }
    goal.current.set(...pose.position);
    camera.position.lerp(goal.current, ease);
    goal.current.set(...pose.look);
    lookPoint.current.lerp(goal.current, ease);
    camera.lookAt(lookPoint.current);
  });

  return null;
}

export default function SpaceViewer({
  scene,
  title,
  author,
}: Readonly<SpaceViewerProps>) {
  const t = useTranslations("viewer");
  const [mode, setMode] = useState<ViewMode>("orbit");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [nearId, setNearId] = useState<string | null>(null);
  const [walkLocked, setWalkLocked] = useState(false);
  const orbitRef = useRef<OrbitControlsImpl | null>(null);
  // Walk mode needs pointer lock + keyboard — not available on touch devices
  const isTouch = useIsTouch();
  const activeMode: ViewMode = isTouch ? "orbit" : mode;

  const focusables = useMemo(
    () => scene.objects.filter((o) => ARTWORK_ASSETS.has(o.asset)),
    [scene.objects],
  );
  const focused = focusId
    ? (scene.objects.find((o) => o.id === focusId) ?? null)
    : null;

  function focusArtwork(id: string) {
    if (document.pointerLockElement) document.exitPointerLock();
    setNearId(null);
    setFocusId(id);
  }

  function leaveFocus() {
    if (focused && orbitRef.current) {
      // Keep orbiting around the piece we were just admiring
      const pose = artworkViewpoint(focused);
      orbitRef.current.target.set(...pose.look);
    }
    setFocusId(null);
  }

  // Esc leaves focus mode
  useEffect(() => {
    if (!focusId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Escape") leaveFocus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);

  const walking = activeMode === "walk" && !focused;

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
          onArtClick={
            activeMode === "orbit" && !focused ? focusArtwork : undefined
          }
        />

        {activeMode === "orbit" && (
          <OrbitControls
            ref={orbitRef}
            makeDefault
            enabled={!focused}
            autoRotate={!focused}
            autoRotateSpeed={0.5}
            target={[0, 0.5, 0]}
            maxPolarAngle={Math.PI / 2 - 0.08}
            minDistance={1.5}
            maxDistance={70}
          />
        )}

        {walking && (
          <WalkControls
            objects={scene.objects}
            focusables={focusables}
            onNearChange={setNearId}
            onInteract={focusArtwork}
            onLockChange={setWalkLocked}
          />
        )}

        {focused && <FocusRig target={focused} />}
      </Canvas>

      {/* Mode toggle */}
      {!focused && !isTouch && (
        <div className="absolute right-4 bottom-6 flex flex-col items-end gap-2">
          <button
            onClick={() => {
              if (document.pointerLockElement) document.exitPointerLock();
              setNearId(null);
              setMode(activeMode === "orbit" ? "walk" : "orbit");
            }}
            className="seed-pill glass-leaf px-4 py-2 text-sm font-semibold text-fir transition-transform hover:scale-105"
          >
            {activeMode === "orbit" ? <>🚶 {t("walk")}</> : <>🌀 {t("orbit")}</>}
          </button>
        </div>
      )}

      {/* Walk-mode hints */}
      {walking && !walkLocked && (
        <div className="pointer-events-none absolute inset-x-0 top-24 flex justify-center px-4">
          <p className="glass-leaf px-5 py-2.5 text-sm font-medium text-fir">
            {t("walkHint")}
          </p>
        </div>
      )}
      {walking && walkLocked && (
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow"
        />
      )}
      {walking && walkLocked && nearId && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center px-4">
          <p className="glass-leaf px-5 py-2.5 text-sm font-semibold text-fir">
            {t("interactHint")}
          </p>
        </div>
      )}

      {/* Space title card / artwork info card */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-4">
        {focused ? (
          <div className="glass-leaf pointer-events-auto max-w-md px-6 py-4 text-center">
            <h2 className="font-display text-xl font-bold text-fir">
              {focused.title || t("untitled")}
            </h2>
            {focused.description && (
              <p className="mt-1.5 text-sm whitespace-pre-line text-fir-soft">
                {focused.description}
              </p>
            )}
            {author && (
              <p className="mt-1.5 text-xs text-fir-soft">— {author}</p>
            )}
            <button
              onClick={leaveFocus}
              className="seed-pill mt-3 bg-moss px-5 py-2 text-sm font-semibold text-mist transition-transform hover:scale-105"
            >
              {t("closeFocus")}
            </button>
          </div>
        ) : (
          !walkLocked && (
            <div className="glass-leaf px-6 py-3 text-center">
              <h1 className="font-display text-xl font-bold text-fir">
                {title}
              </h1>
              {author && <p className="text-sm text-fir-soft">— {author}</p>}
            </div>
          )
        )}
      </div>
    </div>
  );
}
