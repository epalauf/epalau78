"use client";

type MushroomProps = {
  position?: [number, number, number];
  scale?: number;
  tint?: string;
  rotationY?: number;
};

const STEM = "#efe6d4";

export default function Mushroom({
  position = [0, 0, 0],
  scale = 1,
  tint = "#c9503e",
  rotationY = 0,
}: MushroomProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.28, 7]} />
        <meshStandardMaterial color={STEM} flatShading />
      </mesh>
      <mesh position={[0, 0.3, 0]} scale={[1, 0.62, 1]}>
        <sphereGeometry args={[0.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={tint} flatShading />
      </mesh>
      {/* Spots */}
      {[
        [0.09, 0.36, 0.08],
        [-0.1, 0.34, 0.05],
        [0.02, 0.38, -0.1],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.03, 5, 4]} />
          <meshStandardMaterial color="#f6f1e5" flatShading />
        </mesh>
      ))}
    </group>
  );
}
