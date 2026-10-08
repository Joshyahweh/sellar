alter table public.products
  add column if not exists is_display boolean not null default false,
  add column if not exists about text not null default '';

alter table public.products
  drop constraint if exists products_about_length;

alter table public.products
  add constraint products_about_length check (char_length(about) <= 4000);

create unique index if not exists products_one_display
  on public.products ((true))
  where is_display;
