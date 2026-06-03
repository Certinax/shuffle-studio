import "server-only";

import { cache } from "react";

import { getEnv, getRedirectUri } from "@/lib/env";
import { getSession, setSession, type SessionUser, type SpotifySession } from "@/lib/session";
import type {
  CreatedPlaylist,
  PlaylistDetails,
  PlaylistSummary,
  SpotifyImage,
  TrackSummary,
} from "@/lib/spotify/types";

const SPOTIFY_API = "https://api.spotify.com/v1";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

type SpotifyPaging<T> = {
  items: T[];
  next: string | null;
};

type SpotifyPlaylist = {
  id: string;
  name: string;
  collaborative?: boolean;
  description?: string | null;
  public?: boolean | null;
  images?: SpotifyImage[];
  owner?: {
    id: string;
    display_name?: string | null;
  };
  tracks?: {
    total: number;
  };
  items?: {
    total: number;
  };
  external_urls?: {
    spotify?: string;
  };
};

type SpotifyPlaylistTrackItem = {
  track: {
    id: string;
    name: string;
    uri: string;
    is_local?: boolean;
    duration_ms: number;
    artists?: Array<{ name: string }>;
    album?: {
      name: string;
      images?: SpotifyImage[];
    };
  } | null;
};

type SpotifyProfile = {
  id: string;
  display_name?: string | null;
  images?: SpotifyImage[];
  external_urls?: {
    spotify?: string;
  };
};

export class SpotifyAuthError extends Error {
  constructor(message = "Spotify authentication is required.") {
    super(message);
    this.name = "SpotifyAuthError";
  }
}

export class SpotifyApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "SpotifyApiError";
  }
}

function basicAuthHeader() {
  const credentials = `${getEnv("SPOTIFY_CLIENT_ID")}:${getEnv("SPOTIFY_CLIENT_SECRET")}`;

  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

export async function exchangeCodeForSession(code: string): Promise<SpotifySession> {
  const token = await fetchToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri(),
  });

  const profile = await fetchSpotifyProfile(token.access_token);

  if (!token.refresh_token) {
    throw new SpotifyApiError("Spotify did not return a refresh token.", 401);
  }

  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: Date.now() + token.expires_in * 1000,
    user: toSessionUser(profile),
  };
}

export async function refreshSpotifySession(
  session: SpotifySession,
): Promise<SpotifySession> {
  const token = await fetchToken({
    grant_type: "refresh_token",
    refresh_token: session.refreshToken,
  });

  return {
    ...session,
    accessToken: token.access_token,
    refreshToken: token.refresh_token ?? session.refreshToken,
    expiresAt: Date.now() + token.expires_in * 1000,
  };
}

async function fetchToken(params: Record<string, string>) {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });

  if (!response.ok) {
    throw new SpotifyApiError(
      `Spotify token request failed with status ${response.status}.`,
      response.status,
    );
  }

  return (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
}

async function fetchSpotifyProfile(accessToken: string) {
  const response = await fetch(`${SPOTIFY_API}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new SpotifyApiError("Unable to fetch the Spotify profile.", response.status);
  }

  return (await response.json()) as SpotifyProfile;
}

function toSessionUser(profile: SpotifyProfile): SessionUser {
  return {
    id: profile.id,
    displayName: profile.display_name || "Spotify user",
    imageUrl: profile.images?.[0]?.url,
    profileUrl: profile.external_urls?.spotify,
  };
}

async function getAuthorizedSession(options?: { persistRefresh?: boolean }) {
  const session = await getSession();

  if (!session) {
    throw new SpotifyAuthError();
  }

  if (session.expiresAt - Date.now() > 60_000) {
    return session;
  }

  const refreshed = await refreshSpotifySession(session);

  if (options?.persistRefresh) {
    await setSession(refreshed);
  }

  return refreshed;
}

async function spotifyFetch<T>(
  path: string,
  init?: RequestInit,
  options?: { persistRefresh?: boolean },
) {
  let session = await getAuthorizedSession(options);
  let response = await fetch(`${SPOTIFY_API}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    session = await refreshSpotifySession(session);

    if (options?.persistRefresh) {
      await setSession(session);
    }

    response = await fetch(`${SPOTIFY_API}${path}`, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  if (!response.ok) {
    const retryAfter = response.headers.get("retry-after");
    const suffix = retryAfter ? ` Try again in ${retryAfter} seconds.` : "";

    throw new SpotifyApiError(
      `Spotify API request failed (${response.status}).${suffix}`,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function toPlaylistSummary(
  playlist: SpotifyPlaylist,
  currentUserId?: string,
): PlaylistSummary {
  const ownerId = playlist.owner?.id ?? "";
  const isCollaborative = playlist.collaborative === true;

  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description ?? "",
    isPublic: playlist.public ?? null,
    imageUrl: playlist.images?.[0]?.url,
    ownerName: playlist.owner?.display_name || "Spotify",
    ownerId,
    isCollaborative,
    canReadItems: Boolean(currentUserId && (ownerId === currentUserId || isCollaborative)),
    trackCount: playlist.items?.total ?? playlist.tracks?.total ?? 0,
    spotifyUrl: playlist.external_urls?.spotify ?? `https://open.spotify.com/playlist/${playlist.id}`,
  };
}

function toPlaylistDetails(
  playlist: SpotifyPlaylist,
  currentUserId?: string,
): PlaylistDetails {
  return toPlaylistSummary(playlist, currentUserId);
}

async function getAllPages<T>(path: string) {
  const items: T[] = [];
  let nextPath: string | null = path;

  while (nextPath) {
    const page: SpotifyPaging<T> = await spotifyFetch(nextPath);
    items.push(...page.items);
    nextPath = page.next ? page.next.replace(SPOTIFY_API, "") : null;
  }

  return items;
}

export const getCurrentSessionUser = cache(async () => {
  const session = await getAuthorizedSession();

  return session.user;
});

export const getUserPlaylists = cache(async () => {
  const session = await getAuthorizedSession();
  const playlists = await getAllPages<SpotifyPlaylist>("/me/playlists?limit=50");

  return playlists.map((playlist) => toPlaylistSummary(playlist, session.user.id));
});

export const getPlaylistDetails = cache(async (playlistId: string) => {
  const session = await getAuthorizedSession();
  const playlist = await spotifyFetch<SpotifyPlaylist>(
    `/playlists/${playlistId}?fields=id,name,collaborative,description,public,images,owner(id,display_name),items(total),tracks(total),external_urls`,
  );

  return toPlaylistDetails(playlist, session.user.id);
});

export const getPlaylistTracks = cache(async (playlistId: string) => {
  const items = await getAllPages<SpotifyPlaylistTrackItem>(
    `/playlists/${playlistId}/items?limit=50&additional_types=track&fields=items(track(id,name,uri,is_local,duration_ms,artists(name),album(name,images))),next`,
  );

  return items
    .map((item): TrackSummary | null => {
      const track = item.track;

      if (!track || track.is_local || !track.uri) {
        return null;
      }

      return {
        id: track.id,
        name: track.name,
        uri: track.uri,
        artists: track.artists?.map((artist) => artist.name).join(", ") || "Unknown artist",
        albumName: track.album?.name || "Unknown album",
        imageUrl: track.album?.images?.[0]?.url,
        durationMs: track.duration_ms,
      };
    })
    .filter((track): track is TrackSummary => Boolean(track));
});

export async function createPlaylist(
  name: string,
  isPublic: boolean,
  description: string,
) {
  const session = await getAuthorizedSession({ persistRefresh: true });

  return spotifyFetch<CreatedPlaylist>(
    `/users/${session.user.id}/playlists`,
    {
      method: "POST",
      body: JSON.stringify({
        name,
        public: isPublic,
        description,
      }),
    },
    { persistRefresh: true },
  ).then((playlist: CreatedPlaylist & { external_urls?: { spotify?: string } }) => ({
    id: playlist.id,
    name: playlist.name,
    spotifyUrl:
      playlist.external_urls?.spotify ?? `https://open.spotify.com/playlist/${playlist.id}`,
  }));
}

export async function addItemsToPlaylist(playlistId: string, uris: string[]) {
  for (let index = 0; index < uris.length; index += 100) {
    const chunk = uris.slice(index, index + 100);

    await spotifyFetch(
      `/playlists/${playlistId}/items`,
      {
        method: "POST",
        body: JSON.stringify({ uris: chunk }),
      },
      { persistRefresh: true },
    );
  }
}
