"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const sections = [
  { titleKey: "sectionGalleryTitle", bodyKey: "sectionGalleryBody", href: "/gallery" },
  { titleKey: "sectionCreateTitle", bodyKey: "sectionCreateBody", href: "/create" },
  { titleKey: "sectionShareTitle", bodyKey: "sectionShareBody", href: "/register" },
] as const;

const audiences = [
  { icon: "🌿", titleKey: "audienceNatureTitle", bodyKey: "audienceNatureBody", href: "/create" },
  { icon: "🎨", titleKey: "audienceArtTitle", bodyKey: "audienceArtBody", href: "/gallery" },
  { icon: "📷", titleKey: "audiencePhotoTitle", bodyKey: "audiencePhotoBody", href: "/gallery" },
] as const;

export default function LandingSections() {
  const t = useTranslations("home");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-20 sm:gap-14">
      {sections.map(({ titleKey, bodyKey, href }, i) => (
        <motion.div
          key={titleKey}
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={`w-full sm:w-4/5 ${i % 2 === 1 ? "sm:self-end" : "sm:self-start"}`}
        >
          <Link
            href={href}
            className={`glass-leaf ${i % 2 === 1 ? "glass-leaf-flip" : ""} block px-8 py-8 transition-transform hover:-translate-y-1 sm:px-10`}
          >
            <h2 className="font-display text-2xl font-bold text-fir sm:text-3xl">
              {t(titleKey)}
            </h2>
            <p className="mt-3 text-fir-soft">{t(bodyKey)}</p>
          </Link>
        </motion.div>
      ))}

      <section className="mt-6">
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center font-display text-2xl font-bold text-fir sm:text-3xl"
        >
          {t("audiencesTitle")}
        </motion.h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {audiences.map(({ icon, titleKey, bodyKey, href }, i) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.12 }}
            >
              <Link
                href={href}
                className={`glass-leaf ${i % 2 === 1 ? "glass-leaf-flip" : ""} block h-full px-6 py-7 transition-transform hover:-translate-y-1`}
              >
                <span aria-hidden className="text-3xl">
                  {icon}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold text-fir">
                  {t(titleKey)}
                </h3>
                <p className="mt-2 text-sm text-fir-soft">{t(bodyKey)}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
