"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="seed-pill flex overflow-hidden border border-mist-deep bg-white/40 text-xs font-semibold">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => router.replace(pathname, { locale: l })}
          className={`px-2 py-1.5 uppercase transition-colors ${
            l === locale
              ? "bg-fir text-mist"
              : "text-fir-soft hover:bg-mist-deep"
          }`}
          aria-current={l === locale ? "true" : undefined}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
