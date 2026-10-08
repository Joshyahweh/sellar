alter table public.profiles
  add column if not exists role text not null default 'customer';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('customer', 'admin'));

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is not null then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;

create trigger profiles_protect_role
before update on public.profiles
for each row execute function public.protect_profile_role();

revoke all on function public.protect_profile_role() from public, anon, authenticated;

drop policy if exists "Users write their reviews" on public.reviews;

revoke insert on public.reviews from anon, authenticated;
