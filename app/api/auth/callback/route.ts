import { NextRequest, NextResponse } from "next/server";

import { getRequestUrl } from "@/lib/request-url";
import { exchangeCodeForSession } from "@/lib/spotify/client";
import { consumeOAuthState, setSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const isValidState = await consumeOAuthState(state);

  if (!code || !isValidState) {
    return NextResponse.redirect(getRequestUrl(request, "/?auth=failed"));
  }

  try {
    const session = await exchangeCodeForSession(code);
    const response = NextResponse.redirect(getRequestUrl(request, "/playlists"));

    await setSession(session, response);

    return response;
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/?auth=failed"));
  }
}
