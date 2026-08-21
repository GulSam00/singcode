create table public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  name_ko text,
  language_tag_id smallint references public.tags(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint artists_language_tag_id_range check (
    language_tag_id is null or language_tag_id between 100 and 103
  )
);

alter table public.artists enable row level security;

create table public.artist_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  artist text not null references public.artists(name),
  vote_month date not null, -- 매월 1일로 정규화 (예: 2026-08-01)
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, artist, vote_month)
);

create index artist_votes_month_artist_idx on public.artist_votes (vote_month, artist);

alter table public.artist_votes enable row level security;

create table public.monthly_artist_rankings (
  id uuid primary key default gen_random_uuid(),
  vote_month date not null,
  rank smallint not null check (rank between 1 and 10),
  artist text not null references public.artists(name),
  total_votes integer not null,
  top_voter_user_id uuid references public.users(id) on delete set null,
  top_voter_amount integer,
  decided_at timestamptz not null default now(),
  unique (vote_month, rank),
  unique (vote_month, artist)
);

alter table public.monthly_artist_rankings enable row level security;
