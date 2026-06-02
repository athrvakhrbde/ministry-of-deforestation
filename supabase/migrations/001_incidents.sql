-- Ministry of Deforestation — incidents schema

create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  lat float8 not null,
  lng float8 not null,
  location_name text not null,
  state text not null,
  district text,
  tree_count integer,
  species text[],
  reason_category text not null check (reason_category in (
    'road_widening', 'metro_rail', 'power_infra', 'real_estate',
    'mining', 'urban_beautification', 'disaster_clearance', 'illegal'
  )),
  reason_detail text,
  project_name text,
  authority text,
  ministry text,
  clearance_status text check (clearance_status in ('cleared', 'no_clearance', 'under_review')),
  ngt_case text,
  source_url text,
  source_type text,
  contributor_id uuid references auth.users,
  verified boolean default false,
  media_urls text[],
  status text default 'ongoing' check (status in ('ongoing', 'completed', 'halted'))
);

create index if not exists idx_incidents_state on incidents(state);
create index if not exists idx_incidents_reason on incidents(reason_category);
create index if not exists idx_incidents_status on incidents(status);
create index if not exists idx_incidents_created on incidents(created_at desc);
create index if not exists idx_incidents_verified on incidents(verified);

alter table incidents enable row level security;

create policy "Public read incidents"
  on incidents for select
  to anon, authenticated
  using (true);

-- No direct inserts from anon; API uses service role

alter publication supabase_realtime add table incidents;

-- Storage bucket (run in dashboard or via API):
-- insert into storage.buckets (id, name, public) values ('incident-media', 'incident-media', true);
