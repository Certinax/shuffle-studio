import type { Metadata } from "next";

import { PlaylistBrowser } from "@/components/playlists/playlist-browser";
import { PageContainer } from "@/components/shell/page-container";
import { getPublicSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Playlists",
};

export default async function PlaylistsPage() {
  const session = await getPublicSession();

  return (
    <PageContainer>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Your Spotify catalog</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tighter">
            Pick a playlist to shuffle
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          We only copy track URIs into a new playlist. Nothing in your original playlist is modified.
        </p>
      </div>

      <PlaylistBrowser userId={session?.user.id ?? null} />
    </PageContainer>
  );
}
