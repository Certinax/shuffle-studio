import { NextRequest, NextResponse } from "next/server";

import { getRequestUrl } from "@/lib/request-url";
import { SESSION_COOKIE } from "@/lib/session-cookie";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    return NextResponse.redirect(getRequestUrl(request, "/"));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/playlists/:path*"],
};
