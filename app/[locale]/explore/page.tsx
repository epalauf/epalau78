import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import CreationThumb from "@/components/creations/CreationThumb";

type ExploreRow = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  updated_at: string;
  profiles: { username: string } | null;
};

export default async function ExplorePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("explore");

  let rows: ExploreRow[] = [];
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("creations")
      .select("id, title, thumbnail_url, updated_at, profiles ( username )")
      .eq("is_public", true)
      .order("updated_at", { ascending: false })
      .limit(60);
    // Without generated DB types, supabase-js types to-one joins as arrays
    rows = ((data as unknown as ExploreRow[] | null) ?? []).map((row) => ({
      ...row,
      profiles: Array.isArray(row.profiles)
        ? ((row.profiles[0] as ExploreRow["profiles"]) ?? null)
        : row.profiles,
    }));
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 pt-28 pb-16">
      <h1 className="font-display text-4xl font-bold text-fir">
        {t("title")}
      </h1>
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
            <Link
              key={row.id}
              href={`/space/${row.id}`}
              className="glass-leaf block overflow-hidden transition-transform hover:-translate-y-1"
            >
              <CreationThumb
                thumbnailUrl={row.thumbnail_url}
                title={row.title}
                seed={row.id}
              />
              <div className="px-5 py-4">
                <h2 className="font-display text-lg font-bold text-fir">
                  {row.title}
                </h2>
                {row.profiles && (
                  <p className="text-sm text-fir-soft">
                    {row.profiles.username}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
