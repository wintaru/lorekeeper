-- XP tracking
alter table characters add column if not exists xp integer not null default 0;

-- Custom random tables
create table if not exists custom_tables (
  id           uuid primary key default gen_random_uuid(),
  campaign_id  uuid not null references campaigns(id) on delete cascade,
  name         text not null,
  entries      jsonb not null default '[]',
  created_at   timestamptz not null default now()
);
create index if not exists custom_tables_campaign_id_idx on custom_tables(campaign_id);

alter table custom_tables enable row level security;
create policy "custom_tables_select" on custom_tables for select using (true);
create policy "custom_tables_insert" on custom_tables for insert with check ((select auth.role()) = 'service_role');
create policy "custom_tables_update" on custom_tables for update using ((select auth.role()) = 'service_role');
create policy "custom_tables_delete" on custom_tables for delete using ((select auth.role()) = 'service_role');

alter publication supabase_realtime add table custom_tables;

-- Update last_active_at trigger on character activity
create or replace function update_campaign_last_active()
returns trigger language plpgsql as $$
begin
  update campaigns set last_active_at = now() where id = NEW.campaign_id;
  return NEW;
end;
$$;

create trigger characters_update_last_active
  after insert or update on characters
  for each row execute function update_campaign_last_active();
