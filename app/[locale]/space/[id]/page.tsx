import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { parseSceneData } from "@/lib/scene";
import SpaceViewer from "@/components/viewer/SpaceViewer";

export default async function SpacePage({
  params,
}: Readonly<{ params: Promise<{ id: string; locale: string }> }>) {
  const { id } = await params;
  if (!isSupabaseConfigured) notFound();

  const supabase = await createClient();
  const { data: creation } = await supabase
    .from("creations")
    .select("id, title, scene_data, profiles ( username )")
    .eq("id", id)
    .maybeSingle();

  if (!creation) notFound();

  const scene = parseSceneData(creation.scene_data);
  if (!scene) notFound();

  // Without generated DB types, supabase-js types to-one joins as arrays
  const profileRaw = creation.profiles as unknown;
  const profile = (
    Array.isArray(profileRaw) ? (profileRaw[0] ?? null) : profileRaw
  ) as { username: string } | null;

  return (
    <SpaceViewer
      scene={scene}
      title={creation.title}
      author={profile?.username}
    />
  );
}
