import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, LockKeyhole, Music2 } from "lucide-react";

import { ShufflePanel } from "@/components/shuffle/shuffle-panel";
import { PageContainer } from "@/components/shell/page-container";
import { TrackList } from "@/components/tracks/track-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const playlist = await getPlaylistDetails(id);
  const tracks = playlist.canReadItems ? await getPlaylistTracks(id) : [];

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

          {playlist.canReadItems ? (
            <TrackList tracks={tracks} />
          ) : (
            <Card className="flex min-h-72 items-center justify-center rounded-3xl border-dashed bg-white/[0.03] p-10 text-center">
              <div>
                <LockKeyhole className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 font-medium">Spotify blocks item access here</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  The playlist can be listed, but Spotify only exposes its tracks to
                  apps when the authenticated user owns the playlist or is a collaborator.
                </p>
              </div>
            </Card>
          )}
        </div>

        {playlist.canReadItems ? (
          <ShufflePanel playlist={playlist} trackCount={tracks.length} />
        ) : (
          <Card className="glass-card sticky top-24 rounded-3xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-white/[0.06] text-muted-foreground">
                <LockKeyhole className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold tracking-[-0.02em]">
                  Playlist items unavailable
                </h2>
                <p className="text-sm text-muted-foreground">
                  Spotify only lets this app read tracks from playlists you own or collaborate on.
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              You can still open this playlist in Spotify, but Shuffle Studio cannot
              create a shuffled copy from followed playlists owned by someone else.
            </p>
          </Card>
        )}
      </section>
    </PageContainer>
  );
}
