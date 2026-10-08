alter table public.reviews
  add column if not exists status text not null default 'approved'
    check (status in ('pending', 'approved', 'rejected')),
  add column if not exists rejection_reason text
    check (rejection_reason is null or char_length(rejection_reason) <= 500);

drop policy if exists "Anyone can read reviews" on public.reviews;
drop policy if exists "Anyone can read approved reviews" on public.reviews;

create policy "Anyone can read approved reviews"
on public.reviews for select
to anon, authenticated
using (status = 'approved');

revoke insert, update, delete on public.reviews from public, anon, authenticated;
