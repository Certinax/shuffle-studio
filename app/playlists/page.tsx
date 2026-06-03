import type { Metadata } from "next";

import { PlaylistBrowser } from "@/components/playlists/playlist-browser";
import { PageContainer } from "@/components/shell/page-container";
import { getPublicSession } from "@/lib/session";
import { getShuffleStats } from "@/lib/stats/shuffles";

export const metadata: Metadata = {
  title: "Playlists",
};

export default async function PlaylistsPage() {
  const session = await getPublicSession();
  const stats = session ? await getShuffleStats(session.user.id) : null;
  const userShuffleCount =
    stats?.enabled && session ? stats.user : null;

  return (
    <PageContainer>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Your Spotify catalog</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tighter">
            Pick a playlist to shuffle
          </h1>
          {userShuffleCount !== null ? (
            <p className="mt-3 text-sm text-muted-foreground">
              You&apos;ve shuffled{" "}
              <span className="font-medium text-foreground tabular-nums">
                {userShuffleCount.toLocaleString()}
              </span>{" "}
              {userShuffleCount === 1 ? "playlist" : "playlists"} so far.
            </p>
          ) : null}
        </div>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          We only copy track URIs into a new playlist. Nothing in your original playlist is modified.
        </p>
      </div>

      <PlaylistBrowser userId={session?.user.id ?? null} />
    </PageContainer>
  );
}
