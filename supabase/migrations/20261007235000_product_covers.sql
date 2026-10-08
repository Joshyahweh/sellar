alter table public.products
  add column if not exists front_cover_path text,
  add column if not exists back_cover_path text,
  add column if not exists design_cover_path text;

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read book covers" on storage.objects;
create policy "Public read book covers"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'covers');
