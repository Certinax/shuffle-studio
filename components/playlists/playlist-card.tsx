"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Music2 } from "lucide-react";
import { useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { schedulePlaylistDetailPrefetch } from "@/lib/playlists/playlist-detail-cache";
import type { PlaylistSummary } from "@/lib/spotify/types";

export function PlaylistCard({
  playlist,
  userId,
}: {
  playlist: PlaylistSummary;
  userId: string | null;
}) {
  const router = useRouter();
  const cancelPrefetchRef = useRef<(() => void) | null>(null);

  const handleMouseEnter = () => {
    router.prefetch(`/playlists/${playlist.id}`);

    if (!userId) {
      return;
    }

    cancelPrefetchRef.current?.();
    cancelPrefetchRef.current = schedulePlaylistDetailPrefetch(userId, playlist.id);
  };

  const handleMouseLeave = () => {
    cancelPrefetchRef.current?.();
    cancelPrefetchRef.current = null;
  };

  return (
    <Link
      href={`/playlists/${playlist.id}`}
      prefetch={false}
      className="group block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card className="h-full overflow-hidden bg-white/[0.045] p-3 transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-white/[0.075] hover:shadow-[0_24px_80px_rgba(29,185,84,0.12)]">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-white/[0.06]">
          {playlist.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={playlist.imageUrl}
              alt=""
              className="size-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Music2 className="size-10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <div className="space-y-3 p-2 pb-1 pt-4">
          <div>
            <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 tracking-[-0.02em]">
              {playlist.name}
            </h3>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {playlist.ownerName}
            </p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Badge>{playlist.trackCount.toLocaleString()} tracks</Badge>
            <span className="text-xs text-muted-foreground">
              {!playlist.canReadItems
                ? "View only"
                : playlist.isPublic
                  ? "Public"
                  : "Private"}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
