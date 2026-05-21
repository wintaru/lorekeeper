-- LoreKeeper schema
-- Apply this in your Supabase project: SQL Editor > New Query > paste & run

-- ============================================================
-- Campaigns
-- ============================================================
create table if not exists campaigns (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  dm_pin_hash     text not null,
  created_at      timestamptz not null default now(),
  last_active_at  timestamptz not null default now(),
  expires_at      timestamptz not null default now() + interval '90 days'
);

-- ============================================================
-- Characters
-- ============================================================
create table if not exists characters (
  id                uuid primary key default gen_random_uuid(),
  campaign_id       uuid not null references campaigns(id) on delete cascade,
  player_name       text not null,
  character_name    text not null,
  class             text not null,
  level             int not null default 1,
  max_hp            int not null default 10,
  current_hp        int not null default 10,
  armor_class       int not null default 10,
  spell_slots       jsonb not null default '[]',
  conditions        jsonb not null default '[]',
  push_subscription jsonb,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

create index if not exists characters_campaign_id_idx on characters(campaign_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table campaigns  enable row level security;
alter table characters enable row level security;

-- Campaigns: readable by anyone (join by code flow)
create policy "campaigns_select" on campaigns
  for select using (true);

-- Campaigns: only service role can mutate (via API routes)
-- Split into discrete operations to avoid overlapping permissive policies on SELECT
create policy "campaigns_insert" on campaigns
  for insert with check ((select auth.role()) = 'service_role');

create policy "campaigns_update" on campaigns
  for update using ((select auth.role()) = 'service_role');

create policy "campaigns_delete" on campaigns
  for delete using ((select auth.role()) = 'service_role');

-- Characters: readable by anyone in the same campaign
create policy "characters_select" on characters
  for select using (true);

-- Characters: only service role can mutate
create policy "characters_insert" on characters
  for insert with check ((select auth.role()) = 'service_role');

create policy "characters_update" on characters
  for update using ((select auth.role()) = 'service_role');

create policy "characters_delete" on characters
  for delete using ((select auth.role()) = 'service_role');

-- ============================================================
-- Realtime
-- ============================================================
alter publication supabase_realtime add table characters;
