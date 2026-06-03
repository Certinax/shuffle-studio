"use client";

import { ExternalLink, LockKeyhole, Music2, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ShufflePanel } from "@/components/shuffle/shuffle-panel";
import { TrackList } from "@/components/tracks/track-list";
import { TrackListSkeleton } from "@/components/tracks/track-list-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  clearCachedPlaylistDetail,
  fetchPlaylistDetail,
  playlistDetailChanged,
  readCachedPlaylistDetail,
  type PlaylistDetailData,
} from "@/lib/playlists/playlist-detail-cache";

function PlaylistDetailSkeleton() {
  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div className="space-y-6">
        <div className="glass-card rounded-3xl border border-white/10 p-5">
          <div className="flex flex-col gap-5 sm:flex-row">
            <Skeleton className="size-36 rounded-2xl" />
            <div className="flex flex-1 flex-col justify-end">
              <div className="mb-3 flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="mt-3 h-4 w-32" />
              <Skeleton className="mt-5 h-9 w-36 rounded-full" />
            </div>
          </div>
        </div>

        <TrackListSkeleton />
      </div>

      <div className="glass-card rounded-3xl border border-white/10 p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-12 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </section>
  );
}

function PlaylistUnavailableCard() {
  return (
    <Card className="flex min-h-72 items-center justify-center rounded-3xl border-dashed bg-white/3 p-10 text-center">
      <div>
        <LockKeyhole className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 font-medium">Spotify blocks item access here</p>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          The playlist can be listed, but Spotify only exposes its tracks to apps when
          the authenticated user owns the playlist or is a collaborator.
        </p>
      </div>
    </Card>
  );
}

function ShuffleUnavailableCard() {
  return (
    <Card className="glass-card sticky top-24 rounded-3xl p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground">
          <LockKeyhole className="size-5" />
        </div>
        <div>
          <h2 className="font-semibold tracking-[-0.02em]">Playlist items unavailable</h2>
          <p className="text-sm text-muted-foreground">
            Spotify only lets this app read tracks from playlists you own or collaborate on.
          </p>
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-muted-foreground">
        You can still open this playlist in Spotify, but Shuffle Studio cannot create a
        shuffled copy from followed playlists owned by someone else.
      </p>
    </Card>
  );
}

export function PlaylistDetailView({
  playlistId,
  userId,
}: {
  playlistId: string;
  userId: string | null;
}) {
  const [detail, setDetail] = useState<PlaylistDetailData | null>(null);
  const [hasLoadedFromCache, setHasLoadedFromCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsReconnect, setNeedsReconnect] = useState(false);

  const refreshPlaylist = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!userId) {
        setDetail(null);
        setHasLoadedFromCache(true);
        setNeedsReconnect(false);
        return;
      }

      if (!options?.silent) {
        setError(null);
        setNeedsReconnect(false);
      }

      try {
        const result = await fetchPlaylistDetail(userId, playlistId);

        if (!result.ok) {
          if (result.status === 401) {
            clearCachedPlaylistDetail(userId, playlistId);
            setDetail(null);
            setError("Your Spotify session expired. Reconnect Spotify to load this playlist.");
            setNeedsReconnect(true);
            return;
          }

          const cached = readCachedPlaylistDetail(userId, playlistId);

          if (cached) {
            setDetail((current) =>
              !current || playlistDetailChanged(current, cached) ? cached : current,
            );
            setError("Couldn’t refresh this playlist. Showing the last saved version.");
            setNeedsReconnect(false);
            return;
          }

          throw new Error("Unable to refresh playlist.");
        }

        setDetail((current) =>
          !current || playlistDetailChanged(current, result.data) ? result.data : current,
        );
        setError(null);
        setNeedsReconnect(false);
      } catch {
        setError("Couldn’t refresh this playlist. Try again in a moment.");
        setNeedsReconnect(false);
      } finally {
        setHasLoadedFromCache(true);
      }
    },
    [playlistId, userId],
  );

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      if (!userId) {
        setDetail(null);
        setHasLoadedFromCache(true);
        return;
      }

      const cached = readCachedPlaylistDetail(userId, playlistId);

      if (cached) {
        setDetail(cached);
        setHasLoadedFromCache(true);
      } else {
        setDetail(null);
        setHasLoadedFromCache(false);
      }

      void refreshPlaylist({ silent: true });
    });

    return () => {
      cancelled = true;
    };
  }, [playlistId, refreshPlaylist, userId]);

  useEffect(() => {
    if (!detail?.playlist.name) {
      return;
    }

    document.title = `${detail.playlist.name} | Shuffle Studio`;
  }, [detail?.playlist.name]);

  if (!userId) {
    return (
      <Card className="glass-card p-8 text-center">
        <h2 className="text-2xl font-semibold tracking-[-0.04em]">
          Connect Spotify to open this playlist
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Playlist details are cached per account and only shown while your session is
          active.
        </p>
        <Button asChild className="mt-6">
          <a href="/api/auth/login">Reconnect Spotify</a>
        </Button>
      </Card>
    );
  }

  if (!hasLoadedFromCache) {
    return <PlaylistDetailSkeleton />;
  }

  if (!detail) {
    return (
      <Card className="glass-card p-8 text-center">
        <h2 className="text-2xl font-semibold tracking-[-0.04em]">
          Couldn’t load this playlist
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {error ?? "Spotify might be rate limiting the request or your session may need refreshing."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {needsReconnect ? (
            <Button asChild>
              <a href="/api/auth/login">Reconnect Spotify</a>
            </Button>
          ) : (
            <Button type="button" onClick={() => void refreshPlaylist()}>
              <RefreshCcw className="size-4" />
              Try again
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const { playlist, tracks } = detail;

  return (
    <>
      {error ? (
        <Card className="mb-6 flex flex-col gap-4 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
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
              onClick={() => void refreshPlaylist()}
            >
              <RefreshCcw className="size-4" />
              Try again
            </Button>
          )}
        </Card>
      ) : null}

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="min-w-0 space-y-6">
          <div className="glass-card overflow-hidden rounded-3xl border border-white/10 p-5">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="size-36 shrink-0 overflow-hidden rounded-2xl bg-white/[0.06] shadow-2xl shadow-black/30">
                {playlist.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={playlist.imageUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <Music2 className="size-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-end">
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge>{playlist.isPublic ? "Public" : "Private"}</Badge>
                  <Badge>{playlist.trackCount.toLocaleString()} Spotify items</Badge>
                  <Badge>{tracks.length.toLocaleString()} playable tracks</Badge>
                </div>
                <h1 className="truncate text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
                  {playlist.name}
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">By {playlist.ownerName}</p>
                <div className="mt-5">
                  <Button asChild variant="secondary" size="sm">
                    <a href={playlist.spotifyUrl} target="_blank" rel="noreferrer">
                      Open in Spotify
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {playlist.canReadItems ? <TrackList tracks={tracks} /> : <PlaylistUnavailableCard />}
        </div>

        {playlist.canReadItems ? (
          <ShufflePanel playlist={playlist} trackCount={tracks.length} />
        ) : (
          <ShuffleUnavailableCard />
        )}
      </section>
    </>
  );
}
