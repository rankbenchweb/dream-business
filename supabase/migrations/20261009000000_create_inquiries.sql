-- The Dream Business: inquiries received from the promotion and contact forms.
-- NOT YET APPLIED. Additive only: creates one new table; touches nothing else.
--
-- Access model: the website writes through its server-side API route using the
-- service role key, which bypasses RLS. RLS is enabled with no policies, so the
-- public (anon) key can neither read nor write this table.

create table if not exists public.inquiries (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  type         text not null check (type in ('directory','self-service','growth','enterprise','partnership','general')),
  name         text not null check (char_length(name) between 2 and 120),
  email        text not null check (char_length(email) <= 320),
  company      text check (char_length(company) <= 160),
  website      text check (char_length(website) <= 500),
  country      text check (char_length(country) <= 80),
  promote      text check (char_length(promote) <= 100),
  budget       text check (char_length(budget) <= 60),
  message      text not null check (char_length(message) between 20 and 4000),
  source_path  text check (char_length(source_path) <= 200),
  status       text not null default 'new' check (status in ('new','in_review','replied','closed','spam'))
);

alter table public.inquiries enable row level security;

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx on public.inquiries (status);
