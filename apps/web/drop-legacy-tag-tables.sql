-- 20261027-1008 — 레거시 태그·추천(thumb) 테이블 삭제
-- Supabase SQL Editor에서 섹션 단위로 나눠 실행한다. 한 번에 전체 실행하지 말 것.
--
-- 대상
--   public.thumb_logs                (추천 로그)
--   public.song_tags                 (곡 ↔ 태그 매핑, tags.id FK)
--   public.tags                      (언어 태그 마스터)
--   public.artists.language_tag_id   (tags.id FK + artists_language_tag_id_range check)
--
-- 진행 조건: Vercel 프로덕션 배포 커밋에 api/search의 thumb_logs 조인 제거(#313)가 포함돼 있을 것.
--           origin/main(dce444f)의 apps/web/src에는 thumb_logs·song_tags 참조가 없다.


-- ============================================================
-- 0. 사전 점검 (읽기 전용 — 몇 번 실행해도 안전)
-- ============================================================

-- 0-1. 대상 존재 여부. null이면 이미 없는 객체다.
select
  to_regclass('public.thumb_logs') as thumb_logs,
  to_regclass('public.song_tags')  as song_tags,
  to_regclass('public.tags')       as tags,
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'artists'
      and column_name = 'language_tag_id') as artists_language_tag_id_exists;

-- 0-2. 행 수 (백업 판단용). 0-1에서 null인 테이블 줄은 지우고 실행한다.
select 'thumb_logs' as target, count(*) from public.thumb_logs
union all select 'song_tags', count(*) from public.song_tags
union all select 'tags', count(*) from public.tags
union all select 'artists.language_tag_id not null', count(*)
  from public.artists where language_tag_id is not null;

-- 0-3. 대상을 참조하는 FK. 아래 4개 외의 줄이 나오면 멈추고 확인한다.
--      예상: song_tags → tags, artists → tags, (song_tags/thumb_logs → songs·users는 참조"하는" 쪽이라 안 나온다)
select
  c.conrelid::regclass  as referencing_table,
  c.conname             as constraint_name,
  c.confrelid::regclass as referenced_table
from pg_constraint c
where c.contype = 'f'
  and c.confrelid in (
    select oid from pg_class
    where oid in (to_regclass('public.thumb_logs'),
                  to_regclass('public.song_tags'),
                  to_regclass('public.tags'))
  );

-- 0-4. 대상에 의존하는 뷰. 결과가 있으면 멈춘다 (drop이 실패하거나, cascade 시 뷰가 같이 사라진다).
select distinct
  v.oid::regclass as dependent_view,
  d.refobjid::regclass as depends_on
from pg_depend d
join pg_rewrite r on r.oid = d.objid
join pg_class v   on v.oid = r.ev_class
where d.refobjid in (
    select oid from pg_class
    where oid in (to_regclass('public.thumb_logs'),
                  to_regclass('public.song_tags'),
                  to_regclass('public.tags'),
                  to_regclass('public.artists'))
  )
  and v.oid <> d.refobjid
  and v.relkind in ('v', 'm');
-- artists를 쓰는 뷰가 나오면 그 뷰가 language_tag_id를 쓰는지 정의를 직접 확인한다.

-- 0-5. 함수·트리거·RPC 본문에 이름이 남아 있는지. pg_depend로 안 잡히는(plpgsql 본문) 참조를 찾는다.
--      결과가 있으면 그 함수를 먼저 고치거나 지운다. 남겨두면 drop은 성공하지만 호출 시점에 런타임 에러가 난다.
select n.nspname as schema, p.proname as function_name
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public')
  and p.prosrc ~* '(thumb_logs|song_tags|language_tag_id|public\.tags\M|from\s+tags\M|join\s+tags\M)';

-- 0-6. 다른 테이블의 RLS 정책 식에 이름이 남아 있는지.
select schemaname, tablename, policyname
from pg_policies
where coalesce(qual, '') || coalesce(with_check, '')
      ~* '(thumb_logs|song_tags|language_tag_id|\mtags\M)';


-- ============================================================
-- 1. 백업 (권장 — 되돌릴 유일한 길)
-- ============================================================
-- Supabase 플랜에 PITR이 없으면 이 단계를 건너뛰지 말 것.
-- 백업 스키마는 PostgREST에 노출되지 않는다(Exposed schemas 기본값은 public).
-- 확인이 끝나면(예: 2주 후) `drop schema legacy_backup_20261112 cascade;`로 지운다.

create schema if not exists legacy_backup_20261112;

create table if not exists legacy_backup_20261112.thumb_logs as table public.thumb_logs;
create table if not exists legacy_backup_20261112.song_tags  as table public.song_tags;
create table if not exists legacy_backup_20261112.tags       as table public.tags;
create table if not exists legacy_backup_20261112.artists_language_tag as
  select id, name, language_tag_id
  from public.artists
  where language_tag_id is not null;

-- 백업 행 수가 0-2 결과와 같은지 확인한다.
select 'thumb_logs' as target, count(*) from legacy_backup_20261112.thumb_logs
union all select 'song_tags', count(*) from legacy_backup_20261112.song_tags
union all select 'tags', count(*) from legacy_backup_20261112.tags
union all select 'artists_language_tag', count(*) from legacy_backup_20261112.artists_language_tag;


-- ============================================================
-- 2. 삭제 (한 트랜잭션 — 중간에 하나라도 실패하면 전부 롤백)
-- ============================================================
-- cascade를 쓰지 않는다. 0번에서 못 본 의존 객체가 있으면 조용히 같이 지우는 대신 에러로 멈추게 한다.
-- 순서: FK를 거는 쪽(artists 컬럼, song_tags)을 먼저 지우고 참조당하는 tags를 마지막에 지운다.
-- thumb_logs는 다른 대상과 엮이지 않아 순서 무관.

begin;

-- 컬럼을 지우면 그 컬럼의 FK와 artists_language_tag_id_range check 제약도 함께 사라진다.
alter table public.artists drop column if exists language_tag_id;

drop table if exists public.thumb_logs;
drop table if exists public.song_tags;
drop table if exists public.tags;

-- 결과 확인: 4개 모두 null / 0 이어야 한다. 아니면 rollback; 으로 되돌린다.
select
  to_regclass('public.thumb_logs') as thumb_logs,
  to_regclass('public.song_tags')  as song_tags,
  to_regclass('public.tags')       as tags,
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'artists'
      and column_name = 'language_tag_id') as artists_language_tag_id_exists;

commit;


-- ============================================================
-- 3. 사후 점검
-- ============================================================
-- PostgREST 스키마 캐시를 갱신한다. Supabase는 DDL 후 보통 자동으로 갱신하지만, 확실히 하기 위해 보낸다.
notify pgrst, 'reload schema';

-- 이후 앱에서 직접 확인:
--   1) 검색 화면에서 곡 검색 (api/search) — PGRST200이 나면 아직 조인이 남은 배포본이다 → 1번 백업으로 복구
--   2) /vote 아티스트 검색 자동완성 (artists select)
--   3) 다음 날 GitHub Actions 번역 배치(translationJpn) 로그 확인
