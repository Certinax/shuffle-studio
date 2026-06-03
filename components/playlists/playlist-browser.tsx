"use client";

import { RefreshCcw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PlaylistCard } from "@/components/playlists/playlist-card";
import { PlaylistGridSkeleton } from "@/components/playlists/playlist-grid-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PlaylistSummary } from "@/lib/spotify/types";

const CACHE_VERSION = 1;
const CACHE_PREFIX = "shuffle-studio:playlists";

type PlaylistCacheEntry = {
  version: typeof CACHE_VERSION;
  userId: string;
  savedAt: number;
  playlists: PlaylistSummary[];
};

type PlaylistApiResponse = {
  playlists: PlaylistSummary[];
};

const memoryCache = new Map<string, PlaylistCacheEntry>();

function getCacheKey(userId: string) {
  return `${CACHE_PREFIX}:${userId}:v${CACHE_VERSION}`;
}

function readCachedPlaylists(userId: string): PlaylistCacheEntry | null {
  const key = getCacheKey(userId);
  const inMemory = memoryCache.get(key);

  if (inMemory) {
    return inMemory;
  }

  try {
    const raw = window.sessionStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PlaylistCacheEntry;

    if (
      parsed.version !== CACHE_VERSION ||
      parsed.userId !== userId ||
      !Array.isArray(parsed.playlists)
    ) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    memoryCache.set(key, parsed);
    return parsed;
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

function writeCachedPlaylists(userId: string, playlists: PlaylistSummary[]) {
  const key = getCacheKey(userId);
  const entry: PlaylistCacheEntry = {
    version: CACHE_VERSION,
    userId,
    savedAt: Date.now(),
    playlists,
  };

  memoryCache.set(key, entry);

  try {
    window.sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Keep the in-memory cache when storage is unavailable or full.
  }

  return entry;
}

function clearCachedPlaylists(userId: string) {
  const key = getCacheKey(userId);

  memoryCache.delete(key);

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage failures while clearing a best-effort cache.
  }
}

function playlistsChanged(current: PlaylistSummary[], next: PlaylistSummary[]) {
  return JSON.stringify(current) !== JSON.stringify(next);
}

export function PlaylistBrowser({ userId }: { userId: string | null }) {
  const [query, setQuery] = useState("");
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [hasLoadedFromCache, setHasLoadedFromCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsReconnect, setNeedsReconnect] = useState(false);

  const refreshPlaylists = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!userId) {
        setPlaylists([]);
        setHasLoadedFromCache(true);
        setNeedsReconnect(false);
        return;
      }

      if (!options?.silent) {
        setError(null);
        setNeedsReconnect(false);
      }

      try {
        const response = await fetch("/api/playlists", {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (response.status === 401) {
          clearCachedPlaylists(userId);
          setPlaylists([]);
          setError("Your Spotify session expired. Reconnect Spotify to load playlists.");
          setNeedsReconnect(true);
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to refresh playlists.");
        }

        const data = (await response.json()) as PlaylistApiResponse;
        writeCachedPlaylists(userId, data.playlists);

        setPlaylists((current) =>
          playlistsChanged(current, data.playlists) ? data.playlists : current,
        );
        setError(null);
        setNeedsReconnect(false);
      } catch {
        setError("Couldn’t refresh playlists. Try again in a moment.");
        setNeedsReconnect(false);
      } finally {
        setHasLoadedFromCache(true);
      }
    },
    [userId],
  );

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      if (!userId) {
        setPlaylists([]);
        setHasLoadedFromCache(true);
        return;
      }

      const cached = readCachedPlaylists(userId);

      if (cached) {
        setPlaylists(cached.playlists);
        setHasLoadedFromCache(true);
      } else {
        setPlaylists([]);
        setHasLoadedFromCache(false);
      }

      void refreshPlaylists({ silent: true });
    });

    return () => {
      cancelled = true;
    };
  }, [refreshPlaylists, userId]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return playlists;
    }

    return playlists.filter((playlist) =>
      `${playlist.name} ${playlist.ownerName}`.toLowerCase().includes(normalized),
    );
  }, [playlists, query]);

  if (!userId) {
    return (
      <Card className="glass-card p-8 text-center">
        <h2 className="text-2xl font-semibold tracking-[-0.04em]">
          Connect Spotify to load playlists
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Your playlist cache is only shown while your encrypted Spotify session is
          available.
        </p>
        <Button asChild className="mt-6">
          <a href="/api/auth/login">Reconnect Spotify</a>
        </Button>
      </Card>
    );
  }

  const searchDisabled = !hasLoadedFromCache;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your playlists"
            className="pl-11"
            disabled={searchDisabled}
          />
        </div>
        <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
          {filtered.length.toLocaleString()} of {playlists.length.toLocaleString()} playlists
        </p>
      </div>

      {error ? (
        <Card className="flex flex-col gap-4 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
          <p>{error}</p>
          {needsReconnect ? (
            <Button asChild variant="secondary" size="sm">
              <a href="/api/auth/login">Reconnect Spotify</a>
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void refreshPlaylists()}
            >
              <RefreshCcw className="size-4" />
              Try again
            </Button>
          )}
        </Card>
      ) : null}

      {!hasLoadedFromCache ? (
        <PlaylistGridSkeleton />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/3 p-10 text-center">
          <div>
            <p className="font-medium">No playlists found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try searching by another playlist or owner name.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
