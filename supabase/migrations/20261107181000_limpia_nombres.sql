-- Limpia el nombre antes de guardarlo para que un nombre raro de Google no impida entrar
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
  if new.name is not null then
    new.name := left(trim(regexp_replace(new.name, '[<>[:cntrl:]]', '', 'g')), 24);
    if char_length(new.name) < 2 then new.name := 'Jugador'; end if;
  end if;
  if new.avatar is not null and (new.avatar !~ '^https://' or char_length(new.avatar) > 500) then
    new.avatar := null;
  end if;
  return new;
end $$;
