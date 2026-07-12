"use client";

type RockProps = {
  position?: [number, number, number];
  scale?: number;
  tint?: string;
  rotationY?: number;
  /** Geometry richness 0 rough → 1 smooth; 0.35 matches the classic look */
  detail?: number;
};

export default function Rock({
  position = [0, 0, 0],
  scale = 1,
  tint = "#9aa48f",
  rotationY = 0,
  detail = 0.35,
}: RockProps) {
  // Rocks stay flat-shaded at every detail level — smooth rocks look like blobs
  const subdiv = detail < 0.45 ? 0 : detail < 0.8 ? 1 : 2;

  return (
    <mesh
      position={position}
      rotation={[0, rotationY, 0]}
      scale={[scale, scale * 0.65, scale]}
    >
      <dodecahedronGeometry args={[0.5, subdiv]} />
      <meshStandardMaterial color={tint} flatShading />
    </mesh>
  );
}
