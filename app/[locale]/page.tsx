import { setRequestLocale } from "next-intl/server";
import HeroScene from "@/components/home/HeroScene";
import HeroOverlay from "@/components/home/HeroOverlay";
import HeroPersonalizer from "@/components/home/HeroPersonalizer";
import LandingSections from "@/components/home/LandingSections";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sanitizeUserTypes, USER_TYPE_CHAPTER } from "@/lib/userTypes";

export default async function HomePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Signed-in visitors see the hero open on their own scenario chapters
  let chapters: number[] = [];
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("user_types")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        chapters = sanitizeUserTypes(data.user_types).map(
          (typ) => USER_TYPE_CHAPTER[typ],
        );
      }
    }
  }

  return (
    <>
      <section className="relative h-screen w-full overflow-hidden">
        <HeroScene />
        <HeroOverlay />
        {chapters.length > 0 && <HeroPersonalizer chapters={chapters} />}
      </section>
      <LandingSections />
    </>
  );
}
