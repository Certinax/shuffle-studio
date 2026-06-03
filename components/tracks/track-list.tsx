"use client";

import { useRef } from "react";
import { Music2 } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

import type { TrackSummary } from "@/lib/spotify/types";

function formatDuration(durationMs: number) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function TrackList({ tracks }: { tracks: TrackSummary[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual owns scroll measurement inside this client island.
  const virtualizer = useVirtualizer({
    count: tracks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 8,
  });

  if (tracks.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] text-center">
        <div>
          <Music2 className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No playable Spotify tracks</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Local files and unavailable tracks are skipped.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]">
      <div className="grid grid-cols-[1fr_auto] border-b border-white/10 px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground sm:grid-cols-[1fr_9rem_auto]">
        <span>Track</span>
        <span className="hidden sm:block">Album</span>
        <span>Time</span>
      </div>
      <div ref={parentRef} className="h-[620px] overflow-auto">
        <div
          className="relative w-full"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const track = tracks[virtualItem.index];

            return (
              <div
                key={track.uri}
                className="absolute left-0 top-0 grid w-full grid-cols-[1fr_auto] items-center gap-4 border-b border-white/[0.06] px-4 py-3 sm:grid-cols-[1fr_9rem_auto]"
                style={{ transform: `translateY(${virtualItem.start}px)` }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-white/[0.06]">
                    {track.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={track.imageUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <Music2 className="size-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{track.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {track.artists}
                    </p>
                  </div>
                </div>
                <p className="hidden truncate text-sm text-muted-foreground sm:block">
                  {track.albumName}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {formatDuration(track.durationMs)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
