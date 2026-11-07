-- Permite que cada jugador borre su cuenta y todos sus datos desde el perfil (derecho de supresión)
create or replace function public.delete_my_account() returns void language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  -- profiles, docs y friends se borran en cascada desde auth.users
  delete from auth.users where id = me;
end $$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
