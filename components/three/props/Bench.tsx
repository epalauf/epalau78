"use client";

type BenchProps = {
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  tint?: string;
};

/** A simple wooden bench. */
export default function Bench({
  position = [0, 0, 0],
  rotationY = 0,
  scale = 1,
  tint = "#c9b48f",
}: BenchProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[2.1, 0.12, 0.55]} />
        <meshStandardMaterial color={tint} flatShading />
      </mesh>
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, 0.24, 0]}>
          <boxGeometry args={[0.12, 0.48, 0.45]} />
          <meshStandardMaterial color={tint} flatShading />
        </mesh>
      ))}
    </group>
  );
}
