import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PLACEHOLDER_IMAGES, type GalleryImageData } from "@/lib/gallery";
import GalleryExperience from "@/components/gallery/GalleryExperience";

export default async function GalleryPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  let images: GalleryImageData[] = [];

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("gallery_images")
      .select("id, title_en, title_es, storage_path")
      .order("sort_order");

    if (data && data.length > 0) {
      images = data.map((row) => ({
        id: row.id,
        url: supabase.storage.from("gallery").getPublicUrl(row.storage_path)
          .data.publicUrl,
        title: locale === "es" ? row.title_es || row.title_en : row.title_en,
      }));
    }
  }

  if (images.length === 0) {
    images = PLACEHOLDER_IMAGES.map((p) => ({ ...p, url: null }));
  }

  return <GalleryExperience images={images} />;
}
