-- Maps feature: campaign_maps table, campaign access columns, storage bucket

-- ============================================================
-- campaign_maps table
-- ============================================================
create table if not exists campaign_maps (
  id           uuid primary key default gen_random_uuid(),
  campaign_id  uuid not null references campaigns(id) on delete cascade,
  name         text not null,
  type         text not null check (type in ('town', 'city', 'world', 'dungeon')),
  storage_path text not null,
  image_url    text not null,
  created_at   timestamptz not null default now()
);

create index if not exists campaign_maps_campaign_id_idx on campaign_maps(campaign_id);

-- RLS for campaign_maps
alter table campaign_maps enable row level security;
create policy "campaign_maps_select" on campaign_maps for select using (true);
create policy "campaign_maps_insert" on campaign_maps for insert with check ((select auth.role()) = 'service_role');
create policy "campaign_maps_update" on campaign_maps for update using ((select auth.role()) = 'service_role');
create policy "campaign_maps_delete" on campaign_maps for delete using ((select auth.role()) = 'service_role');

-- ============================================================
-- Extend campaigns with map access columns
-- ============================================================
alter table campaigns add column if not exists map_access_granted boolean not null default false;
alter table campaigns add column if not exists shared_map_ids     text[]  not null default '{}';
alter table campaigns add column if not exists map_viewport       jsonb;

-- ============================================================
-- Realtime
-- ============================================================
alter publication supabase_realtime add table campaign_maps;
-- campaigns table is already in realtime if added previously; add only if missing
do $$
begin
  perform pg_publication_tables.tablename
    from pg_publication_tables
   where pubname = 'supabase_realtime' and tablename = 'campaigns';
  if not found then
    execute 'alter publication supabase_realtime add table campaigns';
  end if;
end $$;

-- ============================================================
-- Storage bucket (campaign-maps, public)
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'campaign-maps',
  'campaign-maps',
  true,
  10485760,  -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Storage RLS: anyone can read (bucket is public), only service role can write/delete
create policy "campaign_maps_storage_insert" on storage.objects
  for insert with check (bucket_id = 'campaign-maps' and (select auth.role()) = 'service_role');

create policy "campaign_maps_storage_delete" on storage.objects
  for delete using (bucket_id = 'campaign-maps' and (select auth.role()) = 'service_role');
