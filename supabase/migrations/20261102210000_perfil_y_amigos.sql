-- código de amigo corto y único por jugador, nombre editable (máx. 24) y lista de amigos
alter table public.profiles add column if not exists code text;
create unique index if not exists profiles_code on public.profiles(code);
create or replace function public.profiles_set_code() returns trigger language plpgsql set search_path = public as $$
declare c text;
begin
  if new.code is null then
    loop
      c := translate(upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)), '01', 'XY');
      exit when not exists (select 1 from public.profiles where code = c);
    end loop;
    new.code := c;
  end if;
  if new.name is not null then new.name := left(trim(new.name), 24); end if;
  return new;
end $$;
drop trigger if exists profiles_code_trg on public.profiles;
create trigger profiles_code_trg before insert or update on public.profiles for each row execute function public.profiles_set_code();
create or replace function public.profiles_keep_code() returns trigger language plpgsql set search_path = public as $$
begin
  if old.code is not null then new.code := old.code; end if;
  return new;
end $$;
drop trigger if exists profiles_keep_code_trg on public.profiles;
create trigger profiles_keep_code_trg before update on public.profiles for each row execute function public.profiles_keep_code();

create table if not exists public.friends(
  user_id uuid not null references auth.users on delete cascade,
  friend_id uuid not null references auth.users on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);
create index if not exists friends_friend on public.friends(friend_id);
alter table public.friends enable row level security;
drop policy if exists friends_read on public.friends;
create policy friends_read on public.friends for select using (user_id = (select auth.uid()) or friend_id = (select auth.uid()));
drop policy if exists friends_add on public.friends;
create policy friends_add on public.friends for insert with check (user_id = (select auth.uid()));
drop policy if exists friends_del on public.friends;
create policy friends_del on public.friends for delete using (user_id = (select auth.uid()));
