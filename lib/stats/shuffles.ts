import "server-only";

import { getSupabaseAdmin, isShuffleStatsEnabled } from "@/lib/supabase/admin";
import type { ShuffleStatsResponse, ShuffleStatsSnapshot } from "@/lib/stats/types";

export type { ShuffleStatsResponse, ShuffleStatsSnapshot } from "@/lib/stats/types";

export async function recordShuffleEvent(input: {
  spotifyUserId: string;
  sourcePlaylistId: string;
  sourcePlaylistName: string;
  trackCount: number;
}): Promise<ShuffleStatsSnapshot | null> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return null;
  }

  const { error } = await supabase.from("shuffle_events").insert({
    spotify_user_id: input.spotifyUserId,
    source_playlist_id: input.sourcePlaylistId,
    source_playlist_name: input.sourcePlaylistName,
    track_count: input.trackCount,
  });

  if (error) {
    console.error("Failed to record shuffle event", error);
    return null;
  }

  const stats = await getShuffleStats(input.spotifyUserId);

  if (!stats.enabled) {
    return null;
  }

  return stats;
}

export async function getShuffleStats(
  spotifyUserId?: string | null,
): Promise<ShuffleStatsResponse> {
  if (!isShuffleStatsEnabled()) {
    return { enabled: false };
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return { enabled: false };
  }

  const globalQuery = supabase
    .from("shuffle_events")
    .select("*", { count: "exact", head: true });

  const userQuery = spotifyUserId
    ? supabase
        .from("shuffle_events")
        .select("*", { count: "exact", head: true })
        .eq("spotify_user_id", spotifyUserId)
    : null;

  const [globalResult, userResult] = await Promise.all([
    globalQuery,
    userQuery,
  ]);

  if (globalResult.error) {
    console.error("Failed to load global shuffle stats", globalResult.error);
    return { enabled: false };
  }

  if (userResult?.error) {
    console.error("Failed to load user shuffle stats", userResult.error);
    return { enabled: false };
  }

  return {
    enabled: true,
    global: globalResult.count ?? 0,
    user: spotifyUserId ? (userResult?.count ?? 0) : null,
  };
}
