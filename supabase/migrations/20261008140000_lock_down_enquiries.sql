drop policy if exists "Anyone can send an enquiry" on public.enquiries;

revoke insert on public.enquiries from public, anon, authenticated;
