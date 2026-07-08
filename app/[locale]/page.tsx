import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import HeroScene from "@/components/home/HeroScene";
import HeroOverlay from "@/components/home/HeroOverlay";
import LandingSections from "@/components/home/LandingSections";

export default function HomePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <>
      <section className="relative h-screen w-full overflow-hidden">
        <HeroScene />
        <HeroOverlay />
      </section>
      <LandingSections />
    </>
  );
}
