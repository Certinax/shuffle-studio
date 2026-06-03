import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getOptionalEnv } from "@/lib/env";

let serviceClient: SupabaseClient | null | undefined;

function getSupabaseProjectUrl() {
  return (
    getOptionalEnv("SUPABASE_URL") ?? getOptionalEnv("NEXT_PUBLIC_SUPABASE_URL")
  );
}

/** True when server-only Supabase credentials are configured. */
export function isShuffleStatsEnabled() {
  return Boolean(
    getSupabaseProjectUrl() && getOptionalEnv("SUPABASE_SERVICE_ROLE_KEY"),
  );
}

/**
 * Supabase client using the service role key. Server-only — never import from
 * client components or expose via NEXT_PUBLIC_*.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (serviceClient !== undefined) {
    return serviceClient;
  }

  const url = getSupabaseProjectUrl();
  const serviceRoleKey = getOptionalEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    serviceClient = null;
    return serviceClient;
  }

  serviceClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serviceClient;
}
