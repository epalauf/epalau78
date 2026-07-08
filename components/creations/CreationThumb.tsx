/* eslint-disable @next/next/no-img-element */

/** Card image for a creation; falls back to a generated gradient. */
export default function CreationThumb({
  thumbnailUrl,
  title,
  seed,
}: Readonly<{ thumbnailUrl: string | null; title: string; seed: string }>) {
  if (thumbnailUrl) {
    return (
      <img
        src={thumbnailUrl}
        alt={title}
        className="h-40 w-full rounded-t-[1.25rem] object-cover"
        loading="lazy"
      />
    );
  }
  // Stable hue from the id so each card gets its own shade of nature
  const hue = 70 + (Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0) % 120);
  return (
    <div
      aria-hidden
      className="h-40 w-full rounded-t-[1.25rem]"
      style={{
        background: `linear-gradient(160deg, hsl(${hue} 45% 78%), hsl(${hue + 30} 40% 55%))`,
      }}
    />
  );
}
