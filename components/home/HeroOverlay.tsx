"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useHeroStore } from "@/stores/heroStore";

const CHAPTER_META = [
  { icon: "🌿", key: "chapterNature" },
  { icon: "📷", key: "chapterPhoto" },
  { icon: "🎨", key: "chapterArt" },
] as const;

export default function HeroOverlay() {
  const t = useTranslations("home");
  const chapter = useHeroStore((s) => s.chapter);
  const setChapter = useHeroStore((s) => s.setChapter);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
        className="pointer-events-auto mb-5 flex flex-wrap items-center justify-center gap-2"
      >
        {CHAPTER_META.map(({ icon, key }, i) => (
          <button
            key={key}
            onClick={() => setChapter(i)}
            aria-pressed={chapter === i}
            className={`seed-pill px-4 py-1.5 text-sm font-medium transition-all ${
              chapter === i
                ? "bg-moss text-mist shadow-md"
                : "glass-leaf text-fir-soft hover:-translate-y-0.5"
            }`}
          >
            <span aria-hidden className="mr-1.5">{icon}</span>
            {t(key)}
          </button>
        ))}
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
        className="font-display max-w-3xl text-5xl font-bold tracking-tight text-fir drop-shadow-[0_2px_12px_rgba(236,243,231,0.9)] sm:text-7xl"
      >
        {t("heroTitle")}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.45 }}
        className="mt-6 max-w-xl text-lg font-medium text-fir-soft drop-shadow-[0_1px_8px_rgba(236,243,231,0.9)]"
      >
        {t("heroSubtitle")}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.7 }}
        className="pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <Link
          href="/create"
          className="seed-pill bg-moss px-6 py-3 font-semibold text-mist shadow-lg transition-transform hover:scale-105"
        >
          {t("ctaCreate")}
        </Link>
        <Link
          href="/gallery"
          className="seed-pill glass-leaf glass-leaf-flip px-6 py-3 font-semibold text-fir transition-transform hover:scale-105"
        >
          {t("ctaGallery")}
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 flex flex-col items-center gap-1 text-sm text-fir-soft"
      >
        <span>{t("scrollHint")}</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          aria-hidden
        >
          ↓
        </motion.span>
      </motion.div>
    </div>
  );
}
