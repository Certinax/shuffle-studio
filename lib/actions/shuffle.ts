"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { buildShuffledPlaylistName } from "@/lib/playlist-name";
import { fisherYatesShuffle } from "@/lib/shuffle";
import {
  addItemsToPlaylist,
  createPlaylist,
  getPlaylistDetails,
  getPlaylistTracks,
  getUserPlaylists,
  SpotifyApiError,
  SpotifyAuthError,
} from "@/lib/spotify/client";

export type ShuffleActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  playlistName?: string;
  playlistUrl?: string;
};

const shuffleSchema = z.object({
  playlistId: z.string().min(1),
  visibility: z.enum(["same", "public", "private"]),
});

const defaultError =
  "Something went wrong while creating the shuffled playlist. Please try again.";

export async function shufflePlaylist(
  _previousState: ShuffleActionState,
  formData: FormData,
): Promise<ShuffleActionState> {
  const parsed = shuffleSchema.safeParse({
    playlistId: formData.get("playlistId"),
    visibility: formData.get("visibility"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Choose a playlist and visibility before shuffling.",
    };
  }

  try {
    const [playlist, playlists, tracks] = await Promise.all([
      getPlaylistDetails(parsed.data.playlistId),
      getUserPlaylists(),
      getPlaylistTracks(parsed.data.playlistId),
    ]);

    if (tracks.length === 0) {
      return {
        status: "error",
        message: "This playlist does not have any Spotify tracks that can be copied.",
      };
    }

    const isPublic =
      parsed.data.visibility === "same"
        ? playlist.isPublic === true
        : parsed.data.visibility === "public";
    const newPlaylistName = buildShuffledPlaylistName(playlist.name, playlists);
    const shuffledUris = fisherYatesShuffle(tracks.map((track) => track.uri));
    const created = await createPlaylist(
      newPlaylistName,
      isPublic,
      `Shuffled from "${playlist.name}" with Shuffle Studio.`,
    );

    await addItemsToPlaylist(created.id, shuffledUris);

    revalidatePath("/playlists");
    revalidatePath(`/playlists/${parsed.data.playlistId}`);

    return {
      status: "success",
      message: `Created ${created.name} with ${tracks.length.toLocaleString()} tracks.`,
      playlistName: created.name,
      playlistUrl: created.spotifyUrl,
    };
  } catch (error) {
    if (error instanceof SpotifyAuthError) {
      return {
        status: "error",
        message: "Your Spotify session expired. Log in again and retry.",
      };
    }

    if (error instanceof SpotifyApiError) {
      return {
        status: "error",
        message: error.message,
      };
    }

    return {
      status: "error",
      message: defaultError,
    };
  }
}
