import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { supabaseUrl, supabaseKey, isSupabaseConfigured } from "./config";

/**
 * Refreshes the Supabase auth session on every request, copying refreshed
 * cookies onto the response produced by the i18n middleware.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse,
) {
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Trigger a token refresh if the session is stale
  await supabase.auth.getUser();

  return response;
}
