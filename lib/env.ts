import "server-only";

export function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getOptionalEnv(name: string) {
  return process.env[name];
}

export function getRedirectUri() {
  return getEnv("SPOTIFY_REDIRECT_URI");
}
