import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sanitizeUserTypes } from "@/lib/userTypes";
import ProfileForm, {
  type HeroSpaceOption,
} from "@/components/profile/ProfileForm";

export default async function ProfilePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profile");

  if (!isSupabaseConfigured) {
    redirect({ href: "/", locale });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  const [{ data }, { data: spacesData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, user_types, hero_creation_id")
      .eq("id", user!.id)
      .maybeSingle(),
    supabase
      .from("creations")
      .select("id, title, thumbnail_url")
      .eq("user_id", user!.id)
      .order("updated_at", { ascending: false }),
  ]);

  const spaces = (spacesData as HeroSpaceOption[] | null) ?? [];
  const heroSpaceId =
    typeof data?.hero_creation_id === "string" &&
    spaces.some((space) => space.id === data.hero_creation_id)
      ? data.hero_creation_id
      : null;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 pt-28 pb-16">
      <h1 className="font-display text-4xl font-bold text-fir">{t("title")}</h1>
      <p className="mt-2 text-fir-soft">{t("subtitle")}</p>

      <ProfileForm
        initialUsername={data?.username ?? ""}
        initialTypes={sanitizeUserTypes(data?.user_types)}
        initialHeroSpaceId={heroSpaceId}
        spaces={spaces}
      />
    </div>
  );
}
