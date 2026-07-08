import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-auto px-4 py-8 text-center text-sm text-fir-soft">
      <p className="font-display text-base">
        Natura<span className="text-moss">.</span> — {t("tagline")}
      </p>
      <p className="mt-1 opacity-70">{t("credits")}</p>
    </footer>
  );
}
