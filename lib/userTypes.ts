// The three scenario types a profile can hold (1 to 3 of them).
// DB values are nature | photo | art; palette themes map via USER_TYPE_THEMES in lib/scene.ts.

export type UserType = "nature" | "photo" | "art";

export const USER_TYPES: {
  id: UserType;
  icon: string;
  labelKey: "typeNature" | "typePhoto" | "typeArt";
}[] = [
  { id: "nature", icon: "🌿", labelKey: "typeNature" },
  { id: "photo", icon: "📷", labelKey: "typePhoto" },
  { id: "art", icon: "🎨", labelKey: "typeArt" },
];

/** Maps a user type to its hero chapter (see stores/heroStore.ts). */
export const USER_TYPE_CHAPTER: Record<UserType, number> = {
  nature: 0,
  photo: 1,
  art: 2,
};

const VALID_TYPES = new Set<string>(USER_TYPES.map((t) => t.id));

/** Coerces a DB value into a clean list of 1..3 unique types in canonical order. */
export function sanitizeUserTypes(raw: unknown): UserType[] {
  if (!Array.isArray(raw)) return ["nature"];
  const picked = new Set(raw.filter((v): v is UserType => VALID_TYPES.has(v)));
  if (picked.size === 0) return ["nature"];
  return USER_TYPES.filter((t) => picked.has(t.id)).map((t) => t.id);
}
