import { mulberry32 } from "@/lib/random";

const PALETTES = [
  ["#f6e7c1", "#e8b54a", "#c97b4a"], // golden hour
  ["#dcebd2", "#8ec07a", "#3f7145"], // meadow greens
  ["#cfe6ec", "#7ab5c4", "#3a6b7a"], // pond blues
  ["#e9d8ec", "#c9a0dc", "#7a5c8a"], // dusk lilac
  ["#fdf2e3", "#f0b78a", "#b96a4b"], // sunset peach
  ["#e3ecf5", "#9db8d2", "#4a6785"], // mountain haze
];

/**
 * Paints a soft nature-toned placeholder (gradient sky, sun, treeline)
 * and returns it as a data URL usable as a texture.
 */
// 1x1 sage-green pixel used while server-rendering; real art is painted client-side
const SSR_FALLBACK =
  "data:image/gif;base64,R0lGODlhAQABAPAAAOzz5wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";

export function makePlaceholderDataUrl(seed: number): string {
  if (typeof document === "undefined") return SSR_FALLBACK;
  const rand = mulberry32(seed);
  const palette = PALETTES[Math.floor(rand() * PALETTES.length)];
  const w = 512;
  const h = 384;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, palette[0]);
  sky.addColorStop(0.65, palette[1]);
  sky.addColorStop(1, palette[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Sun / moon disc
  ctx.beginPath();
  ctx.arc(w * (0.25 + rand() * 0.5), h * (0.2 + rand() * 0.25), 24 + rand() * 26, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 250, 235, 0.9)";
  ctx.fill();

  // Layered treeline silhouettes
  for (let layer = 0; layer < 3; layer++) {
    const baseY = h * (0.62 + layer * 0.12);
    ctx.fillStyle = `rgba(28, 46, 31, ${0.25 + layer * 0.25})`;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, baseY);
    let x = 0;
    while (x < w) {
      const tw = 24 + rand() * 40;
      const th = 20 + rand() * 55;
      ctx.lineTo(x + tw / 2, baseY - th);
      ctx.lineTo(x + tw, baseY);
      x += tw;
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  return canvas.toDataURL("image/jpeg", 0.85);
}
