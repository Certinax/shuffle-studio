# Shuffle Studio

A polished Next.js 16 app that connects to Spotify, loads your playlists, shuffles all playable tracks from a selected playlist, and creates a new playlist named `shuffled-{iteration}-{original-playlist-name}`.

## Stack

- Next.js 16.2.7 App Router with Cache Components enabled
- React 19, TypeScript, Tailwind CSS v4
- shadcn-style Radix primitives
- Spotify Authorization Code OAuth
- Vercel Hobby-compatible deployment

## Spotify setup

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Add redirect URIs:
   - Local: `http://127.0.0.1:3000/api/auth/callback`
   - Production: `https://<your-vercel-app>.vercel.app/api/auth/callback`
3. In Development Mode, add your Spotify account under **Users and Access**.
4. Copy the client ID and client secret.

Spotify Development Mode is intended for personal projects and allows up to 5 allowlisted users. The app owner needs a Spotify Premium account under Spotify's current platform rules.

## Local development

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```bash
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback
SESSION_SECRET=generate-a-long-random-secret
```

Run the app:

```bash
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Use `127.0.0.1` so the redirect URI matches Spotify exactly.

## Deploy on Vercel

1. Push the repo to GitHub.
2. Import it into Vercel.
3. Set the same environment variables in Vercel, using the production redirect URI.
4. Add the production redirect URI in the Spotify Dashboard.
5. Redeploy after changing env vars.

## Shuffle stats (optional)

To show studio-wide and per-user shuffle counters in the header and home page:

1. Create a [Supabase](https://supabase.com) project.
2. Run the SQL in `supabase/migrations/` — see `supabase/README.md`.
3. Add **server-only** vars to `.env.local` (and Vercel) — see `supabase/README.md` for the service role key location.

Counters stay hidden until `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set. No Supabase keys are sent to the browser.

## Notes

- The app never exposes the Spotify client secret or refresh token to browser JavaScript.
- Local files and unavailable Spotify tracks are skipped because Spotify cannot add them to a new playlist through the Web API.
- Spotify allows adding up to 100 playlist items per request, so tracks are batched server-side.
