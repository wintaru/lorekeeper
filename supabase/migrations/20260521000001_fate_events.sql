-- ============================================================
-- Fate Events
-- ============================================================
create type fate_event_type as enum (
  'attack', 'curse', 'windfall', 'betrayal', 'mystery'
);

create table if not exists fate_events (
  id                    uuid primary key default gen_random_uuid(),
  campaign_id           uuid not null references campaigns(id) on delete cascade,
  event_type            fate_event_type not null,
  target_character_id   uuid not null references characters(id) on delete cascade,
  revealed_at           timestamptz,
  dm_note               text,
  created_at            timestamptz not null default now()
);

create index if not exists fate_events_campaign_id_idx on fate_events(campaign_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table fate_events enable row level security;

create policy "fate_events_select" on fate_events
  for select using (true);

create policy "fate_events_insert" on fate_events
  for insert with check ((select auth.role()) = 'service_role');

create policy "fate_events_update" on fate_events
  for update using ((select auth.role()) = 'service_role');

create policy "fate_events_delete" on fate_events
  for delete using ((select auth.role()) = 'service_role');

-- ============================================================
-- Realtime (for the reveal broadcast)
-- ============================================================
alter publication supabase_realtime add table fate_events;
