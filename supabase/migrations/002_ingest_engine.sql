-- News ingest engine tables

alter table incidents add column if not exists source_hash text;

create unique index if not exists idx_incidents_source_hash
  on incidents(source_hash) where source_hash is not null;

create table if not exists ingest_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  articles_fetched int default 0,
  incidents_created int default 0,
  incidents_skipped int default 0,
  error_message text
);

create index if not exists idx_ingest_runs_started on ingest_runs(started_at desc);

alter publication supabase_realtime add table ingest_runs;
