export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** True once the Supabase env vars are set; auth features degrade gracefully until then. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
