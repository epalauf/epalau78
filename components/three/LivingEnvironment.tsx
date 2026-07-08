"use client";

import { useMemo } from "react";
import { Sky, Stars } from "@react-three/drei";
import { Color } from "three";
import type { EnvironmentSettings } from "@/lib/scene";
import PuffClouds from "./nature/PuffClouds";
import Butterflies from "./nature/Butterflies";
import Fireflies from "./nature/Fireflies";

const DAY_FOG = new Color("#dcebd2");
const NIGHT_FOG = new Color("#141c2a");

/**
 * Sky, lights, fog, and ambient life for a scene, driven by its
 * environment settings. timeOfDay: 0 night → 0.5 noon → 1 night.
 */
export default function LivingEnvironment({
  environment,
}: Readonly<{ environment: EnvironmentSettings }>) {
  const { timeOfDay, effects } = environment;

  const computed = useMemo(() => {
    // Daylight factor: 0 at night, 1 at noon
    const daylight = Math.max(0, Math.sin(timeOfDay * Math.PI));
    const elevationDeg = Math.sin(timeOfDay * Math.PI) * 55 - 8;
    const elevation = (elevationDeg * Math.PI) / 180;
    const azimuth = Math.PI * 0.35;
    const sun: [number, number, number] = [
      Math.cos(elevation) * Math.sin(azimuth) * 100,
      Math.sin(elevation) * 100,
      -Math.cos(elevation) * Math.cos(azimuth) * 100,
    ];
    // Warm light at dawn/dusk, white at noon
    const warmth = 1 - Math.min(1, daylight * 1.6);
    const sunColor = new Color("#ffffff").lerp(new Color("#ff9a56"), warmth);
    const fogColor = NIGHT_FOG.clone().lerp(DAY_FOG, daylight);
    return {
      daylight,
      sun,
      sunColor,
      fogColor: `#${fogColor.getHexString()}`,
      isNight: daylight < 0.12,
    };
  }, [timeOfDay]);

  return (
    <>
      <fog attach="fog" args={[computed.fogColor, 45, 130]} />
      <Sky
        sunPosition={computed.sun}
        turbidity={6}
        rayleigh={computed.daylight > 0.05 ? 1.6 : 4}
      />
      {computed.isNight && (
        <Stars radius={90} depth={40} count={1500} factor={3} fade speed={0.6} />
      )}

      <ambientLight
        intensity={0.22 + computed.daylight * 0.6}
        color={computed.isNight ? "#8ba3c7" : "#fff8e7"}
      />
      <directionalLight
        position={computed.sun}
        intensity={0.15 + computed.daylight * 1.35}
        color={computed.sunColor}
      />

      {effects.clouds && !computed.isNight && <PuffClouds count={4} />}
      {effects.butterflies && computed.daylight > 0.25 && (
        <Butterflies count={5} areaRadius={10} />
      )}
      {effects.fireflies && (
        <Fireflies glow={1 - computed.daylight * 0.75} />
      )}
    </>
  );
}
