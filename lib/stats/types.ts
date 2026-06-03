export type ShuffleStatsSnapshot = {
  enabled: true;
  global: number;
  user: number | null;
};

export type ShuffleStatsResponse = ShuffleStatsSnapshot | { enabled: false };
