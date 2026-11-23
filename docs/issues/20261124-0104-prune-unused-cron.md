---
id: 20261124-0104-prune-unused-cron
title: 쓰지 않는 크롤링 스크립트·워크플로 정리
status: todo
priority: low
created: 2026-11-24
external:
---

## 맥락

`packages/crawling`과 `.github/workflows`에 지금은 돌지 않거나 의미가 없어 보이는 스크립트가 섞여 있다.
쓰는 것과 안 쓰는 것이 구분되지 않아서, 어떤 배치가 데이터를 바꾸는지 파악하기 어렵다.
그래서 **지우거나, 실행되지 않는 보관 폴더(예: `packages/crawling/src/_archive/`)로 옮긴다.**
보관 폴더는 tsconfig·lint 대상에서 빼고, `package.json` 스크립트와 워크플로에서 참조를 끊는다.

### 현재 구성 (2026-11-24 develop 기준)

**예약 실행 워크플로 (7개)**

| 워크플로 | 주기 | 스크립트 |
| --- | --- | --- |
| `crawl_recent_tj` | 매일 23:00 KST | `recent-tj`, `tj-badges` |
| `update_ky_youtube` | 매일 23:00 KST | `ky-youtube` |
| `verify_ky_youtube` | 매주 월 23:00 KST | `ky-verify` |
| `translation_jpn` | 매일 19:00 KST | `trans-jpn` |
| `finalize_artist_of_month` | 매일 00:10 KST | `finalize-artist`, `backfill-artist-images` |
| `backfill_artists` | 매월 1일 10:00 KST | `backfill-artists` |
| `crawl_tj_chart` | 매월 1일 10:00 KST | `tj-chart` |

**수동 실행만 있는 워크플로**: `crawl_tj_all_number` (`tj-all-number`)

**워크플로 없이 `package.json` 스크립트만 있는 것**: `ky-open`(`findKYByOpen.ts`), `ky-update`(ky-youtube + ky-verify 병렬),
`remove-dead-songs`, `tj-chart-backfill`, `ig-recent-images`

**어디서도 참조하지 않는 파일**: `src/postAllOpenSongs.ts`, `src/postByRelease.ts`, `src/crawling/crawlTJSongByNumber.ts`
(파일명 기준 grep 결과. import 경로로 쓰이는지는 착수 시 다시 확인)

### 판단 기준

- 지운다: 참조가 없고 다시 쓸 일이 없는 일회성 스크립트
- 보관 폴더로 옮긴다: 지금은 안 돌지만 다시 쓸 수 있는 백필·복구 스크립트 (예: `tj-chart-backfill`, `remove-dead-songs`)
- 그대로 둔다: 예약 워크플로가 부르는 것, 앞으로 쓸 계획이 있는 것(`ig-recent-images`는 `20261026-2310` 게시 스크립트가 사용 예정)
- `finalize_artist_of_month`가 매일 도는 이유(월 경계 처리)를 확인하고, 매일일 필요가 없으면 주기를 줄인다

## 완료 조건

- [ ] 스크립트·워크플로별 유지 / 보관 / 삭제 목록 확정 (사용자 확인)
- [ ] 삭제·보관 대상의 `package.json` 스크립트, 워크플로, import 참조 정리
- [ ] 보관 폴더를 tsconfig·eslint·vitest 대상에서 제외
- [ ] `packages/crawling/CLAUDE.md`의 스크립트 목록 갱신
- [ ] `pnpm --filter crawling lint`, 타입 체크, `test` 통과

## 로그

- 2026-11-24: 등록
