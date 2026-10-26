---
id: 20261027-1007-artist-vote-307-followups
title: #307 이달의 아티스트 남은 작업
status: todo
priority: medium
created: 2026-10-27
external:
---

## 맥락

코드는 완성됐고 배포 설정과 실데이터 QA가 남았다. 상세는 `CLAUDE.md`의 "#307 이달의 아티스트" 섹션에 있다.

## 완료 조건

- [ ] GitHub Actions repo secret 확인 (`SUPABASE_URL`, `SUPABASE_KEY`). 값은 기록하지 않는다
- [ ] 아티스트 검색 자동완성으로 RLS 정책 적용 확인
- [ ] `artists(name_ko, image_url)` 임베드 조회에서 PGRST200 여부 확인
- [ ] 투표(포인트 차감) → 월간 확정 흐름 실데이터 QA
- [ ] 태연·잔나비·폴킴 사진을 정품으로 교체할지 결정

## 로그

- 2026-10-27: 등록
