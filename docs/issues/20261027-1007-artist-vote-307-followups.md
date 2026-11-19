---
id: 20261027-1007-artist-vote-307-followups
title: #307 이달의 아티스트 남은 작업
status: doing
priority: medium
created: 2026-10-27
external:
---

## 맥락

코드는 완성됐고 배포 설정과 실데이터 QA가 남았다. 상세는 `CLAUDE.md`의 "#307 이달의 아티스트" 섹션에 있다.

## 완료 조건

- [x] GitHub Actions repo secret 확인 (`SUPABASE_URL`, `SUPABASE_KEY`). 값은 기록하지 않는다
- [x] 아티스트 검색 자동완성으로 RLS 정책 적용 확인
- [x] `artists(name_ko, image_url)` 임베드 조회에서 PGRST200 여부 확인
- [ ] 투표(포인트 차감) → 월간 확정 흐름 실데이터 QA
- [ ] 태연·잔나비·폴킴 사진을 정품으로 교체할지 결정

## 로그

- 2026-10-27: 등록
- 2026-11-19: 착수. 체크리스트 `docs/qa/artist-vote-307.md`, 사진 초기화 `apps/web/artist-image-reset.sql` 추가
- 2026-11-19: secret 확인 — `finalize_artist_of_month.yml` run 41233232530(10-31 19:14 UTC)·41342340455(11-01) 성공, 10월 확정(1위 크라잉넛 50P)·사진 단계 정상
- 2026-11-19: 운영 비로그인 API 확인 — `/api/artists/search?q=BTS`·`방탄소년단` 결과 있음(RLS 정상), `/api/artist-vote/rankings` 임베드 정상(PGRST200 없음, image_url 채워짐)
- 2026-11-19: 발견 — 2026-11-05부터 레포의 모든 Actions run이 러너 배정 없이 실패(runner_id 0, 로그 없음). 계정 결제/한도 확인 필요, 12-01 확정 전에 해결해야 한다
- 2026-11-19: 사용자 작업 대기 — docs/qa/artist-vote-307.md 체크리스트(투표 QA는 PR #352 배포 후) / artist-image-reset.sql
