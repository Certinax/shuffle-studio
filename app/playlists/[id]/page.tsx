import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Music2 } from "lucide-react";

import { ShufflePanel } from "@/components/shuffle/shuffle-panel";
import { PageContainer } from "@/components/shell/page-container";
import { TrackList } from "@/components/tracks/track-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getPlaylistDetails,
  getPlaylistTracks,
} from "@/lib/spotify/client";

type PlaylistPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PlaylistPageProps): Promise<Metadata> {
  const { id } = await params;
  const playlist = await getPlaylistDetails(id);

  return {
    title: playlist.name,
  };
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { id } = await params;
  const playlistPromise = getPlaylistDetails(id);
  const tracksPromise = getPlaylistTracks(id);
  const [playlist, tracks] = await Promise.all([playlistPromise, tracksPromise]);

  return (
    <PageContainer>
      <div className="mb-6">
        <Button asChild variant="ghost" className="-ml-4">
          <Link href="/playlists">
            <ArrowLeft className="size-4" />
            Back to playlists
          </Link>
        </Button>
      </div>

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
                <p className="mt-3 text-sm text-muted-foreground">
                  By {playlist.ownerName}
                </p>
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

          <TrackList tracks={tracks} />
        </div>

        <ShufflePanel playlist={playlist} trackCount={tracks.length} />
      </section>
    </PageContainer>
  );
}
