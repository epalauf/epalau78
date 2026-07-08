"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

const links = [
  { href: "/gallery", key: "gallery" },
  { href: "/create", key: "create" },
  { href: "/explore", key: "explore" },
] as const;

export default function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <header className="fixed top-4 inset-x-0 z-50 px-4">
      <nav className="glass-leaf mx-auto flex max-w-5xl items-center gap-2 px-5 py-2.5">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-fir"
        >
          Natura<span className="text-moss">.</span>
        </Link>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {links.map(({ href, key }) => (
            <Link
              key={key}
              href={href}
              className={`seed-pill px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? "bg-moss text-mist"
                  : "text-fir-soft hover:bg-mist-deep"
              }`}
            >
              {t(key)}
            </Link>
          ))}

          <LanguageSwitcher />

          <Link
            href="/login"
            className="seed-pill hidden px-3 py-1.5 text-sm font-medium text-fir-soft transition-colors hover:bg-mist-deep sm:block"
          >
            {t("signIn")}
          </Link>
          <Link
            href="/register"
            className="seed-pill bg-pollen px-3.5 py-1.5 text-sm font-semibold text-fir transition-transform hover:scale-105"
          >
            {t("signUp")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
