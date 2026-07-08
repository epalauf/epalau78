/** Downscales the live WebGL canvas into a small JPEG blob for card thumbnails. */
export async function captureCanvasThumbnail(): Promise<Blob | null> {
  const source = document.querySelector("canvas");
  if (!source) return null;

  const target = document.createElement("canvas");
  const w = 480;
  const h = Math.round((source.height / source.width) * w) || 300;
  target.width = w;
  target.height = h;
  const ctx = target.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, w, h);

  return new Promise((resolve) =>
    target.toBlob((blob) => resolve(blob), "image/jpeg", 0.75),
  );
}
