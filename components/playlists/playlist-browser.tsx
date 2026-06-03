"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PlaylistCard } from "@/components/playlists/playlist-card";
import { Input } from "@/components/ui/input";
import type { PlaylistSummary } from "@/lib/spotify/types";

export function PlaylistBrowser({ playlists }: { playlists: PlaylistSummary[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return playlists;
    }

    return playlists.filter((playlist) =>
      `${playlist.name} ${playlist.ownerName}`.toLowerCase().includes(normalized),
    );
  }, [playlists, query]);

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
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length.toLocaleString()} of {playlists.length.toLocaleString()} playlists
        </p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
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
