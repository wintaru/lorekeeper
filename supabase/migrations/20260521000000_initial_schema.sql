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

-- Campaigns are readable by anyone (join by code flow)
create policy "campaigns_read" on campaigns
  for select using (true);

-- Only the service role can insert/update campaigns (via API routes)
create policy "campaigns_write" on campaigns
  for all using (auth.role() = 'service_role');

-- Characters are readable by anyone in the same campaign
create policy "characters_read" on characters
  for select using (true);

-- Characters are writable only via service role
create policy "characters_write" on characters
  for all using (auth.role() = 'service_role');

-- ============================================================
-- Realtime
-- ============================================================
alter publication supabase_realtime add table characters;
