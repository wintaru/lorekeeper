-- World Layer migration: NPC tracking, locations, session notes, inventory, loot

-- Extend campaigns with gold and shared inventory
alter table campaigns add column if not exists gold integer not null default 0;
alter table campaigns add column if not exists shared_items jsonb not null default '[]';

-- Extend characters with personal loot
alter table characters add column if not exists loot jsonb not null default '[]';

-- NPC table
create table if not exists npcs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  faction text,
  last_location text,
  notes text,
  relationships jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- Locations table
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  visited boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

-- Session notes table
create table if not exists session_notes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

-- RLS: npcs
alter table npcs enable row level security;
create policy "npcs_select" on npcs for select using (true);
create policy "npcs_insert" on npcs for insert with check ((select auth.role()) = 'service_role');
create policy "npcs_update" on npcs for update using ((select auth.role()) = 'service_role');
create policy "npcs_delete" on npcs for delete using ((select auth.role()) = 'service_role');

-- RLS: locations
alter table locations enable row level security;
create policy "locations_select" on locations for select using (true);
create policy "locations_insert" on locations for insert with check ((select auth.role()) = 'service_role');
create policy "locations_update" on locations for update using ((select auth.role()) = 'service_role');
create policy "locations_delete" on locations for delete using ((select auth.role()) = 'service_role');

-- RLS: session_notes
alter table session_notes enable row level security;
create policy "session_notes_select" on session_notes for select using (true);
create policy "session_notes_insert" on session_notes for insert with check ((select auth.role()) = 'service_role');
create policy "session_notes_update" on session_notes for update using ((select auth.role()) = 'service_role');
create policy "session_notes_delete" on session_notes for delete using ((select auth.role()) = 'service_role');

-- Add new tables to realtime publication
alter publication supabase_realtime add table npcs;
alter publication supabase_realtime add table locations;
alter publication supabase_realtime add table session_notes;
