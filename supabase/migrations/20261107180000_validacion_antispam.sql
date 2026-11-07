-- Validación en el servidor y límites anti-spam (lo mismo que valida el cliente, pero sin poder saltárselo)

-- Nombres: 2–24 caracteres, sin caracteres de control ni < >
alter table public.profiles drop constraint if exists profiles_name_ok;
alter table public.profiles add constraint profiles_name_ok
  check (name is null or (char_length(name) between 2 and 24 and name !~ '[<>[:cntrl:]]'));
alter table public.profiles drop constraint if exists profiles_avatar_ok;
alter table public.profiles add constraint profiles_avatar_ok
  check (avatar is null or (char_length(avatar) <= 500 and avatar ~ '^https://'));

-- Clasificación: documento pequeño, puntuación numérica en rango y clan corto y limpio
alter table public.docs drop constraint if exists docs_score_ok;
alter table public.docs add constraint docs_score_ok check (
  coll <> 'scores' or (
    pg_column_size(data) < 8000
    and jsonb_typeof(data->'score') = 'number'
    and (data->>'score')::numeric between 0 and 1e13
    and (data->'endless' is null or jsonb_typeof(data->'endless') = 'number')
    and char_length(coalesce(data->>'clan', '')) <= 20
    and coalesce(data->>'clan', '') !~ '[<>[:cntrl:]]'
  ));

-- Amigos: como mucho 200 por jugador y 30 altas por hora
create or replace function public.friends_limit() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.friends where user_id = new.user_id) >= 200 then
    raise exception 'Has llegado al máximo de 200 amigos' using errcode = 'P0001';
  end if;
  if (select count(*) from public.friends where user_id = new.user_id and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'Demasiadas solicitudes; prueba más tarde' using errcode = 'P0001';
  end if;
  return new;
end $$;
revoke execute on function public.friends_limit() from public, anon, authenticated;
drop trigger if exists friends_limit_trg on public.friends;
create trigger friends_limit_trg before insert on public.friends for each row execute function public.friends_limit();
