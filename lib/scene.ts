export const ASSET_IDS = [
  "pine",
  "broadleaf",
  "bush",
  "rock",
  "flower",
  "mushroom",
  "pond",
  "building",
  "streetlamp",
  "bench",
  "tripod",
  "frame",
  "pedestal",
  "easel",
  "wall",
  "doorway",
] as const;

export type AssetId = (typeof ASSET_IDS)[number];

export type AssetTheme = "nature" | "urban" | "art";

/** Palette grouping; an asset may appear in several themes. */
export const ASSET_THEMES: Record<AssetTheme, readonly AssetId[]> = {
  nature: ["pine", "broadleaf", "bush", "rock", "flower", "mushroom", "pond"],
  urban: [
    "building",
    "streetlamp",
    "bench",
    "tripod",
    "frame",
    "rock",
    "wall",
    "doorway",
  ],
  art: ["wall", "doorway", "frame", "pedestal", "easel", "bench", "flower"],
};

/** Maps a profile user_type to its home palette theme. */
export const USER_TYPE_THEMES: Record<string, AssetTheme> = {
  nature: "nature",
  photo: "urban",
  art: "art",
};

export type SceneObject = {
  id: string;
  asset: AssetId;
  position: [number, number, number];
  rotationY: number;
  /** Tilt forward/back — currently used by picture assets */
  rotationX?: number;
  /** Tilt sideways — currently used by picture assets */
  rotationZ?: number;
  scale: number;
  tint: string;
  /** Storage path of a user image shown by picture assets (frame, easel) */
  image?: string;
  /** Artwork title shown when a visitor focuses the piece */
  title?: string;
  /** Artwork story/description shown when a visitor focuses the piece */
  description?: string;
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

// Wall geometry shared by the meshes and the walk-mode collision
export const WALL_WIDTH = 4;
export const WALL_HEIGHT = 3;
export const WALL_THICKNESS = 0.3;
export const DOORWAY_OPENING = 1.6;

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
    building: { tint: "#3a4252", scale: 1 },
    streetlamp: { tint: "#33302c", scale: 1 },
    bench: { tint: "#c9b48f", scale: 1 },
    tripod: { tint: "#33302c", scale: 1 },
    frame: { tint: "#f6f3ea", scale: 1 },
    pedestal: { tint: "#c9503e", scale: 1 },
    easel: { tint: "#8a6f4d", scale: 1 },
    wall: { tint: "#ece7db", scale: 1 },
    doorway: { tint: "#ece7db", scale: 1 },
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
    objects: data.objects
      .filter(
        (o): o is SceneObject =>
          Boolean(o) &&
          typeof o.id === "string" &&
          (ASSET_IDS as readonly string[]).includes(o.asset) &&
          Array.isArray(o.position) &&
          o.position.length === 3,
      )
      .map((o) => ({
        ...o,
        image: typeof o.image === "string" ? o.image : undefined,
        rotationX: typeof o.rotationX === "number" ? o.rotationX : undefined,
        rotationZ: typeof o.rotationZ === "number" ? o.rotationZ : undefined,
        title: typeof o.title === "string" ? o.title.slice(0, 120) : undefined,
        description:
          typeof o.description === "string"
            ? o.description.slice(0, 600)
            : undefined,
      })),
  };
}
