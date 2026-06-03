import type { PlaylistDetails, TrackSummary } from "@/lib/spotify/types";

const CACHE_VERSION = 1;
const CACHE_PREFIX = "shuffle-studio:playlist-detail";
const HOVER_PREFETCH_DELAY_MS = 120;

export type PlaylistDetailData = {
  playlist: PlaylistDetails;
  tracks: TrackSummary[];
};

type PlaylistDetailCacheEntry = PlaylistDetailData & {
  version: typeof CACHE_VERSION;
  userId: string;
  playlistId: string;
  savedAt: number;
};

type PlaylistDetailApiResponse = PlaylistDetailData;

const memoryCache = new Map<string, PlaylistDetailCacheEntry>();
export type FetchPlaylistDetailResult =
  | { ok: true; data: PlaylistDetailData }
  | { ok: false; status: number | null };

const inFlight = new Map<string, Promise<FetchPlaylistDetailResult>>();

function getCacheKey(userId: string, playlistId: string) {
  return `${CACHE_PREFIX}:${userId}:${playlistId}:v${CACHE_VERSION}`;
}

function getInFlightKey(userId: string, playlistId: string) {
  return `${userId}:${playlistId}`;
}

export function readCachedPlaylistDetail(
  userId: string,
  playlistId: string,
): PlaylistDetailData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const key = getCacheKey(userId, playlistId);
  const inMemory = memoryCache.get(key);

  if (inMemory) {
    return { playlist: inMemory.playlist, tracks: inMemory.tracks };
  }

  try {
    const raw = window.sessionStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PlaylistDetailCacheEntry;

    if (
      parsed.version !== CACHE_VERSION ||
      parsed.userId !== userId ||
      parsed.playlistId !== playlistId ||
      !parsed.playlist ||
      !Array.isArray(parsed.tracks)
    ) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    memoryCache.set(key, parsed);
    return { playlist: parsed.playlist, tracks: parsed.tracks };
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

export function writeCachedPlaylistDetail(
  userId: string,
  playlistId: string,
  data: PlaylistDetailData,
) {
  if (typeof window === "undefined") {
    return;
  }

  const key = getCacheKey(userId, playlistId);
  const entry: PlaylistDetailCacheEntry = {
    version: CACHE_VERSION,
    userId,
    playlistId,
    savedAt: Date.now(),
    ...data,
  };

  memoryCache.set(key, entry);

  try {
    window.sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Keep the in-memory cache when storage is unavailable or full.
  }
}

export function clearCachedPlaylistDetail(userId: string, playlistId: string) {
  const key = getCacheKey(userId, playlistId);

  memoryCache.delete(key);
  inFlight.delete(getInFlightKey(userId, playlistId));

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage failures while clearing a best-effort cache.
  }
}

export function playlistDetailChanged(
  current: PlaylistDetailData,
  next: PlaylistDetailData,
) {
  return JSON.stringify(current) !== JSON.stringify(next);
}

export function fetchPlaylistDetail(
  userId: string,
  playlistId: string,
): Promise<FetchPlaylistDetailResult> {
  const inFlightKey = getInFlightKey(userId, playlistId);
  const existing = inFlight.get(inFlightKey);

  if (existing) {
    return existing;
  }

  const request = fetch(`/api/playlists/${playlistId}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  })
    .then(async (response): Promise<FetchPlaylistDetailResult> => {
      if (response.status === 401) {
        return { ok: false, status: 401 };
      }

      if (!response.ok) {
        return { ok: false, status: response.status };
      }

      const data = (await response.json()) as PlaylistDetailApiResponse;
      writeCachedPlaylistDetail(userId, playlistId, data);
      return { ok: true, data };
    })
    .catch((): FetchPlaylistDetailResult => ({ ok: false, status: null }))
    .finally(() => {
      inFlight.delete(inFlightKey);
    });

  inFlight.set(inFlightKey, request);
  return request;
}

export function schedulePlaylistDetailPrefetch(userId: string, playlistId: string) {
  if (typeof window === "undefined") {
    return () => {};
  }

  if (readCachedPlaylistDetail(userId, playlistId)) {
    return () => {};
  }

  if (inFlight.has(getInFlightKey(userId, playlistId))) {
    return () => {};
  }

  const timeout = window.setTimeout(() => {
    void fetchPlaylistDetail(userId, playlistId);
  }, HOVER_PREFETCH_DELAY_MS);

  return () => {
    window.clearTimeout(timeout);
  };
}
