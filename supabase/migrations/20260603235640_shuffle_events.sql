create table public.shuffle_events (
  id uuid primary key default gen_random_uuid(),
  spotify_user_id text not null,
  source_playlist_id text not null,
  source_playlist_name text not null,
  track_count integer not null,
  created_at timestamptz not null default now()
);

alter table public.shuffle_events enable row level security;

revoke all on table public.shuffle_events from public, anon, authenticated;

grant select, insert on table public.shuffle_events to service_role;
