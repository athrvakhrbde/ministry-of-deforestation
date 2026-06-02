-- Run after 001_incidents.sql
-- Creates public media bucket for incident uploads

insert into storage.buckets (id, name, public)
values ('incident-media', 'incident-media', true)
on conflict (id) do nothing;

-- Public read policy for incident media
create policy "Public read incident media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'incident-media');
