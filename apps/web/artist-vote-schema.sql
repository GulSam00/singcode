-- 이달의 아티스트(포인트 투표) 스키마 + RLS 정책.
-- 여러 번 실행해도 안전하도록 작성했으니, 이미 테이블을 만든 환경에서도 이 파일을 그대로 다시 실행하면 된다.

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  name_ko text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 이미 만들어진 환경에도 컬럼을 채워 넣는다. 랭킹 1위 액자에 쓰는 아티스트 사진 URL이다.
alter table public.artists add column if not exists image_url text;

alter table public.artists enable row level security;

create table if not exists public.artist_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  artist text not null references public.artists(name),
  vote_month date not null, -- 매월 1일로 정규화 (예: 2026-08-01)
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, artist, vote_month)
);

create index if not exists artist_votes_month_artist_idx on public.artist_votes (vote_month, artist);

alter table public.artist_votes enable row level security;

create table if not exists public.monthly_artist_rankings (
  id uuid primary key default gen_random_uuid(),
  vote_month date not null,
  rank smallint not null check (rank between 1 and 30),
  artist text not null references public.artists(name),
  total_votes integer not null,
  top_voter_user_id uuid references public.users(id) on delete set null,
  top_voter_amount integer,
  decided_at timestamptz not null default now(),
  unique (vote_month, rank),
  unique (vote_month, artist)
);

-- 최초 버전은 1~10위만 저장했다. 11~30위 구간을 화면에 쓰기 위해 제약을 넓힌다.
-- 제약 이름은 인라인 check에 postgres가 붙이는 기본 이름이다.
alter table public.monthly_artist_rankings
  drop constraint if exists monthly_artist_rankings_rank_check;
alter table public.monthly_artist_rankings
  add constraint monthly_artist_rankings_rank_check check (rank between 1 and 30);

alter table public.monthly_artist_rankings enable row level security;

-- RLS 정책 --------------------------------------------------------------
-- 앱의 API 라우트는 사용자 세션(anon 키)으로 Supabase에 접근하므로, 정책이 없으면
-- RLS가 모든 행을 가려 검색·랭킹이 조용히 빈 배열로 돌아온다.

-- artists: 아티스트 검색/자동완성에 필요해 누구나 읽는다.
-- 쓰기는 백필 스크립트(service_role)만 하므로 정책을 주지 않는다.
drop policy if exists "artists_select_public" on public.artists;
create policy "artists_select_public" on public.artists for select using (true);

-- monthly_artist_rankings: 확정된 월간 결과는 공개 데이터다.
-- 쓰기는 finalize 라우트(service_role) 전용이라 정책이 없다.
drop policy if exists "monthly_artist_rankings_select_public" on public.monthly_artist_rankings;
create policy "monthly_artist_rankings_select_public" on public.monthly_artist_rankings
  for select using (true);

-- artist_votes: 본인 투표는 언제나 볼 수 있고, 남의 투표는 "이미 확정된 (월, 아티스트)"만 공개한다.
-- 이렇게 두지 않으면 아직 집계 전인 이번 달 실시간 득표 현황이 그대로 새어나간다.
drop policy if exists "artist_votes_select_own_or_finalized" on public.artist_votes;
create policy "artist_votes_select_own_or_finalized" on public.artist_votes
  for select using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.monthly_artist_rankings r
      where r.vote_month = artist_votes.vote_month
        and r.artist = artist_votes.artist
    )
  );

-- 투표 등록/수정/삭제는 본인 행만. upsert가 insert와 update 정책을 모두 타므로 둘 다 필요하다.
drop policy if exists "artist_votes_insert_own" on public.artist_votes;
create policy "artist_votes_insert_own" on public.artist_votes
  for insert with check (auth.uid() = user_id);

drop policy if exists "artist_votes_update_own" on public.artist_votes;
create policy "artist_votes_update_own" on public.artist_votes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "artist_votes_delete_own" on public.artist_votes;
create policy "artist_votes_delete_own" on public.artist_votes
  for delete using (auth.uid() = user_id);
