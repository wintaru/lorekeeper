-- Quests table: DM-managed quests published to players

create table if not exists quests (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  title text not null,
  description text,
  giver text,
  objective text,
  location text,
  complications text,
  reward text,
  difficulty smallint not null default 1 check (difficulty between 1 and 5),
  quest_type text,
  is_optional boolean not null default true,
  is_public boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed')),
  created_at timestamptz not null default now()
);

alter table quests enable row level security;
create policy "quests_select" on quests for select using (true);
create policy "quests_insert" on quests for insert with check ((select auth.role()) = 'service_role');
create policy "quests_update" on quests for update using ((select auth.role()) = 'service_role');
create policy "quests_delete" on quests for delete using ((select auth.role()) = 'service_role');

alter publication supabase_realtime add table quests;
