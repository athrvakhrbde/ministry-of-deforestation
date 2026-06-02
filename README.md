# Ministry of Deforestation

A civic accountability tool mapping trees felled across India — crowdsourced incidents on a live Mapbox map with Supabase backend.

**Not an official government website.** Satirical archival aesthetic for environmental transparency.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Mapbox GL JS + react-map-gl
- Supabase (PostgreSQL, Storage, Realtime)
- Tailwind CSS + custom design tokens
- Recharts (dashboard)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | [Mapbox](https://account.mapbox.com/) public token |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only, for POST/uploads) |

**Without Supabase:** the app runs with 90+ built-in seed incidents across India (no database required).

### 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run [`supabase/migrations/001_incidents.sql`](supabase/migrations/001_incidents.sql) in the SQL Editor
3. Run [`supabase/seed.sql`](supabase/seed.sql) for 25 sample incidents
4. Enable **Realtime** on the `incidents` table (Database → Replication)
5. Create storage bucket `incident-media` (public read)

```sql
insert into storage.buckets (id, name, public) values ('incident-media', 'incident-media', true);
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

| Path | Description |
|------|-------------|
| `/` | Full-screen map with filters and incident sidebar |
| `/submit` | Citizen incident report form |
| `/incident/[id]` | Full incident dossier |
| `/dashboard` | Aggregate statistics and charts |

## Live news ingest engine

The site pulls **real-time environmental news** from RSS feeds (Google News, Down To Earth, The Hindu) and the GDELT API, classifies articles about tree felling / deforestation in India, and creates map incidents automatically.

| Schedule | Daily ~6:00 AM UTC on Vercel Hobby (once/day); use Pro for twice daily |
|----------|-------------------------------------|
| Cron (Vercel) | `vercel.json` → `GET /api/cron/ingest` |
| Local manual | `npm run ingest` (dev server must be running) |
| Auto on visit | `/api/ingest/status` triggers sync if last run &gt; 12h ago |

**Env:** set `CRON_SECRET` in `.env.local` for production cron auth.

Without Supabase, ingested incidents are stored in `data/live-incidents.json` and merged with seed data. With Supabase, rows are inserted with `source_type: news` and deduped via `source_hash`.

The homepage shows a **live status bar** (sync state, last ingest, next run) and polls for new incidents every 60s.

## API

- `GET /api/incidents` — list/filter incidents
- `POST /api/incidents` — create incident (service role)
- `POST /api/incidents/upload` — upload media files
- `GET /api/stats` — dashboard aggregates
- `GET /api/ingest/status` — live ingest status (+ optional `?sync=1` to trigger)
- `GET/POST /api/cron/ingest` — run news ingest (requires `CRON_SECRET` or dev mode)

## Project Structure

```
app/           Pages and API routes
components/    Map, sidebar, forms, header
hooks/         useIncidents, useMapFilters
lib/           Supabase clients, schemas, constants
public/geo/    India state outlines + forest overlay GeoJSON
supabase/      SQL migration and seed data
```

## Deploy to Vercel

1. Push this repo to GitHub (see below).
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Add environment variables from `.env.local.example`:
   - **Required for cron:** `CRON_SECRET` (random string; Vercel Cron sends `x-vercel-cron`)
   - **Optional:** `NEXT_PUBLIC_MAPBOX_TOKEN`, Supabase keys, `NEXT_PUBLIC_APP_URL`
4. Deploy. Cron runs twice daily via `vercel.json` (`/api/cron/ingest`).

```bash
npm run build   # verify locally before deploy
```

Production uses **MapLibre + Carto dark tiles** when no Mapbox token is set.

## License

MIT — use for civic journalism and environmental accountability.
