import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sanitizeUserTypes } from "@/lib/userTypes";
import ProfileForm from "@/components/profile/ProfileForm";

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

  const { data } = await supabase
    .from("profiles")
    .select("username, user_types")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 pt-28 pb-16">
      <h1 className="font-display text-4xl font-bold text-fir">{t("title")}</h1>
      <p className="mt-2 text-fir-soft">{t("subtitle")}</p>

      <ProfileForm
        initialUsername={data?.username ?? ""}
        initialTypes={sanitizeUserTypes(data?.user_types)}
      />
    </div>
  );
}
