create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.protect_order_row() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;

create policy "Payments stay server-side"
on public.payments
for select
to authenticated
using (false);
