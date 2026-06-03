import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { getEnv } from "@/lib/env";
import { SESSION_COOKIE } from "@/lib/session-cookie";

const OAUTH_STATE_COOKIE = "spotify_shuffle_state";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type SessionUser = {
  id: string;
  displayName: string;
  imageUrl?: string;
  profileUrl?: string;
};

export type SpotifySession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: SessionUser;
};

export type PublicSession = {
  user: SessionUser;
};

function sessionKey() {
  return createHash("sha256").update(getEnv("SESSION_SECRET")).digest();
}

export const getSession = cache(async (): Promise<SpotifySession | null> => {
  const cookieStore = await cookies();
  const encrypted = cookieStore.get(SESSION_COOKIE)?.value;

  if (!encrypted) {
    return null;
  }

  try {
    const { payload } = await jwtDecrypt(encrypted, sessionKey(), {
      clockTolerance: 15,
    });

    return {
      accessToken: String(payload.accessToken),
      refreshToken: String(payload.refreshToken),
      expiresAt: Number(payload.expiresAt),
      user: payload.user as SessionUser,
    };
  } catch {
    return null;
  }
});

export async function getPublicSession(): Promise<PublicSession | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return { user: session.user };
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

async function encryptSession(session: SpotifySession) {
  return new EncryptJWT({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
    user: session.user,
  })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .encrypt(sessionKey());
}

export async function setSession(
  session: SpotifySession,
  response?: NextResponse,
) {
  const encrypted = await encryptSession(session);

  if (response) {
    response.cookies.set(SESSION_COOKIE, encrypted, sessionCookieOptions());

    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encrypted, sessionCookieOptions());
}

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
}

export async function createOAuthState() {
  const state = randomBytes(24).toString("hex");
  const cookieStore = await cookies();

  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return state;
}

export async function consumeOAuthState(state: string | null) {
  const cookieStore = await cookies();
  const expected = cookieStore.get(OAUTH_STATE_COOKIE)?.value;

  cookieStore.delete(OAUTH_STATE_COOKIE);

  return Boolean(state && expected && state === expected);
}

