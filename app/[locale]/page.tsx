import { setRequestLocale } from "next-intl/server";
import HeroScene from "@/components/home/HeroScene";
import HeroOverlay from "@/components/home/HeroOverlay";
import HeroPersonalizer from "@/components/home/HeroPersonalizer";
import LandingSections from "@/components/home/LandingSections";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { parseSceneData, type SceneData } from "@/lib/scene";
import { sanitizeUserTypes, USER_TYPE_CHAPTER } from "@/lib/userTypes";

export default async function HomePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Signed-in visitors see their featured space in the hero if they set one,
  // otherwise the hero opens on their own scenario chapters.
  let chapters: number[] = [];
  let heroScene: SceneData | null = null;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("user_types, hero_creation_id")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        chapters = sanitizeUserTypes(data.user_types).map(
          (typ) => USER_TYPE_CHAPTER[typ],
        );
        if (typeof data.hero_creation_id === "string") {
          const { data: creation } = await supabase
            .from("creations")
            .select("scene_data")
            .eq("id", data.hero_creation_id)
            .maybeSingle();
          heroScene = creation ? parseSceneData(creation.scene_data) : null;
        }
      }
    }
  }

  return (
    <>
      <section className="relative h-screen w-full overflow-hidden">
        <HeroScene scene={heroScene} />
        <HeroOverlay showChapters={!heroScene} />
        {!heroScene && chapters.length > 0 && (
          <HeroPersonalizer chapters={chapters} />
        )}
      </section>
      <LandingSections />
    </>
  );
}
