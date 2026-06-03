export type SpotifyImage = {
  url: string;
  width?: number | null;
  height?: number | null;
};

export type PlaylistSummary = {
  id: string;
  name: string;
  description: string;
  isPublic: boolean | null;
  imageUrl?: string;
  ownerName: string;
  ownerId: string;
  isCollaborative: boolean;
  canReadItems: boolean;
  trackCount: number;
  spotifyUrl: string;
};

export type PlaylistDetails = PlaylistSummary;

export type TrackSummary = {
  id: string;
  name: string;
  uri: string;
  artists: string;
  albumName: string;
  imageUrl?: string;
  durationMs: number;
};

export type CreatedPlaylist = {
  id: string;
  name: string;
  spotifyUrl: string;
};

export type PlaylistVisibility = "same" | "public" | "private";
