import { NextResponse } from "next/server";

import { getUserPlaylists, SpotifyAuthError } from "@/lib/spotify/client";

export async function GET() {
  try {
    const playlists = await getUserPlaylists();

    return NextResponse.json(
      { playlists },
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

    console.error("Unable to load Spotify playlists", error);

    return NextResponse.json(
      { message: "Unable to load Spotify playlists." },
      { status: 500 },
    );
  }
}
