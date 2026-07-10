import {
  DOORWAY_OPENING,
  GROUND_RADIUS,
  WALL_THICKNESS,
  WALL_WIDTH,
  type SceneObject,
} from "@/lib/scene";

/** An oriented box footprint on the ground plane (XZ). */
type Obstacle = {
  x: number;
  z: number;
  rotationY: number;
  halfW: number;
  halfD: number;
};

const DOORWAY_PANEL_HALF = (WALL_WIDTH - DOORWAY_OPENING) / 4;
const DOORWAY_PANEL_CENTER = DOORWAY_OPENING / 2 + DOORWAY_PANEL_HALF;

/** Walkable-world obstacles: walls block fully, doorways only at their side panels. */
export function buildObstacles(objects: SceneObject[]): Obstacle[] {
  const obstacles: Obstacle[] = [];
  for (const o of objects) {
    const [x, , z] = o.position;
    const halfD = (WALL_THICKNESS / 2) * o.scale;
    if (o.asset === "wall") {
      obstacles.push({
        x,
        z,
        rotationY: o.rotationY,
        halfW: (WALL_WIDTH / 2) * o.scale,
        halfD,
      });
    } else if (o.asset === "doorway") {
      const cos = Math.cos(o.rotationY);
      const sin = Math.sin(o.rotationY);
      for (const side of [-1, 1]) {
        const local = side * DOORWAY_PANEL_CENTER * o.scale;
        obstacles.push({
          // Local +X rotated by rotationY into world space
          x: x + local * cos,
          z: z - local * sin,
          rotationY: o.rotationY,
          halfW: DOORWAY_PANEL_HALF * o.scale,
          halfD,
        });
      }
    }
  }
  return obstacles;
}

/** Pushes a walker circle at (x, z) out of every obstacle; returns the resolved spot. */
export function resolveCollisions(
  x: number,
  z: number,
  obstacles: Obstacle[],
  radius: number,
): [number, number] {
  for (const box of obstacles) {
    const dx = x - box.x;
    const dz = z - box.z;
    const cos = Math.cos(box.rotationY);
    const sin = Math.sin(box.rotationY);
    // World delta into the box's local space (inverse Y rotation)
    let lx = dx * cos - dz * sin;
    let lz = dx * sin + dz * cos;

    const nx = Math.max(-box.halfW, Math.min(box.halfW, lx));
    const nz = Math.max(-box.halfD, Math.min(box.halfD, lz));
    const gapX = lx - nx;
    const gapZ = lz - nz;
    const distSq = gapX * gapX + gapZ * gapZ;
    if (distSq >= radius * radius) continue;

    if (distSq > 1e-8) {
      const dist = Math.sqrt(distSq);
      const push = (radius - dist) / dist;
      lx += gapX * push;
      lz += gapZ * push;
    } else {
      // Center is inside the box — exit through the nearest face
      const exitX = box.halfW + radius - Math.abs(lx);
      const exitZ = box.halfD + radius - Math.abs(lz);
      if (exitX < exitZ) lx += Math.sign(lx || 1) * exitX;
      else lz += Math.sign(lz || 1) * exitZ;
    }

    // Back to world space
    x = box.x + lx * cos + lz * sin;
    z = box.z - lx * sin + lz * cos;
  }

  // Stay on the ground disc
  const dist = Math.hypot(x, z);
  const max = GROUND_RADIUS - 0.6;
  if (dist > max) {
    x = (x / dist) * max;
    z = (z / dist) * max;
  }
  return [x, z];
}

/** Where the picture of an artwork object sits in world space. */
export function artworkCenter(o: SceneObject): [number, number, number] {
  const height = o.asset === "easel" ? 1.35 : 1.55;
  return [o.position[0], o.position[1] + height * o.scale, o.position[2]];
}

/** A camera pose facing an artwork straight on. */
export function artworkViewpoint(o: SceneObject): {
  position: [number, number, number];
  look: [number, number, number];
} {
  const look = artworkCenter(o);
  const distance = (o.asset === "easel" ? 1.9 : 2.3) * o.scale;
  // The picture plane faces local +Z, rotated by rotationY
  const nx = Math.sin(o.rotationY);
  const nz = Math.cos(o.rotationY);
  return {
    position: [look[0] + nx * distance, look[1], look[2] + nz * distance],
    look,
  };
}
