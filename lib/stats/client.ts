export const SHUFFLE_STATS_UPDATED_EVENT = "shuffle-stats-updated";

export type ShuffleStatsPayload = {
  enabled: boolean;
  global?: number;
  user?: number | null;
};

export function notifyShuffleStatsUpdated(stats: ShuffleStatsPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<ShuffleStatsPayload>(SHUFFLE_STATS_UPDATED_EVENT, {
      detail: stats,
    }),
  );
}
