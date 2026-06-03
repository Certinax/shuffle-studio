import { NextRequest, NextResponse } from "next/server";

import { exchangeCodeForSession } from "@/lib/spotify/client";
import { consumeOAuthState, setSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const isValidState = await consumeOAuthState(state);

  if (!code || !isValidState) {
    return NextResponse.redirect(new URL("/?auth=failed", request.url));
  }

  try {
    const session = await exchangeCodeForSession(code);
    const response = NextResponse.redirect(new URL("/playlists", request.url));

    await setSession(session, response);

    return response;
  } catch {
    return NextResponse.redirect(new URL("/?auth=failed", request.url));
  }
}
