---
id: 20261119-2232-artist-search-iu-alias
title: 아티스트 검색에서 한글 표기가 없는 아티스트 보강 (예: 아이유)
status: later
priority: low
created: 2026-11-19
external:
---

## 맥락

`20261027-1007` QA 중 발견했다. 운영 `/api/artists/search?q=아이유`가 빈 배열을 돌려준다.
`artists`에 `IU`로만 있고 `name_ko`가 비어 있으며 `artistAlias`(`packages/constants`)에도 없다.
RLS 문제가 아니라 데이터 문제다. 투표 화면에서 "아이유"로 찾지 못한다.

## 완료 조건

- [ ] `name_ko`가 비어 있는 로마자 아티스트 중 검색량이 많은 대상 추리기 (투표·검색 로그 기준)
- [ ] `artistAlias` 보강 또는 `name_ko` 백필 중 방식 결정 (배치와 웹이 같은 규칙을 쓰도록 `@repo/constants` 우선)
- [ ] "아이유"로 `IU`가 검색되는지 확인

## 로그

- 2026-11-19: 등록
