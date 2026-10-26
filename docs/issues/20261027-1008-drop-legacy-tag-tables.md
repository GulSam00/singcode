---
id: 20261027-1008-drop-legacy-tag-tables
title: Supabase에서 태그·추천 관련 테이블 삭제
status: later
priority: low
created: 2026-10-27
external:
---

## 맥락

태그와 추천(thumb) 기능은 코드에서 모두 제거됐다. 남은 건 Supabase 대시보드에서 `tags`, `song_tags`, `thumb_logs` 테이블과 `artists.language_tag_id` 컬럼을 수동 삭제하는 일이다.
`thumb_logs`는 `api/search`의 조인 제거가 배포된 뒤에 지워야 한다. 먼저 지우면 검색 전체가 PGRST200으로 깨진다.

## 완료 조건

- [ ] `api/search` 수정이 프로덕션에 배포된 것을 확인
- [ ] `thumb_logs`, `song_tags`, `tags` 테이블 삭제
- [ ] `artists.language_tag_id` 컬럼 삭제

## 로그

- 2026-10-27: 등록
