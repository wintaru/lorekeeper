create table if not exists whispers (
  id           uuid primary key default gen_random_uuid(),
  character_id uuid not null references characters(id) on delete cascade,
  message      text not null,
  created_at   timestamptz not null default now()
);

create index if not exists whispers_character_id_idx on whispers(character_id);

alter table whispers enable row level security;
create policy "whispers_select" on whispers for select using (true);
create policy "whispers_insert" on whispers for insert with check ((select auth.role()) = 'service_role');
create policy "whispers_delete" on whispers for delete using ((select auth.role()) = 'service_role');

alter publication supabase_realtime add table whispers;
