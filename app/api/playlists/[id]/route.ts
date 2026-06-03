import { NextResponse } from "next/server";

import {
  getPlaylistDetails,
  getPlaylistTracks,
  SpotifyAuthError,
} from "@/lib/spotify/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const playlist = await getPlaylistDetails(id);
    const tracks = playlist.canReadItems ? await getPlaylistTracks(id) : [];

    return NextResponse.json(
      { playlist, tracks },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    if (error instanceof SpotifyAuthError) {
      return NextResponse.json(
        { message: "Spotify authentication is required." },
        { status: 401 },
      );
    }

    console.error(`Unable to load Spotify playlist ${id}`, error);

    return NextResponse.json(
      { message: "Unable to load Spotify playlist." },
      { status: 500 },
    );
  }
}
