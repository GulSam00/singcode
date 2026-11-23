-- 태연·잔나비·폴킴 사진 초기화 (#307, docs/issues/20261027-1007-artist-vote-307-followups.md)
--
-- 이 세 명은 MusicBrainz 이름 다리를 붙이기 전에 채워져, Deezer의 팬 수 17~66짜리 중복 등록에서
-- 온 사진이 들어 있다(packages/crawling/src/assets/artistImageBackfillLog.txt). 정품 사진으로 바꾸려면
-- image_url을 비우고 백필을 다시 돌린다. 백필은 image_url is null인 행만 대상으로 삼는다.
--
-- 이름: 운영 검색 API(2026-11-19)에서 artists.name이 정확히 '태연', '잔나비', '폴킴'으로 확인됐다.
-- '김태연', '이태연', 'テヨン'(name_ko 태연)은 다른 행이라 건드리지 않는다.
-- Supabase SQL Editor에서 실행한다. 이 파일은 자동으로 실행되지 않는다.

-- 1) 현재 값 확인 (읽기 전용). 3행이 나와야 한다. 기존 URL을 기록해 두면 되돌릴 수 있다.
select name, name_ko, image_url
from public.artists
where name in ('태연', '잔나비', '폴킴');

-- 2) 초기화
update public.artists
set image_url = null
where name in ('태연', '잔나비', '폴킴');

-- 3) 다시 채우기 — 주의: 월간 확정 워크플로로는 다시 채워지지 않는다.
--    finalize_artist_of_month.yml의 사진 단계는 ARTIST_IMAGE_PODIUM=3이라 "가장 최근 확정 월의 1~3위"만
--    처리한다(현재 크라잉넛 1명). 세 명이 시상대에 오르기 전에는 대상이 아니다.
--    사진은 시상대에서만 쓰이므로 비워 둬도 화면에는 영향이 없지만, 바로 채우려면 로컬에서 이름을 지정해 돌린다
--    (packages/crawling/.env에 SUPABASE_URL, SUPABASE_KEY(service_role) 필요):
--
--      cd packages/crawling
--      ARTIST_IMAGE_NAMES=태연,잔나비,폴킴 ARTIST_IMAGE_DRY_RUN=1 pnpm backfill-artist-images   # 무엇이 잡히는지만 확인
--      ARTIST_IMAGE_NAMES=태연,잔나비,폴킴 pnpm backfill-artist-images                          # 실제 저장
--
--    DRY RUN은 2) 이후에 돌려야 의미가 있다(image_url이 차 있으면 대상 0명).
--    DRY RUN 결과가 여전히 팬 수 수십짜리면 정품을 못 찾은 것이니, 1)에서 기록한 URL로 되돌리거나 비워 둔다.
