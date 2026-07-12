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
  "cloud",
  "island",
  "birds",
] as const;

export type AssetId = (typeof ASSET_IDS)[number];

export type AssetTheme = "nature" | "urban" | "art" | "sky";

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
  sky: ["cloud", "island", "birds"],
};

/** Assets whose geometry richness can be tuned with the detail slider. */
export const DETAIL_ASSETS: ReadonlySet<AssetId> = new Set([
  "pine",
  "broadleaf",
  "bush",
  "rock",
  "flower",
  "mushroom",
]);

/** Assets that hover above the ground instead of sitting on it. */
export const FLOATING_ASSETS: ReadonlySet<AssetId> = new Set([
  "cloud",
  "island",
  "birds",
]);

/** Spawn altitude for floating assets. */
export const FLOAT_DEFAULT_Y: Partial<Record<AssetId, number>> = {
  cloud: 7,
  island: 3.5,
  birds: 4.5,
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
  /** Geometry richness 0 rough → 1 smooth; unset keeps the classic look */
  detail?: number;
  /** Storage path of a user image shown by picture assets (frame, easel) */
  image?: string;
  /** Artwork title shown when a visitor focuses the piece */
  title?: string;
  /** Artwork story/description shown when a visitor focuses the piece */
  description?: string;
  /** True when a frame hangs flush on a wall (no floating, no ground shadow) */
  mounted?: boolean;
  /** Sideways offset of the picture along its own axis (frame asset) */
  offsetX?: number;
  /** Vertical offset of the picture from its default hang height (frame asset) */
  offsetY?: number;
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
    cloud: { tint: "#ffffff", scale: 1 },
    island: { tint: "#7cb56b", scale: 1 },
    birds: { tint: "#3a4252", scale: 1 },
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

export type WallSnap = {
  position: [number, number, number];
  rotationY: number;
};

// How close (in world units) a frame must be to a wall face to snap onto it
const SNAP_RANGE = 1.5;

/**
 * Finds the nearest wall (or doorway side panel) a frame at (x, z) can hang
 * on. Returns the flush position and facing rotation, or null when no wall
 * is in range.
 */
export function snapFrameToWall(
  x: number,
  z: number,
  frameScale: number,
  objects: SceneObject[],
  excludeId?: string,
): WallSnap | null {
  // Approximate half-width of the frame, to keep it inside the wall span
  const frameHalf = 0.85 * frameScale;
  let best: WallSnap | null = null;
  let bestGap = SNAP_RANGE;

  for (const o of objects) {
    if (o.id === excludeId) continue;
    if (o.asset !== "wall" && o.asset !== "doorway") continue;

    const cos = Math.cos(o.rotationY);
    const sin = Math.sin(o.rotationY);
    const dx = x - o.position[0];
    const dz = z - o.position[2];
    // World delta into the wall's local space (inverse Y rotation)
    let lx = dx * cos - dz * sin;
    const lz = dx * sin + dz * cos;

    const halfW = (WALL_WIDTH / 2) * o.scale;
    const halfD = (WALL_THICKNESS / 2) * o.scale;
    const gap = Math.abs(lz) - halfD;
    if (Math.abs(lx) > halfW || gap >= bestGap) continue;

    if (o.asset === "doorway") {
      // Only the side panels can hold a frame — push out of the opening.
      // When the frame is wider than a panel, center it on the panel.
      const inner = (DOORWAY_OPENING / 2) * o.scale + frameHalf;
      const outer = halfW - frameHalf;
      const side = Math.sign(lx || 1);
      if (inner > outer) {
        lx = side * (((DOORWAY_OPENING / 2) * o.scale + halfW) / 2);
      } else {
        lx = side * Math.min(Math.max(Math.abs(lx), inner), outer);
      }
    } else {
      const limit = halfW - frameHalf;
      if (limit <= 0) continue;
      lx = Math.min(Math.max(lx, -limit), limit);
    }

    // Flush against the face the frame approaches from
    const face = lz >= 0 ? 1 : -1;
    const flushZ = face * (halfD + 0.06 * frameScale);
    best = {
      position: [
        o.position[0] + lx * cos + flushZ * sin,
        0,
        o.position[2] - lx * sin + flushZ * cos,
      ],
      rotationY: face > 0 ? o.rotationY : o.rotationY + Math.PI,
    };
    bestGap = gap;
  }
  return best;
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
        position: [
          o.position[0],
          Math.max(0, Math.min(20, o.position[1] ?? 0)),
          o.position[2],
        ] as [number, number, number],
        detail:
          typeof o.detail === "number"
            ? Math.max(0, Math.min(1, o.detail))
            : undefined,
        image: typeof o.image === "string" ? o.image : undefined,
        rotationX: typeof o.rotationX === "number" ? o.rotationX : undefined,
        rotationZ: typeof o.rotationZ === "number" ? o.rotationZ : undefined,
        title: typeof o.title === "string" ? o.title.slice(0, 120) : undefined,
        description:
          typeof o.description === "string"
            ? o.description.slice(0, 600)
            : undefined,
        mounted: o.mounted === true ? true : undefined,
        offsetX:
          typeof o.offsetX === "number"
            ? Math.max(-3, Math.min(3, o.offsetX))
            : undefined,
        offsetY:
          typeof o.offsetY === "number"
            ? Math.max(-3, Math.min(3, o.offsetY))
            : undefined,
      })),
  };
}
