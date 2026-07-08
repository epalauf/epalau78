"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const sections = [
  { titleKey: "sectionGalleryTitle", bodyKey: "sectionGalleryBody", href: "/gallery" },
  { titleKey: "sectionCreateTitle", bodyKey: "sectionCreateBody", href: "/create" },
  { titleKey: "sectionShareTitle", bodyKey: "sectionShareBody", href: "/register" },
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
    </div>
  );
}
