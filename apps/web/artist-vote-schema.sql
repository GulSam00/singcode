-- =========================================================
-- 아티스트 마스터 테이블
-- artist_votes/monthly_artist_rankings가 이 테이블을 FK로 참조하므로 먼저 만든다.
-- packages/crawling의 backfillArtists.ts가 songs 테이블을 순회하며 채운다
-- (packages/crawling/.env의 SUPABASE_KEY는 RLS를 우회하는 키라 별도 쓰기 정책 불필요).
-- name은 songs.artist 원문(alias 사전에 매칭되면 그 공식 표기)을 그대로 쓰고,
-- name_ko는 일본 아티스트의 한국어 표기, country_code는 song_tags 언어 태그로 추정한다.
--
-- artist_votes/monthly_artist_rankings가 name을 FK로 참조하므로, 이 테이블이
-- 비어있는 상태(백필 전)에서는 투표가 전부 실패한다 — backfill-artists를 먼저 돌려야 한다.
-- =========================================================
create table public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  name_ko text,
  country_code text check (country_code is null or country_code in ('KR', 'JP', 'US')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index artists_name_ko_idx on public.artists (name_ko);

alter table public.artists enable row level security;

-- 아티스트 투표 검색 자동완성이 로그인 없이도 조회하므로 SELECT는 공개
create policy "artists_select_all"
  on public.artists for select
  using (true);

-- insert/update 정책 없음 — backfill 스크립트(service-role 상당 키)만 쓴다.

-- =========================================================
-- 이달의 아티스트: 아티스트 투표
-- 유저 x 아티스트 x 월 단위로 1행. amount는 "현재 걸어둔 포인트"이며
-- PUT /api/artist-vote 를 통해 자유롭게 증감/삭제된다.
-- artist는 artists.name을 FK로 참조해, artists 테이블에 없는 이름으로는 투표할 수 없다.
-- =========================================================
create table public.artist_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  artist text not null references public.artists(name) on delete restrict,
  vote_month date not null, -- 매월 1일로 정규화 (예: 2026-08-01)
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, artist, vote_month)
);

create index artist_votes_month_artist_idx on public.artist_votes (vote_month, artist);

alter table public.artist_votes enable row level security;

-- 역대 투표자 상세를 로그인 없이도 조회할 수 있어야 하므로 SELECT는 공개
create policy "artist_votes_select_all"
  on public.artist_votes for select
  using (true);

-- 본인 소유 행만 쓰기 가능 (API 라우트가 항상 인증된 user_id로만 씀)
create policy "artist_votes_insert_own"
  on public.artist_votes for insert
  with check (auth.uid() = user_id);

create policy "artist_votes_update_own"
  on public.artist_votes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "artist_votes_delete_own"
  on public.artist_votes for delete
  using (auth.uid() = user_id);

-- =========================================================
-- 이달의 아티스트: 월별 확정 랭킹 (1~10위)
-- 매월 1일 00:00(KST) GitHub Actions가 finalize API를 호출해 전월 결과를 기록한다.
-- artist_votes에서 집계하므로 artist는 항상 artists.name에 존재하는 값이다.
-- =========================================================
create table public.monthly_artist_rankings (
  id uuid primary key default gen_random_uuid(),
  vote_month date not null,
  rank smallint not null check (rank between 1 and 10),
  artist text not null references public.artists(name) on delete restrict,
  total_votes integer not null,
  top_voter_user_id uuid references public.users(id) on delete set null,
  top_voter_amount integer,
  decided_at timestamptz not null default now(),
  unique (vote_month, rank),
  unique (vote_month, artist)
);

alter table public.monthly_artist_rankings enable row level security;

-- 누구나 조회 가능 (역대 결과 공개 페이지)
create policy "monthly_artist_rankings_select_all"
  on public.monthly_artist_rankings for select
  using (true);

-- insert/update/delete 정책은 의도적으로 만들지 않는다.
-- anon/authenticated 롤은 쓰기 불가하며, finalize 배치만 service role key로 RLS를 우회해 쓴다.
