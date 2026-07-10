"use client";

import {
  DOORWAY_OPENING,
  WALL_HEIGHT,
  WALL_THICKNESS,
  WALL_WIDTH,
} from "@/lib/scene";

type DoorwayProps = {
  rotationY?: number;
  scale?: number;
  tint?: string;
};

const PANEL_WIDTH = (WALL_WIDTH - DOORWAY_OPENING) / 2;
const PANEL_CENTER = DOORWAY_OPENING / 2 + PANEL_WIDTH / 2;
const OPENING_HEIGHT = 2.3;
const LINTEL_HEIGHT = WALL_HEIGHT - OPENING_HEIGHT;

/** A wall segment with a walk-through opening, for corridors between rooms. */
export default function Doorway({
  rotationY = 0,
  scale = 1,
  tint = "#ece7db",
}: DoorwayProps) {
  return (
    <group rotation={[0, rotationY, 0]} scale={scale}>
      {[-PANEL_CENTER, PANEL_CENTER].map((x) => (
        <group key={x}>
          <mesh position={[x, WALL_HEIGHT / 2, 0]}>
            <boxGeometry args={[PANEL_WIDTH, WALL_HEIGHT, WALL_THICKNESS]} />
            <meshStandardMaterial color={tint} flatShading />
          </mesh>
          <mesh position={[x, 0.09, 0]}>
            <boxGeometry args={[PANEL_WIDTH, 0.18, WALL_THICKNESS + 0.06]} />
            <meshStandardMaterial color="#8a8578" flatShading />
          </mesh>
        </group>
      ))}
      <mesh position={[0, OPENING_HEIGHT + LINTEL_HEIGHT / 2, 0]}>
        <boxGeometry args={[DOORWAY_OPENING, LINTEL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={tint} flatShading />
      </mesh>
    </group>
  );
}
