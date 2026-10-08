create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 2 and 300),
  answer text not null check (char_length(answer) between 2 and 4000),
  position integer not null default 0 check (position between 0 and 999),
  created_at timestamptz not null default now()
);

alter table public.faqs enable row level security;

create policy "Anyone can read faqs"
on public.faqs for select
to anon, authenticated
using (true);

grant select on public.faqs to anon, authenticated;

insert into public.faqs (question, answer, position)
select seed.question, seed.answer, seed.position
from (
  values
    (
      'What is the primary purpose of the Edutech web app?',
      'The Edutech web app is designed to make learning and exam preparation easier for students by helping them set study schedules, providing reminders, offering practice questions, and giving access to study materials and expert guidance.',
      0
    ),
    (
      'How do I get started with the web app?',
      'The Edutech web app is designed to make learning and exam preparation easier for students by helping them set study schedules, providing reminders, offering practice questions, and giving access to study materials and expert guidance.',
      1
    ),
    (
      'How does the study schedule feature work?',
      'The Edutech web app is designed to make learning and exam preparation easier for students by helping them set study schedules, providing reminders, offering practice questions, and giving access to study materials and expert guidance.',
      2
    ),
    (
      'Are there any resources for tracking my progress?',
      'The Edutech web app is designed to make learning and exam preparation easier for students by helping them set study schedules, providing reminders, offering practice questions, and giving access to study materials and expert guidance.',
      3
    )
) as seed(question, answer, position)
where not exists (select 1 from public.faqs);

insert into public.reviews (author_name, rating, body, created_at)
select seed.author_name, seed.rating, seed.body, seed.created_at
from (
  values
    (
      'Haddy Alex',
      5,
      $review$I actually liked reading this book. I thought it was really nice.

I liked that the two main characters were clear with each other when they decided to be clear, and I liked how their relationship unfolded. It was slow, gentle, thoughtful a$review$,
      timestamptz '2026-10-02 12:00:00+00'
    ),
    (
      'Haddy Alex',
      5,
      $review$I actually liked reading this book. I thought it was really nice.

I liked that the two main characters were clear with each other when they decided to be clear, and I liked how their relationship unfolded. It was slow, gentle, thoughtful a$review$,
      timestamptz '2026-10-02 12:00:00+00'
    ),
    (
      'Haddy Alex',
      5,
      $review$I actually liked reading this book. I thought it was really nice.

I liked that the two main characters were clear with each other when they decided to be clear, and I liked how their relationship unfolded. It was slow, gentle, thoughtful a$review$,
      timestamptz '2026-10-02 12:00:00+00'
    )
) as seed(author_name, rating, body, created_at)
where not exists (select 1 from public.reviews);
