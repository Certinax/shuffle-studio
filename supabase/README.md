# Supabase shuffle stats

## 1. Run SQL

Supabase dashboard → **SQL** → **New query** → paste and run:

`migrations/20260603235640_shuffle_events.sql`

## 2. Env (server only)

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

Service role key: **Project Settings → API → service_role**. Restart `npm run dev` after saving.

## 3. Access

| Caller | `shuffle_events` |
|--------|------------------|
| Publishable / anon key | Blocked (revoked, no RLS policies) |
| App server (`SUPABASE_SERVICE_ROLE_KEY`) | `select` + `insert` (bypasses RLS) |
