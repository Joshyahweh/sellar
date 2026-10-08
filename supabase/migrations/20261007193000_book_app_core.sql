create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price_kobo integer not null check (price_kobo >= 0),
  delivery_fee_kobo integer not null default 0 check (delivery_fee_kobo >= 0),
  kind text not null check (kind in ('hard_copy', 'e_copy')),
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id),
  quantity integer not null default 1 check (quantity between 1 and 99),
  amount_kobo integer not null default 0 check (amount_kobo >= 0),
  status text not null default 'pending' check (
    status in ('pending', 'awaiting', 'confirmed', 'transit', 'delivered', 'cancelled')
  ),
  country text,
  state text,
  town text,
  landmark text,
  phone text,
  paystack_reference text unique,
  paystack_channel text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_created_at_idx on public.orders (user_id, created_at desc);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  reference text not null unique,
  amount_kobo integer not null check (amount_kobo >= 0),
  status text not null,
  channel text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 180),
  subject text not null check (char_length(subject) between 2 and 180),
  message text not null check (char_length(message) between 8 and 4000),
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.protect_order_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  unit_price integer;
  delivery_fee integer;
  is_service boolean;
begin
  select price_kobo, delivery_fee_kobo
    into unit_price, delivery_fee
  from public.products
  where id = new.product_id;

  if unit_price is null then
    raise exception 'Unknown product';
  end if;

  if new.quantity is null or new.quantity < 1 or new.quantity > 99 then
    raise exception 'Invalid quantity';
  end if;

  new.amount_kobo := unit_price * new.quantity + delivery_fee;
  is_service := coalesce(auth.role(), '') = 'service_role'
    or current_user in ('service_role', 'postgres', 'supabase_admin');

  if tg_op = 'INSERT' then
    if not is_service then
      new.user_id := auth.uid();
      new.status := 'pending';
      new.paystack_reference := null;
      new.paid_at := null;
    end if;
    return new;
  end if;

  if not is_service then
    if old.status <> 'pending' then
      raise exception 'This order can no longer be edited';
    end if;
    new.user_id := old.user_id;
    new.status := 'pending';
    new.paystack_reference := old.paystack_reference;
    new.paid_at := null;
    new.product_id := old.product_id;
  end if;

  return new;
end;
$$;

create trigger orders_protect_row
before insert or update on public.orders
for each row execute function public.protect_order_row();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.enquiries enable row level security;
alter table public.reviews enable row level security;

create policy "Users read their profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users update their profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Anyone can read products"
on public.products for select
to anon, authenticated
using (true);

create policy "Users read their orders"
on public.orders for select
to authenticated
using (auth.uid() = user_id);

create policy "Users create their pending orders"
on public.orders for insert
to authenticated
with check (auth.uid() = user_id and status = 'pending');

create policy "Users update their pending orders"
on public.orders for update
to authenticated
using (auth.uid() = user_id and status = 'pending')
with check (auth.uid() = user_id and status = 'pending');

create policy "Anyone can send an enquiry"
on public.enquiries for insert
to anon, authenticated
with check (true);

create policy "Anyone can read reviews"
on public.reviews for select
to anon, authenticated
using (true);

create policy "Users write their reviews"
on public.reviews for insert
to authenticated
with check (auth.uid() = user_id);

grant select on public.products to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.orders to authenticated;
grant insert on public.enquiries to anon, authenticated;
grant select on public.reviews to anon, authenticated;
grant insert on public.reviews to authenticated;

insert into public.products (slug, name, description, price_kobo, delivery_fee_kobo, kind)
values
  (
    'hard-copy',
    'Hard copy',
    'A beautiful printed copy delivered to your door step',
    350000,
    190200,
    'hard_copy'
  ),
  (
    'e-copy',
    'E-copy',
    'Read instantly on your device. Available in PDF format',
    350000,
    0,
    'e_copy'
  );
