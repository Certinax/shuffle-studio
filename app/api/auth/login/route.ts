import { NextRequest, NextResponse } from "next/server";

import { getEnv, getRedirectUri } from "@/lib/env";
import { getRequestOrigin } from "@/lib/request-url";
import { createOAuthState } from "@/lib/session";

const scopes = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
];

export async function GET(request: NextRequest) {
  const redirectUri = getRedirectUri();
  const callbackOrigin = new URL(redirectUri).origin;
  const requestOrigin = getRequestOrigin(request);

  if (requestOrigin !== callbackOrigin) {
    return NextResponse.redirect(new URL("/api/auth/login", callbackOrigin));
  }

  const state = await createOAuthState();
  const authorizeUrl = new URL("https://accounts.spotify.com/authorize");

  authorizeUrl.searchParams.set("client_id", getEnv("SPOTIFY_CLIENT_ID"));
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", scopes.join(" "));
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("show_dialog", "false");

  return NextResponse.redirect(authorizeUrl);
}
