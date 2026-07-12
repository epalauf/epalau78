"use client";

type MushroomProps = {
  position?: [number, number, number];
  scale?: number;
  tint?: string;
  rotationY?: number;
  /** Geometry richness 0 rough → 1 smooth; 0.35 matches the classic look */
  detail?: number;
};

const STEM = "#efe6d4";

export default function Mushroom({
  position = [0, 0, 0],
  scale = 1,
  tint = "#c9503e",
  rotationY = 0,
  detail = 0.35,
}: MushroomProps) {
  const seg = (lo: number, hi: number) => Math.round(lo + detail * (hi - lo));
  const capW = seg(6, 12);
  const capH = seg(4, 10);
  const stemSeg = seg(5, 12);
  const spotW = seg(4, 8);
  const spotH = seg(3, 6);
  const flat = detail < 0.65;

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.28, stemSeg]} />
        <meshStandardMaterial key={String(flat)} color={STEM} flatShading={flat} />
      </mesh>
      <mesh position={[0, 0.3, 0]} scale={[1, 0.62, 1]}>
        <sphereGeometry args={[0.2, capW, capH, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial key={String(flat)} color={tint} flatShading={flat} />
      </mesh>
      {/* Spots */}
      {[
        [0.09, 0.36, 0.08],
        [-0.1, 0.34, 0.05],
        [0.02, 0.38, -0.1],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.03, spotW, spotH]} />
          <meshStandardMaterial key={String(flat)} color="#f6f1e5" flatShading={flat} />
        </mesh>
      ))}
    </group>
  );
}
