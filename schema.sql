-- Bonk de los Dioses · base de datos (Supabase)
create table if not exists public.profiles(
  id uuid primary key references auth.users on delete cascade,
  name text,
  avatar text,
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select using (true);
drop policy if exists profiles_write on public.profiles;
create policy profiles_write on public.profiles for insert with check (id = auth.uid());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- documentos: "data/users/<uid>/main" (perfil privado) y "scores/<uid>" (clasificación pública)
create table if not exists public.docs(
  path text primary key,
  coll text not null,
  owner uuid not null default auth.uid() references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz default now()
);
create index if not exists docs_coll on public.docs(coll);
alter table public.docs enable row level security;
drop policy if exists docs_read on public.docs;
create policy docs_read on public.docs for select using (coll = 'scores' or owner = auth.uid());
drop policy if exists docs_insert on public.docs;
create policy docs_insert on public.docs for insert with check (
  owner = auth.uid() and (path = 'scores/' || auth.uid()::text or path like 'data/users/' || auth.uid()::text || '/%'));
drop policy if exists docs_update on public.docs;
create policy docs_update on public.docs for update using (owner = auth.uid()) with check (
  owner = auth.uid() and (path = 'scores/' || auth.uid()::text or path like 'data/users/' || auth.uid()::text || '/%'));
-- límite de tamaño por documento (evita abusos)
alter table public.docs drop constraint if exists docs_size;
alter table public.docs add constraint docs_size check (pg_column_size(data) < 200000);
