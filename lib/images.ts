import { supabaseUrl } from "@/lib/supabase/config";

export const USER_IMAGES_BUCKET = "user-images";

/** Public URL for a stored user image path (`{userId}/{file}`). */
export function userImagePublicUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${USER_IMAGES_BUCKET}/${path}`;
}

const MAX_DIMENSION = 1600;
const QUALITY = 0.85;

/**
 * Resizes an image in the browser (max 1600px, WebP) before upload,
 * so a phone photo of several MB lands as a couple hundred KB.
 */
export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALITY),
  );
  if (!blob) throw new Error("Could not encode image");
  return blob;
}
