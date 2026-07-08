import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "@/i18n/navigation";

export default function HomePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("home");

  return (
    <section className="flex flex-1 flex-col items-center justify-center px-4 pt-28 pb-16 text-center">
      <h1 className="font-display max-w-3xl text-5xl font-bold tracking-tight text-fir sm:text-7xl">
        {t("heroTitle")}
      </h1>
      <p className="mt-6 max-w-xl text-lg text-fir-soft">{t("heroSubtitle")}</p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/create"
          className="seed-pill bg-moss px-6 py-3 font-semibold text-mist transition-transform hover:scale-105"
        >
          {t("ctaCreate")}
        </Link>
        <Link
          href="/gallery"
          className="seed-pill glass-leaf-flip glass-leaf px-6 py-3 font-semibold text-fir transition-transform hover:scale-105"
        >
          {t("ctaGallery")}
        </Link>
      </div>
    </section>
  );
}
