import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import MySpaceCard, {
  type MySpaceRow,
} from "@/components/creations/MySpaceCard";

export default async function MySpacesPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("mySpaces");

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
    .from("creations")
    .select("id, title, thumbnail_url, is_public, updated_at")
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false });

  const rows = (data as MySpaceRow[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 pt-28 pb-16">
      <h1 className="font-display text-4xl font-bold text-fir">{t("title")}</h1>
      <p className="mt-2 text-fir-soft">{t("subtitle")}</p>

      {rows.length === 0 ? (
        <div className="glass-leaf mt-10 px-8 py-12 text-center">
          <p className="font-display text-xl text-fir">{t("emptyTitle")}</p>
          <p className="mt-2 text-fir-soft">{t("emptyBody")}</p>
          <Link
            href="/create"
            className="seed-pill mt-6 inline-block bg-moss px-6 py-3 font-semibold text-mist transition-transform hover:scale-105"
          >
            {t("emptyCta")}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <MySpaceCard key={row.id} creation={row} />
          ))}
        </div>
      )}
    </div>
  );
}
