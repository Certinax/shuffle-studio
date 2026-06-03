import { NextRequest, NextResponse } from "next/server";

import { getRequestUrl } from "@/lib/request-url";
import { SESSION_COOKIE } from "@/lib/session-cookie";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(getRequestUrl(request, "/"), 303);

  response.cookies.delete(SESSION_COOKIE);

  return response;
}
