"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { Vector3 } from "three";
import type { SceneObject } from "@/lib/scene";
import { artworkCenter, buildObstacles, resolveCollisions } from "./walk";

const EYE_HEIGHT = 1.6;
const WALK_SPEED = 4.2;
const WALKER_RADIUS = 0.4;
const REACH = 3.4;

// Browsers refuse to re-acquire pointer lock for ~1.25s after an unlock;
// asking earlier throws a SecurityError. Track the last unlock across
// mounts (module scope: the component remounts around artwork focus).
const LOCK_COOLDOWN_MS = 1600;
let lastUnlockAt = 0;

const MOVE_KEYS: Record<string, [number, number]> = {
  KeyW: [0, 1],
  ArrowUp: [0, 1],
  KeyS: [0, -1],
  ArrowDown: [0, -1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

type WalkControlsProps = {
  objects: SceneObject[];
  focusables: SceneObject[];
  /** Reports the artwork currently in reach (null when none) */
  onNearChange: (id: string | null) => void;
  /** E pressed while an artwork is in reach */
  onInteract: (id: string) => void;
  onLockChange: (locked: boolean) => void;
};

/** First-person stroll: pointer-lock look, WASD/arrow moves, walls push back. */
export default function WalkControls({
  objects,
  focusables,
  onNearChange,
  onInteract,
  onLockChange,
}: Readonly<WalkControlsProps>) {
  const gl = useThree((s) => s.gl);
  const pressed = useRef(new Set<string>());
  const locked = useRef(false);
  const nearId = useRef<string | null>(null);
  const forward = useRef(new Vector3());

  const obstacles = useMemo(() => buildObstacles(objects), [objects]);

  // Lock only on canvas clicks (drei's default listens on the whole
  // document, so UI buttons would grab the mouse too), and never inside
  // the browser's post-unlock cooldown window.
  useEffect(() => {
    const el = gl.domElement;
    function tryLock() {
      if (
        document.pointerLockElement ||
        performance.now() - lastUnlockAt < LOCK_COOLDOWN_MS
      ) {
        return;
      }
      const request = el.requestPointerLock() as unknown;
      (request as Promise<void> | undefined)?.catch?.(() => {
        lastUnlockAt = performance.now();
      });
    }
    el.addEventListener("click", tryLock);
    return () => el.removeEventListener("click", tryLock);
  }, [gl]);

  // If we unmount while still locked (focusing an artwork exits the lock
  // and swaps controls), report the unlock and start the cooldown clock.
  useEffect(() => {
    return () => {
      if (locked.current) {
        lastUnlockAt = performance.now();
        onLockChange(false);
      }
    };
  }, [onLockChange]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (MOVE_KEYS[e.code]) {
        pressed.current.add(e.code);
        e.preventDefault();
      } else if (e.code === "KeyE" && nearId.current) {
        onInteract(nearId.current);
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      pressed.current.delete(e.code);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      onNearChange(null);
    };
  }, [onInteract, onNearChange]);

  useFrame(({ camera }, delta) => {
    if (!locked.current) return;
    const dt = Math.min(delta, 0.1);

    let moveX = 0;
    let moveZ = 0;
    for (const code of pressed.current) {
      const [mx, mz] = MOVE_KEYS[code];
      moveX += mx;
      moveZ += mz;
    }

    camera.getWorldDirection(forward.current);
    const fLen = Math.hypot(forward.current.x, forward.current.z) || 1;
    const fx = forward.current.x / fLen;
    const fz = forward.current.z / fLen;

    if (moveX !== 0 || moveZ !== 0) {
      const mLen = Math.hypot(moveX, moveZ);
      const step = (WALK_SPEED * dt) / mLen;
      // Right vector is forward rotated -90° around Y: (-fz, fx)
      const dx = (fx * moveZ - fz * moveX) * step;
      const dz = (fz * moveZ + fx * moveX) * step;
      const [x, z] = resolveCollisions(
        camera.position.x + dx,
        camera.position.z + dz,
        obstacles,
        WALKER_RADIUS,
      );
      camera.position.x = x;
      camera.position.z = z;
    }

    // Settle to eye height (smooth when arriving from orbit or focus)
    camera.position.y += (EYE_HEIGHT - camera.position.y) * Math.min(1, dt * 5);

    // Nearest artwork in reach and roughly in front of us
    let bestId: string | null = null;
    let bestDist = REACH;
    for (const art of focusables) {
      const [ax, ay, az] = artworkCenter(art);
      const dx = ax - camera.position.x;
      const dy = ay - camera.position.y;
      const dz = az - camera.position.z;
      const dist = Math.hypot(dx, dy, dz);
      if (dist >= bestDist) continue;
      const facing =
        (dx * forward.current.x + dy * forward.current.y + dz * forward.current.z) /
        (dist || 1);
      if (facing < 0.45) continue;
      bestId = art.id;
      bestDist = dist;
    }
    if (bestId !== nearId.current) {
      nearId.current = bestId;
      onNearChange(bestId);
    }
  });

  return (
    <PointerLockControls
      // Dead selector: disables drei's own document-wide click-to-lock;
      // the canvas listener above is the only lock trigger.
      selector="#natura-walk-lock-off"
      onLock={() => {
        locked.current = true;
        onLockChange(true);
      }}
      onUnlock={() => {
        locked.current = false;
        lastUnlockAt = performance.now();
        onLockChange(false);
        pressed.current.clear();
      }}
    />
  );
}
