alter table public.orders
  add column confirmed_at timestamptz,
  add column transit_at timestamptz,
  add column delivered_at timestamptz,
  add column cancelled_at timestamptz,
  add column estimated_delivery_on date;

update public.orders
set delivered_at = coalesce(paid_at, updated_at)
where status = 'delivered'
  and delivered_at is null;

create or replace function public.stamp_order_tracking()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'confirmed' and new.confirmed_at is null then
      new.confirmed_at := now();
    elsif new.status = 'transit' and new.transit_at is null then
      new.transit_at := now();
    elsif new.status = 'delivered' and new.delivered_at is null then
      new.delivered_at := now();
    elsif new.status = 'cancelled' and new.cancelled_at is null then
      new.cancelled_at := now();
    end if;
  end if;

  return new;
end;
$$;

create trigger orders_stamp_tracking
before update on public.orders
for each row execute function public.stamp_order_tracking();

revoke all on function public.stamp_order_tracking() from public, anon, authenticated;
