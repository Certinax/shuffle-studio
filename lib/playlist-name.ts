import type { PlaylistSummary } from "@/lib/spotify/types";

const MAX_SPOTIFY_PLAYLIST_NAME_LENGTH = 100;

export function sanitizePlaylistName(name: string) {
  return name.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildShuffledPlaylistName(
  originalName: string,
  playlists: PlaylistSummary[],
) {
  const cleanOriginal = sanitizePlaylistName(originalName) || "playlist";
  const matcher = new RegExp(`^shuffled-(\\d+)-${escapeRegex(cleanOriginal)}$`, "i");
  const nextIteration =
    playlists.reduce((max, playlist) => {
      const match = playlist.name.match(matcher);
      const iteration = match ? Number(match[1]) : 0;

      return Math.max(max, iteration);
    }, 0) + 1;
  const prefix = `shuffled-${nextIteration}-`;
  const remainingLength = MAX_SPOTIFY_PLAYLIST_NAME_LENGTH - prefix.length;

  return `${prefix}${cleanOriginal.slice(0, Math.max(remainingLength, 1))}`;
}
