"use client";

type PedestalProps = {
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  /** Sculpture color */
  tint?: string;
};

/** A white plinth with a small abstract sculpture on top. */
export default function Pedestal({
  position = [0, 0, 0],
  rotationY = 0,
  scale = 1,
  tint = "#c9503e",
}: PedestalProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.6, 1.1, 0.6]} />
        <meshStandardMaterial color="#faf7f0" />
      </mesh>
      <mesh position={[0, 1.42, 0]} rotation={[0.4, 0.6, 0]}>
        <torusKnotGeometry args={[0.24, 0.08, 64, 8]} />
        <meshStandardMaterial color={tint} roughness={0.35} />
      </mesh>
    </group>
  );
}
