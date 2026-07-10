"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import { useUser } from "@/lib/supabase/useUser";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { USER_TYPES, type UserType } from "@/lib/userTypes";

type ProfileFormProps = {
  initialUsername: string;
  initialTypes: UserType[];
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const inputClass =
  "seed-pill w-full border border-mist-deep bg-white/70 px-4 py-2.5 text-fir outline-none transition focus:border-moss focus:bg-white";

export default function ProfileForm({
  initialUsername,
  initialTypes,
}: Readonly<ProfileFormProps>) {
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const { user, supabase } = useUser();
  const [username, setUsername] = useState(initialUsername);
  const [types, setTypes] = useState<UserType[]>(initialTypes);
  const [savedTypes, setSavedTypes] = useState<UserType[]>(initialTypes);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [minHint, setMinHint] = useState(false);

  function toggleType(id: UserType) {
    setMinHint(false);
    setTypes((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) {
          setMinHint(true);
          return prev;
        }
        return prev.filter((typ) => typ !== id);
      }
      const picked = new Set([...prev, id]);
      // Canonical order so "first chosen type" stays deterministic
      return USER_TYPES.filter((typ) => picked.has(typ.id)).map(
        (typ) => typ.id,
      );
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !supabase || !isSupabaseConfigured) {
      setError(t("notConfigured"));
      setStatus("error");
      return;
    }
    if (types.length === 0) return;
    setStatus("saving");
    setError(null);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: username.trim(), user_types: types })
      .eq("id", user.id);
    if (updateError) {
      setError(
        updateError.code === "23505" ? t("usernameTaken") : t("saveError"),
      );
      setStatus("error");
      return;
    }
    setSavedTypes(types);
    setStatus("saved");
    router.refresh();
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-8 flex flex-col gap-6"
    >
      <div className="glass-leaf px-6 py-5">
        <h2 className="text-sm font-medium text-fir-soft">
          {t("badgesTitle")}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {USER_TYPES.filter(({ id }) => savedTypes.includes(id)).map(
            ({ id, icon, labelKey }) => (
              <span
                key={id}
                className="seed-pill border border-moss/40 bg-moss/10 px-4 py-1.5 text-sm font-medium text-fir"
              >
                <span aria-hidden className="mr-1.5">
                  {icon}
                </span>
                {tAuth(labelKey)}
              </span>
            ),
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-leaf flex flex-col gap-5 px-6 py-6 sm:px-8"
      >
        <label className="flex flex-col gap-1.5 text-sm font-medium text-fir-soft">
          {t("username")}
          <input
            type="text"
            required
            minLength={3}
            maxLength={24}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
            autoComplete="username"
          />
        </label>

        <fieldset className="flex flex-col gap-1.5 text-sm font-medium text-fir-soft">
          <legend className="mb-1.5">{t("typesLabel")}</legend>
          <div className="grid grid-cols-3 gap-2">
            {USER_TYPES.map(({ id, icon, labelKey }) => {
              const selected = types.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleType(id)}
                  aria-pressed={selected}
                  className={`seed-pill flex flex-col items-center gap-1 border px-2 py-3 text-xs font-medium transition-colors ${
                    selected
                      ? "border-moss bg-moss/10 text-fir"
                      : "border-mist-deep text-fir-soft hover:bg-mist-deep"
                  }`}
                >
                  <span aria-hidden className="text-xl">
                    {icon}
                  </span>
                  {tAuth(labelKey)}
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-xs font-normal text-fir-soft">
            {minHint ? t("minOneType") : t("typesHint")}
          </p>
        </fieldset>

        {error && (
          <p className="text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}
        {status === "saved" && (
          <p className="text-sm font-medium text-moss" role="status">
            {t("saved")}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "saving" || types.length === 0}
          className="seed-pill self-start bg-moss px-6 py-3 font-semibold text-mist transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {status === "saving" ? t("saving") : t("save")}
        </button>
      </form>
    </motion.div>
  );
}
