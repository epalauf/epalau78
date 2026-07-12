"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEditorStore } from "@/stores/editorStore";
import { GROUND_RADIUS, snapFrameToWall, type SceneObject } from "@/lib/scene";
import { hashSeed } from "@/lib/random";
import { userImagePublicUrl } from "@/lib/images";
import AssetMesh from "@/components/three/nature/AssetMesh";
import LivingEnvironment from "@/components/three/LivingEnvironment";

function clampToGround(x: number, z: number): [number, number, number] {
  const r = Math.hypot(x, z);
  const max = GROUND_RADIUS - 1;
  if (r > max) {
    const k = max / r;
    return [x * k, 0, z * k];
  }
  return [x, 0, z];
}

function EditorObject({
  object,
  windStrength,
  phase,
}: Readonly<{ object: SceneObject; windStrength: number; phase: number }>) {
  const selectObject = useEditorStore((s) => s.selectObject);
  const setDraggingObject = useEditorStore((s) => s.setDraggingObject);
  const isSelected = useEditorStore((s) => s.selectedId === object.id);
  const getThree = useThree((s) => s.get);

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    // Disable camera controls synchronously on grab — the React `enabled` prop
    // re-renders too late and OrbitControls would start orbiting mid-drag.
    const controls = getThree().controls as unknown as {
      enabled: boolean;
    } | null;
    if (controls) controls.enabled = false;
    selectObject(object.id);
    setDraggingObject(true);
  }

  return (
    <group position={object.position}>
      <group
        onPointerDown={handlePointerDown}
        onPointerUp={() => setDraggingObject(false)}
      >
        <AssetMesh
          asset={object.asset}
          tint={object.tint}
          rotationY={object.rotationY}
          rotationX={object.rotationX}
          rotationZ={object.rotationZ}
          scale={object.scale}
          windPhase={phase}
          windStrength={windStrength}
          imageUrl={object.image ? userImagePublicUrl(object.image) : undefined}
          seed={hashSeed(object.id)}
          mounted={object.mounted}
          offsetX={object.offsetX}
          offsetY={object.offsetY}
          detail={object.detail}
        />
      </group>
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[object.scale * 0.9, object.scale * 1.05, 32]} />
          <meshBasicMaterial color="#e8b54a" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
}

function Ground() {
  const groundColor = useEditorStore((s) => s.groundColor);
  const placingAsset = useEditorStore((s) => s.placingAsset);
  const placeObject = useEditorStore((s) => s.placeObject);
  const selectObject = useEditorStore((s) => s.selectObject);
  const isDraggingObject = useEditorStore((s) => s.isDraggingObject);
  const selectedId = useEditorStore((s) => s.selectedId);
  const updateObject = useEditorStore((s) => s.updateObject);
  const setDraggingObject = useEditorStore((s) => s.setDraggingObject);
  const [hover, setHover] = useState<[number, number, number] | null>(null);

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (placingAsset) {
      e.stopPropagation();
      placeObject(clampToGround(e.point.x, e.point.z));
    } else {
      selectObject(null);
    }
  }

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (placingAsset) {
      setHover(clampToGround(e.point.x, e.point.z));
    } else if (isDraggingObject && selectedId) {
      const { objects } = useEditorStore.getState();
      const dragged = objects.find((o) => o.id === selectedId);
      // Frames dragged near a wall snap flush onto it (and detach when pulled away)
      const snap =
        dragged?.asset === "frame"
          ? snapFrameToWall(e.point.x, e.point.z, dragged.scale, objects, dragged.id)
          : null;
      if (snap) {
        updateObject(selectedId, {
          position: snap.position,
          rotationY: snap.rotationY,
          mounted: true,
        });
      } else {
        // Keep the object's altitude — floating assets are dragged in x/z only
        const [x, , z] = clampToGround(e.point.x, e.point.z);
        updateObject(selectedId, {
          position: [x, dragged?.position[1] ?? 0, z],
          mounted: undefined,
        });
      }
    }
  }

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDraggingObject(false)}
        onPointerLeave={() => setHover(null)}
      >
        <circleGeometry args={[GROUND_RADIUS, 48]} />
        <meshStandardMaterial color={groundColor} />
      </mesh>
      {placingAsset && hover && <PlacementGhost position={hover} />}
    </>
  );
}

function PlacementGhost({
  position,
}: Readonly<{ position: [number, number, number] }>) {
  const placingAsset = useEditorStore((s) => s.placingAsset);
  if (!placingAsset) return null;
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.9, 24]} />
        <meshBasicMaterial color="#e8b54a" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

/**
 * Re-enables camera controls when any drag ends. Mirrors the synchronous
 * disable in EditorObject.handlePointerDown — relying on the React `enabled`
 * prop alone can miss the re-enable when the down/up state updates land in
 * the same render batch.
 */
function DragReleaseGuard() {
  const getThree = useThree((s) => s.get);
  const setDraggingObject = useEditorStore((s) => s.setDraggingObject);

  useEffect(() => {
    function onPointerUp() {
      const controls = getThree().controls as unknown as {
        enabled: boolean;
      } | null;
      if (controls) controls.enabled = true;
      setDraggingObject(false);
    }
    window.addEventListener("pointerup", onPointerUp);
    return () => window.removeEventListener("pointerup", onPointerUp);
  }, [getThree, setDraggingObject]);

  return null;
}

function SceneObjects() {
  const objects = useEditorStore((s) => s.objects);
  const windStrength = useEditorStore((s) => s.environment.windStrength);
  const phases = useMemo(
    () => new Map(objects.map((o, i) => [o.id, (i * 1.37) % (Math.PI * 2)])),
    [objects],
  );

  return (
    <>
      {objects.map((o) => (
        <EditorObject
          key={o.id}
          object={o}
          windStrength={windStrength}
          phase={phases.get(o.id) ?? 0}
        />
      ))}
    </>
  );
}

export default function EditorScene() {
  const isDraggingObject = useEditorStore((s) => s.isDraggingObject);
  const selectObject = useEditorStore((s) => s.selectObject);
  const setPlacingAsset = useEditorStore((s) => s.setPlacingAsset);
  const removeObject = useEditorStore((s) => s.removeObject);
  const environment = useEditorStore((s) => s.environment);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        selectObject(null);
        setPlacingAsset(null);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        const { selectedId } = useEditorStore.getState();
        if (selectedId) removeObject(selectedId);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectObject, setPlacingAsset, removeObject]);

  return (
    <Canvas
      camera={{ position: [10, 9, 15], fov: 45 }}
      dpr={[1, 1.75]}
      performance={{ min: 0.5 }}
      gl={{ preserveDrawingBuffer: true }}
      className="!absolute inset-0"
      onPointerMissed={() => selectObject(null)}
    >
      <LivingEnvironment environment={environment} />

      <DragReleaseGuard />
      <Ground />
      <SceneObjects />

      <OrbitControls
        makeDefault
        enabled={!isDraggingObject}
        target={[0, 0.5, 0]}
        maxPolarAngle={Math.PI / 2 - 0.08}
        minDistance={2.5}
        maxDistance={70}
      />
    </Canvas>
  );
}
