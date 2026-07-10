"use client";

import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sky, useTexture } from "@react-three/drei";
import {
  Color,
  MathUtils,
  Vector3,
  type AmbientLight,
  type DirectionalLight,
  type Fog,
  type Group,
  type MeshStandardMaterial,
} from "three";
import type { Sky as SkyImpl } from "three-stdlib";
import { useHeroStore } from "@/stores/heroStore";
import { mulberry32, pick } from "@/lib/random";
import PineTree from "@/components/three/nature/PineTree";
import Rock from "@/components/three/nature/Rock";
import Flower from "@/components/three/nature/Flower";
import GrassTufts from "@/components/three/nature/GrassTufts";
import Butterflies from "@/components/three/nature/Butterflies";
import Pond from "@/components/three/nature/Pond";
import Mushroom from "@/components/three/nature/Mushroom";
import PuffClouds from "@/components/three/nature/PuffClouds";
import Tripod from "@/components/three/props/Tripod";
import Easel from "@/components/three/props/Easel";
import Building from "@/components/three/props/Building";
import StreetLamp from "@/components/three/props/StreetLamp";
import { makePlaceholderDataUrl } from "@/components/gallery/placeholderTexture";

// Three worlds, one canvas: only the selected scenario is mounted, so the
// runtime cost stays that of a single scene. Lighting eases toward the
// selected scenario's mood while its world swaps in.
const SCENARIOS = [
  {
    // Nature — lush meadow at noon
    sunElev: 42,
    sunColor: "#ffe9b8",
    sunIntensity: 1.4,
    ambColor: "#fff8e7",
    ambIntensity: 0.75,
    fog: "#dcebd2",
    rayleigh: 1.6,
  },
  {
    // Photographers — city street at golden hour
    sunElev: 7,
    sunColor: "#ff9a56",
    sunIntensity: 1.25,
    ambColor: "#ffd6b0",
    ambIntensity: 0.68,
    fog: "#e3b98e",
    rayleigh: 3.4,
  },
  {
    // Artists — bright white-cube gallery interior
    sunElev: 55,
    sunColor: "#ffffff",
    sunIntensity: 0.85,
    ambColor: "#fff6ea",
    ambIntensity: 0.95,
    fog: "#efece4",
    rayleigh: 1.2,
  },
] as const;

const AZIMUTH = Math.PI * 0.35;
const CAMERA = new Vector3(0, 4.2, 13);

function setSunPosition(elevDeg: number, out: Vector3) {
  const elev = (elevDeg * Math.PI) / 180;
  out.set(
    Math.cos(elev) * Math.sin(AZIMUTH) * 100,
    Math.sin(elev) * 100,
    -Math.cos(elev) * Math.cos(AZIMUTH) * 100,
  );
}

function Ground({ color }: Readonly<{ color: string }>) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[45, 48]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/* ------------------------------ frames & props ------------------------------ */

type FrameSpec = {
  position: [number, number, number];
  seed: number;
  phase: number;
  scale: number;
};

function DriftingFrame({
  frame,
  glow = 0,
  drift = 0.18,
}: Readonly<{ frame: FrameSpec; glow?: number; drift?: number }>) {
  const group = useRef<Group>(null);
  const frameMat = useRef<MeshStandardMaterial>(null);
  const artMat = useRef<MeshStandardMaterial>(null);
  const url = useMemo(() => makePlaceholderDataUrl(frame.seed), [frame.seed]);
  const texture = useTexture(url);

  const [x, y, z] = frame.position;
  // Face the resting camera position
  const rotationY = Math.atan2(CAMERA.x - x, CAMERA.z - z);

  useFrame(({ clock, pointer }, delta) => {
    if (!group.current || !frameMat.current || !artMat.current) return;
    const t = clock.elapsedTime;

    // Fade in on mount; unmount is masked by the lighting transition
    const o = MathUtils.damp(frameMat.current.opacity, 1, 2.5, delta);
    frameMat.current.opacity = o;
    artMat.current.opacity = o;
    artMat.current.emissiveIntensity = glow * o;

    // Same motion language as the gallery: vertical drift + gentle cursor lean
    group.current.position.y = y + Math.sin(t * 0.6 + frame.phase) * drift;
    group.current.rotation.y = MathUtils.lerp(
      group.current.rotation.y,
      rotationY + pointer.x * 0.1,
      0.05,
    );
    group.current.rotation.x = MathUtils.lerp(
      group.current.rotation.x,
      -pointer.y * 0.06 + Math.sin(t * 0.4 + frame.phase) * 0.02,
      0.05,
    );
  });

  return (
    <group
      ref={group}
      position={frame.position}
      rotation={[0, rotationY, 0]}
      scale={frame.scale}
    >
      <mesh position={[0, 0, -0.015]}>
        <boxGeometry args={[2.3, 1.75, 0.02]} />
        <meshStandardMaterial ref={frameMat} color="#f6f3ea" transparent opacity={0} />
      </mesh>
      <mesh>
        <planeGeometry args={[2.15, 1.6]} />
        <meshStandardMaterial
          ref={artMat}
          map={texture}
          emissive="#ffffff"
          emissiveMap={texture}
          emissiveIntensity={0}
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* -------------------------- 🌿 nature: lush meadow -------------------------- */

const MEADOW_GREENS = ["#3f7145", "#4c8552", "#35643c", "#578f57"] as const;
const FLOWER_TINTS = ["#f2f0e4", "#e8b54a", "#d98fb0", "#7ab5c4"] as const;

/** 🌿 Lush pine meadow at noon: pond, flowers, mushrooms, butterflies. */
function NatureScenario() {
  const scatter = useMemo(() => {
    const rand = mulberry32(42);
    const trees = Array.from({ length: 26 }, () => {
      const a = rand() * Math.PI * 2;
      // Keep a clearing in the middle so the camera looks through open meadow
      const r = 7 + Math.sqrt(rand()) * 18;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r - 4,
        scale: 0.8 + rand() * 1.3,
        tint: pick(rand, MEADOW_GREENS),
        phase: rand() * Math.PI * 2,
      };
    });
    const rocks = Array.from({ length: 9 }, () => ({
      x: (rand() - 0.5) * 30,
      z: (rand() - 0.5) * 22 - 2,
      scale: 0.3 + rand() * 0.8,
      rotY: rand() * Math.PI * 2,
    }));
    const flowers = Array.from({ length: 24 }, () => {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 10;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        scale: 0.8 + rand() * 0.8,
        tint: pick(rand, FLOWER_TINTS),
        phase: rand() * Math.PI * 2,
      };
    });
    return { trees, rocks, flowers };
  }, []);

  return (
    <group>
      <Ground color="#7cb56b" />
      {scatter.trees.map((t, i) => (
        <PineTree
          key={`t${i}`}
          position={[t.x, 0, t.z]}
          scale={t.scale}
          tint={t.tint}
          windPhase={t.phase}
        />
      ))}
      {scatter.rocks.map((r, i) => (
        <Rock
          key={`r${i}`}
          position={[r.x, r.scale * 0.25, r.z]}
          scale={r.scale}
          rotationY={r.rotY}
        />
      ))}
      {scatter.flowers.map((f, i) => (
        <Flower
          key={`f${i}`}
          position={[f.x, 0, f.z]}
          scale={f.scale}
          tint={f.tint}
          windPhase={f.phase}
        />
      ))}
      <GrassTufts count={320} radius={22} />
      <Pond position={[3.1, 0, 2.6]} scale={1.15} />
      <Mushroom position={[-3.4, 0, 3.6]} scale={1.2} rotationY={0.5} />
      <Mushroom position={[-3.9, 0, 4.1]} scale={0.8} rotationY={2.2} tint="#d98f3e" />
      <Butterflies count={7} areaRadius={9} />
      <PuffClouds count={5} />
    </group>
  );
}

/* ---------------------- 📷 photographers: sunset city ---------------------- */

const FACADES = ["#3a4252", "#46424e", "#39474a", "#4a4340"] as const;

type BuildingSpec = {
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  seed: number;
  tint: string;
};

const PHOTO_FRAMES: FrameSpec[] = [
  { position: [-5.4, 2.7, 0.5], seed: 1201, phase: 0.4, scale: 1 },
  { position: [5, 2.3, -1.5], seed: 2077, phase: 2.1, scale: 0.9 },
  { position: [2.4, 3.9, -5.5], seed: 3300, phase: 4.2, scale: 0.85 },
  { position: [-2.9, 4.1, -4], seed: 4501, phase: 1.3, scale: 0.75 },
  { position: [0.4, 5, -8.5], seed: 5644, phase: 3.2, scale: 0.9 },
];

/** 📷 A city street at golden hour: lit windows, streetlamps, drifting photos. */
function PhotoScenario() {
  const buildings = useMemo<BuildingSpec[]>(() => {
    const rand = mulberry32(310);
    const specs: BuildingSpec[] = [];
    // Two rows flanking the street: low near the camera, taller toward the
    // back, wide apart so the sunset sky pours down the street
    for (let i = 0; i < 5; i++) {
      const z = 1 - i * 5.4;
      specs.push({
        position: [-(11.5 + rand() * 3), 0, z],
        width: 3.6 + rand() * 2,
        height: 4.5 + rand() * 3.5 + i * 2.2,
        depth: 3.6 + rand() * 1.6,
        seed: 900 + i * 37,
        tint: pick(rand, FACADES),
      });
      specs.push({
        position: [11.5 + rand() * 3, 0, z - 2.6],
        width: 3.6 + rand() * 2,
        height: 4.5 + rand() * 3.5 + i * 2.2,
        depth: 3.6 + rand() * 1.6,
        seed: 1400 + i * 41,
        tint: pick(rand, FACADES),
      });
    }
    // Distant towers near the vanishing point, hazy in the sunset
    specs.push({ position: [6, 0, -30], width: 7, height: 17, depth: 6, seed: 2222, tint: FACADES[0] });
    specs.push({ position: [-8, 0, -28], width: 5, height: 12, depth: 5, seed: 2333, tint: FACADES[2] });
    return specs;
  }, []);

  const dashes = useMemo(
    () => Array.from({ length: 11 }, (_, i) => -20 + i * 2.9),
    [],
  );

  return (
    <group>
      <Ground color="#43454b" />
      {/* Lane markings running toward the horizon */}
      {dashes.map((z) => (
        <mesh key={z} position={[0, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 1.3]} />
          <meshStandardMaterial color="#e8e3d2" />
        </mesh>
      ))}
      {buildings.map((spec) => (
        <Building
          key={spec.seed}
          position={spec.position}
          width={spec.width}
          height={spec.height}
          depth={spec.depth}
          seed={spec.seed}
          tint={spec.tint}
        />
      ))}
      <StreetLamp position={[-4.4, 0, 2.4]} rotationY={0.2} />
      <StreetLamp position={[4.6, 0, -3.5]} rotationY={Math.PI - 0.2} />
      {PHOTO_FRAMES.map((frame) => (
        <DriftingFrame key={frame.seed} frame={frame} glow={0.2} />
      ))}
      <Tripod position={[-2.4, 0, 4.6]} rotationY={0.7} />
    </group>
  );
}

/* ------------------------ 🎨 artists: white gallery ------------------------ */

const WALL = "#f5f1ea";
const WOOD_FLOOR = "#d8c5a4";

/** A framed piece hung flat on a gallery wall. */
function WallArt({
  position,
  rotationY = 0,
  size,
  seed,
}: Readonly<{
  position: [number, number, number];
  rotationY?: number;
  size: [number, number];
  seed: number;
}>) {
  const url = useMemo(() => makePlaceholderDataUrl(seed), [seed]);
  const texture = useTexture(url);
  const [w, h] = size;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[w + 0.14, h + 0.14, 0.05]} />
        <meshStandardMaterial color="#2b2723" />
      </mesh>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          map={texture}
          emissive="#ffffff"
          emissiveMap={texture}
          emissiveIntensity={0.3}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Ceiling track spot aimed at the wall pieces (decorative). */
function TrackSpot({ x }: Readonly<{ x: number }>) {
  return (
    <group position={[x, 7.7, -6.8]} rotation={[-0.6, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.09, 0.13, 0.42, 8]} />
        <meshStandardMaterial color="#2b2723" flatShading />
      </mesh>
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.04, 8]} />
        <meshStandardMaterial
          color="#fff6de"
          emissive="#fff0c4"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** 🎨 A minimal white-cube gallery: hung works, track lights, bench, sculpture. */
function ArtScenario() {
  return (
    <group>
      {/* Room */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[46, 40]} />
        <meshStandardMaterial color={WOOD_FLOOR} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8.2, 0]}>
        <planeGeometry args={[46, 40]} />
        <meshStandardMaterial color={WALL} />
      </mesh>
      <mesh position={[0, 4.1, -9]}>
        <planeGeometry args={[46, 8.2]} />
        <meshStandardMaterial color={WALL} />
      </mesh>
      <mesh position={[-14, 4.1, 4]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[30, 8.2]} />
        <meshStandardMaterial color={WALL} />
      </mesh>
      <mesh position={[14, 4.1, 4]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[30, 8.2]} />
        <meshStandardMaterial color={WALL} />
      </mesh>
      <mesh position={[0, 4.1, 17]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[46, 8.2]} />
        <meshStandardMaterial color={WALL} />
      </mesh>

      {/* The exhibition: generous spacing, works are the only color */}
      <WallArt position={[0, 3.2, -8.94]} size={[3.4, 2.3]} seed={7001} />
      <WallArt position={[-5.2, 3, -8.94]} size={[1.7, 2.3]} seed={7311} />
      <WallArt position={[5.2, 3, -8.94]} size={[2.4, 1.7]} seed={7621} />
      <WallArt position={[-13.94, 3, 0]} rotationY={Math.PI / 2} size={[2.4, 1.7]} seed={7931} />
      <WallArt position={[13.94, 3, 1]} rotationY={-Math.PI / 2} size={[1.8, 2.4]} seed={8241} />

      <TrackSpot x={-5.2} />
      <TrackSpot x={0} />
      <TrackSpot x={5.2} />
      <pointLight position={[0, 7.4, 1]} intensity={0.5} color="#fff2dc" distance={26} />

      {/* Gallery furniture */}
      <group position={[-2.6, 0, 4.2]} rotation={[0, 0.24, 0]}>
        <mesh position={[0, 0.52, 0]}>
          <boxGeometry args={[2.1, 0.12, 0.55]} />
          <meshStandardMaterial color="#c9b48f" flatShading />
        </mesh>
        {[-0.8, 0.8].map((x) => (
          <mesh key={x} position={[x, 0.24, 0]}>
            <boxGeometry args={[0.12, 0.48, 0.45]} />
            <meshStandardMaterial color="#b6a181" flatShading />
          </mesh>
        ))}
      </group>
      <group position={[-4, 0, 1.6]}>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.6, 1.1, 0.6]} />
          <meshStandardMaterial color="#faf7f0" />
        </mesh>
        <mesh position={[0, 1.42, 0]} rotation={[0.4, 0.6, 0]}>
          <torusKnotGeometry args={[0.24, 0.08, 64, 8]} />
          <meshStandardMaterial color="#c9503e" roughness={0.35} />
        </mesh>
      </group>
      <Easel position={[4.6, 0, 1.2]} rotationY={-0.5} seed={8811} />
    </group>
  );
}

/* ------------------------------- lighting rig ------------------------------- */

export default function HeroScenarios() {
  const chapter = useHeroStore((s) => s.chapter);
  const sky = useRef<SkyImpl>(null);
  const dirLight = useRef<DirectionalLight>(null);
  const ambLight = useRef<AmbientLight>(null);
  const fog = useRef<Fog>(null);

  const palette = useMemo(
    () => ({
      sun: SCENARIOS.map((s) => new Color(s.sunColor)),
      amb: SCENARIOS.map((s) => new Color(s.ambColor)),
      fog: SCENARIOS.map((s) => new Color(s.fog)),
    }),
    [],
  );
  // Current mood values, eased toward the selected scenario every frame
  const cur = useRef<{
    sunElev: number;
    sunIntensity: number;
    ambIntensity: number;
    rayleigh: number;
  }>({
    sunElev: SCENARIOS[0].sunElev,
    sunIntensity: SCENARIOS[0].sunIntensity,
    ambIntensity: SCENARIOS[0].ambIntensity,
    rayleigh: SCENARIOS[0].rayleigh,
  });
  const sunVec = useMemo(() => new Vector3(), []);

  useFrame((_, delta) => {
    const target = SCENARIOS[chapter];
    const c = cur.current;
    const lambda = 2.2;
    c.sunElev = MathUtils.damp(c.sunElev, target.sunElev, lambda, delta);
    c.sunIntensity = MathUtils.damp(c.sunIntensity, target.sunIntensity, lambda, delta);
    c.ambIntensity = MathUtils.damp(c.ambIntensity, target.ambIntensity, lambda, delta);
    c.rayleigh = MathUtils.damp(c.rayleigh, target.rayleigh, lambda, delta);
    const k = 1 - Math.exp(-lambda * delta);

    setSunPosition(c.sunElev, sunVec);
    if (dirLight.current) {
      dirLight.current.position.copy(sunVec);
      dirLight.current.intensity = c.sunIntensity;
      dirLight.current.color.lerp(palette.sun[chapter], k);
    }
    if (ambLight.current) {
      ambLight.current.intensity = c.ambIntensity;
      ambLight.current.color.lerp(palette.amb[chapter], k);
    }
    if (fog.current) {
      fog.current.color.lerp(palette.fog[chapter], k);
    }
    const skyUniforms = sky.current?.material.uniforms;
    if (skyUniforms) {
      skyUniforms.sunPosition.value.copy(sunVec);
      skyUniforms.rayleigh.value = c.rayleigh;
    }
  });

  return (
    <>
      <fog ref={fog} attach="fog" args={["#dcebd2", 20, 60]} />
      <Sky ref={sky} sunPosition={[6, 1.4, -8]} turbidity={6} rayleigh={1.6} />
      <ambientLight ref={ambLight} intensity={0.75} color="#fff8e7" />
      <directionalLight ref={dirLight} position={[6, 8, -4]} intensity={1.4} color="#ffe9b8" />
      <Suspense fallback={null}>
        {chapter === 0 && <NatureScenario />}
        {chapter === 1 && <PhotoScenario />}
        {chapter === 2 && <ArtScenario />}
      </Suspense>
    </>
  );
}
