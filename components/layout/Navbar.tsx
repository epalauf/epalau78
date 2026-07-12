"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useUser } from "@/lib/supabase/useUser";
import LanguageSwitcher from "./LanguageSwitcher";

const links = [
  { href: "/gallery", key: "gallery" },
  { href: "/create", key: "create" },
  { href: "/explore", key: "explore" },
] as const;

export default function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const { user, supabase } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  // Close the mobile menu when any item is chosen
  const closeMenu = () => setMenuOpen(false);

  async function handleSignOut() {
    closeMenu();
    await supabase?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function linkClass(href: string) {
    return `seed-pill px-3 py-1.5 text-sm font-medium transition-colors ${
      pathname.startsWith(href)
        ? "bg-moss text-mist"
        : "text-fir-soft hover:bg-mist-deep"
    }`;
  }

  const navItems = (
    <>
      {links.map(({ href, key }) => (
        <Link key={key} href={href} onClick={closeMenu} className={linkClass(href)}>
          {t(key)}
        </Link>
      ))}

      {user ? (
        <>
          <Link href="/profile" onClick={closeMenu} className={linkClass("/profile")}>
            {t("profile")}
          </Link>
          <Link href="/my-spaces" onClick={closeMenu} className={linkClass("/my-spaces")}>
            {t("mySpaces")}
          </Link>
          <button
            onClick={handleSignOut}
            className="seed-pill px-3 py-1.5 text-left text-sm font-medium text-fir-soft transition-colors hover:bg-mist-deep"
          >
            {t("signOut")}
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            onClick={closeMenu}
            className="seed-pill px-3 py-1.5 text-sm font-medium text-fir-soft transition-colors hover:bg-mist-deep"
          >
            {t("signIn")}
          </Link>
          <Link
            href="/register"
            onClick={closeMenu}
            className="seed-pill bg-pollen px-3.5 py-1.5 text-sm font-semibold text-fir transition-transform hover:scale-105"
          >
            {t("signUp")}
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="fixed top-4 inset-x-0 z-50 px-4">
      <nav className="glass-leaf relative mx-auto flex max-w-5xl items-center gap-2 px-5 py-2.5">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-fir"
        >
          Natura<span className="text-moss">78</span>
        </Link>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 md:flex md:gap-2">
            {navItems}
          </div>

          <LanguageSwitcher />

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t("menu")}
            aria-expanded={menuOpen}
            className="seed-pill px-3 py-1.5 text-sm font-medium text-fir-soft transition-colors hover:bg-mist-deep md:hidden"
          >
            ☰
          </button>
        </div>

        {menuOpen && (
          <div className="glass-leaf absolute inset-x-0 top-full mt-2 flex flex-col gap-1 p-3 md:hidden">
            {navItems}
          </div>
        )}
      </nav>
    </header>
  );
}
