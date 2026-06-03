import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PlaylistDetailView } from "@/components/playlists/playlist-detail-view";
import { PageContainer } from "@/components/shell/page-container";
import { Button } from "@/components/ui/button";
import { getPublicSession } from "@/lib/session";
import { getPlaylistDetails } from "@/lib/spotify/client";

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
  const session = await getPublicSession();

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

      <PlaylistDetailView playlistId={id} userId={session?.user.id ?? null} />
    </PageContainer>
  );
}
