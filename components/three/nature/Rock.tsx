"use client";

type RockProps = {
  position?: [number, number, number];
  scale?: number;
  tint?: string;
  rotationY?: number;
};

export default function Rock({
  position = [0, 0, 0],
  scale = 1,
  tint = "#9aa48f",
  rotationY = 0,
}: RockProps) {
  return (
    <mesh
      position={position}
      rotation={[0, rotationY, 0]}
      scale={[scale, scale * 0.65, scale]}
    >
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color={tint} flatShading />
    </mesh>
  );
}
