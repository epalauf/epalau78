"use client";

const GEAR = "#33302c";

type TripodProps = {
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  tint?: string;
};

/** A camera on a tripod. */
export default function Tripod({
  position = [0, 0, 0],
  rotationY = 0,
  scale = 1,
  tint = GEAR,
}: TripodProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
          <mesh position={[0.3, 0.78, 0]} rotation={[0, 0, 0.36]}>
            <cylinderGeometry args={[0.028, 0.04, 1.62, 6]} />
            <meshStandardMaterial color={tint} flatShading />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.68, 0]}>
        <boxGeometry args={[0.46, 0.3, 0.32]} />
        <meshStandardMaterial color={tint} flatShading />
      </mesh>
      <mesh position={[0, 1.68, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.11, 0.13, 0.18, 10]} />
        <meshStandardMaterial color="#191715" flatShading />
      </mesh>
    </group>
  );
}
