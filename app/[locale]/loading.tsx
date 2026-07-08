import { useTranslations } from "next-intl";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center pt-28 pb-16">
      <LoadingLeaf />
    </div>
  );
}

function LoadingLeaf() {
  const t = useTranslations("common");
  return (
    <div className="glass-leaf flex items-center gap-3 px-8 py-5">
      <span className="animate-bounce text-2xl" aria-hidden>
        🌱
      </span>
      <span className="font-display text-lg font-bold text-fir">
        {t("loading")}
      </span>
    </div>
  );
}
