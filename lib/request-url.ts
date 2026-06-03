import type { NextRequest } from "next/server";

export function getRequestOrigin(request: NextRequest) {
  const host = request.headers.get("host");

  if (!host) {
    return new URL(request.url).origin;
  }

  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || new URL(request.url).protocol.replace(":", "");

  return `${protocol}://${host}`;
}

export function getRequestUrl(request: NextRequest, pathname: string) {
  return new URL(pathname, getRequestOrigin(request));
}
