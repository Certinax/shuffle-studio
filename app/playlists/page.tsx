import type { Metadata } from "next";

import { PlaylistBrowser } from "@/components/playlists/playlist-browser";
import { PageContainer } from "@/components/shell/page-container";
import { getUserPlaylists } from "@/lib/spotify/client";

export const metadata: Metadata = {
  title: "Playlists",
};

export default async function PlaylistsPage() {
  const playlists = await getUserPlaylists();

  return (
    <PageContainer>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Your Spotify catalog</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em]">
            Pick a playlist to shuffle
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          We only copy track URIs into a new playlist. Nothing in your original playlist is modified.
        </p>
      </div>

      <PlaylistBrowser playlists={playlists} />
    </PageContainer>
  );
}
