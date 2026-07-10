"use client";

type StreetLampProps = {
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  tint?: string;
};

/** A streetlamp with a warm glowing head. */
export default function StreetLamp({
  position = [0, 0, 0],
  rotationY = 0,
  scale = 1,
  tint = "#33302c",
}: StreetLampProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[0, 1.9, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 3.8, 6]} />
        <meshStandardMaterial color={tint} flatShading />
      </mesh>
      <mesh position={[0.55, 3.75, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 1.1, 6]} />
        <meshStandardMaterial color={tint} flatShading />
      </mesh>
      <mesh position={[1.05, 3.68, 0]}>
        <sphereGeometry args={[0.14, 8, 6]} />
        <meshStandardMaterial
          color="#fff3c4"
          emissive="#ffd97a"
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
