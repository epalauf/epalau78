export const ASSET_IDS = [
  "pine",
  "broadleaf",
  "bush",
  "rock",
  "flower",
  "mushroom",
  "pond",
] as const;

export type AssetId = (typeof ASSET_IDS)[number];

export type SceneObject = {
  id: string;
  asset: AssetId;
  position: [number, number, number];
  rotationY: number;
  scale: number;
  tint: string;
};

export type EnvironmentSettings = {
  timeOfDay: number; // 0 = night, 0.5 = noon, 1 = night again
  windStrength: number; // 0..1
  effects: {
    butterflies: boolean;
    clouds: boolean;
    fireflies: boolean;
  };
};

export type SceneData = {
  version: 1;
  environment: EnvironmentSettings;
  terrain: { groundColor: string };
  objects: SceneObject[];
};

export const DEFAULT_ENVIRONMENT: EnvironmentSettings = {
  timeOfDay: 0.4,
  windStrength: 0.5,
  effects: { butterflies: true, clouds: true, fireflies: false },
};

export const DEFAULT_GROUND_COLOR = "#7cb56b";

export const GROUND_RADIUS = 28;

/** Default tint per asset — also the palette preview color. */
export const ASSET_DEFAULTS: Record<AssetId, { tint: string; scale: number }> =
  {
    pine: { tint: "#3f7145", scale: 1 },
    broadleaf: { tint: "#4c8552", scale: 1 },
    bush: { tint: "#57904f", scale: 1 },
    rock: { tint: "#9aa48f", scale: 1 },
    flower: { tint: "#f2f0e4", scale: 1 },
    mushroom: { tint: "#c9503e", scale: 1 },
    pond: { tint: "#7ab5c4", scale: 1 },
  };

export const TINT_SWATCHES = [
  "#3f7145",
  "#4c8552",
  "#57904f",
  "#6fa470",
  "#9aa48f",
  "#8a7f66",
  "#f2f0e4",
  "#e8b54a",
  "#c9503e",
  "#d98fb0",
  "#7ab5c4",
  "#c9a0dc",
] as const;

export function createSceneData(
  objects: SceneObject[],
  environment: EnvironmentSettings,
  groundColor: string,
): SceneData {
  return { version: 1, environment, terrain: { groundColor }, objects };
}

/** Parses stored scene JSON defensively; returns null when unusable. */
export function parseSceneData(raw: unknown): SceneData | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<SceneData>;
  if (!Array.isArray(data.objects)) return null;
  return {
    version: 1,
    environment: {
      ...DEFAULT_ENVIRONMENT,
      ...data.environment,
      effects: {
        ...DEFAULT_ENVIRONMENT.effects,
        ...data.environment?.effects,
      },
    },
    terrain: { groundColor: data.terrain?.groundColor ?? DEFAULT_GROUND_COLOR },
    objects: data.objects.filter(
      (o): o is SceneObject =>
        Boolean(o) &&
        typeof o.id === "string" &&
        (ASSET_IDS as readonly string[]).includes(o.asset) &&
        Array.isArray(o.position) &&
        o.position.length === 3,
    ),
  };
}
