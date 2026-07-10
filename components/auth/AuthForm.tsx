"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type AuthFormProps = {
  mode: "login" | "register";
};

type UserType = "nature" | "photo" | "art";

const USER_TYPES: { id: UserType; icon: string; key: string }[] = [
  { id: "nature", icon: "🌿", key: "typeNature" },
  { id: "photo", icon: "📷", key: "typePhoto" },
  { id: "art", icon: "🎨", key: "typeArt" },
];

export default function AuthForm({ mode }: Readonly<AuthFormProps>) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState<UserType>("nature");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError(t("notConfigured"));
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, user_type: userType } },
      });
      setBusy(false);
      if (error) {
        setError(error.message);
      } else if (data.session) {
        router.push("/create");
        router.refresh();
      } else {
        setNotice(t("checkEmail"));
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setBusy(false);
      if (error) {
        setError(error.message);
      } else {
        router.push("/create");
        router.refresh();
      }
    }
  }

  const inputClass =
    "seed-pill w-full border border-mist-deep bg-white/70 px-4 py-2.5 text-fir outline-none transition focus:border-moss focus:bg-white";

  return (
    <div className="flex flex-1 items-center justify-center px-4 pt-28 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-leaf w-full max-w-md px-8 py-10 sm:px-10"
      >
        <h1 className="font-display text-3xl font-bold text-fir">
          {t(mode === "login" ? "signInTitle" : "signUpTitle")}
        </h1>
        <p className="mt-2 text-sm text-fir-soft">
          {t(mode === "login" ? "signInSubtitle" : "signUpSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          {mode === "register" && (
            <fieldset className="flex flex-col gap-1.5 text-sm font-medium text-fir-soft">
              <legend className="mb-1.5">{t("typeQuestion")}</legend>
              <div className="grid grid-cols-3 gap-2">
                {USER_TYPES.map(({ id, icon, key }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setUserType(id)}
                    aria-pressed={userType === id}
                    className={`seed-pill flex flex-col items-center gap-1 border px-2 py-3 text-xs font-medium transition-colors ${
                      userType === id
                        ? "border-moss bg-moss/10 text-fir"
                        : "border-mist-deep text-fir-soft hover:bg-mist-deep"
                    }`}
                  >
                    <span aria-hidden className="text-xl">
                      {icon}
                    </span>
                    {t(key)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {mode === "register" && (
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
          )}
          <label className="flex flex-col gap-1.5 text-sm font-medium text-fir-soft">
            {t("email")}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="email"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-fir-soft">
            {t("password")}
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
            />
          </label>

          {error && (
            <p className="text-sm font-medium text-red-700" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="text-sm font-medium text-moss" role="status">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="seed-pill mt-2 bg-moss px-6 py-3 font-semibold text-mist transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {busy
              ? t("working")
              : t(mode === "login" ? "signInAction" : "signUpAction")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-fir-soft">
          {mode === "login" ? (
            <>
              {t("noAccount")}{" "}
              <Link href="/register" className="font-semibold text-moss underline">
                {t("signUpAction")}
              </Link>
            </>
          ) : (
            <>
              {t("haveAccount")}{" "}
              <Link href="/login" className="font-semibold text-moss underline">
                {t("signInAction")}
              </Link>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}
