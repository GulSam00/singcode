# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

일회성 데이터 수집/처리 스크립트 모음. 빌드 결과물을 배포하지 않으며, `tsx`로 스크립트를 직접 실행한다.

## Commands

```bash
pnpm ky-open           # Open API(금영)로 KY 번호 수집
pnpm ky-youtube        # YouTube 크롤링으로 KY 번호 수집 + AI 검증
pnpm ky-verify         # 기존 KY 번호의 실제 존재 여부 재검증 (체크포인트 지원)
pnpm ky-update         # ky-youtube + ky-verify 병렬 실행
pnpm recent-tj         # TJ 최신곡 크롤링
pnpm tj-all-number     # TJ 번호 구간(START_NUMBER~END_NUMBER) 전수 크롤링
pnpm tj-badges         # TJ 반주 버전 뱃지(MV/MR/LV/60) 수집 (badges가 null인 곡만)
pnpm remove-dead-songs # TJ에서 사라진 번호의 곡 정리 (기본 미리보기, DEAD_SONGS_APPLY=true로 실행)
pnpm tj-chart          # TJ 공식 차트(TOP100) 전월분 수집
pnpm tj-chart-backfill # TJ 공식 차트 과거 월 일괄 백필 (기간은 스크립트 상수로 지정)
pnpm tag-songs         # AI 기반 곡 자동 태깅
pnpm trans-jpn         # J-POP 곡 제목/아티스트 한국어 번역
pnpm test              # vitest 실행
pnpm lint              # ESLint
pnpm format            # Prettier 포맷
```

스크립트는 반드시 **`packages/crawling/`** 디렉토리에서 실행해야 한다. 로그 파일 및 assets 경로가 상대 경로 기준이기 때문.

## Environment Variables

`.env` 파일 필요 (루트가 아닌 `packages/crawling/`에 위치):

```
SUPABASE_URL=
SUPABASE_KEY=
OPENAI_API_KEY=
```

## Architecture

### 데이터 흐름

모든 스크립트는 **Supabase `songs` 테이블**을 중심으로 동작한다.

```
[songs 테이블]
  title, artist, num_tj(TJ번호), num_ky(KY번호)

주요 목표: num_ky가 null인 곡에 KY 번호를 채우는 것
```

**KY 번호 수집 (메인 파이프라인)**

```
crawlYoutube.ts
  └─ getSongsKyNullDB()          # num_ky가 null인 곡 조회
  └─ YouTube @KARAOKEKY 채널 검색  # puppeteer + cheerio로 번호 스크래핑
  └─ isValidKYExistNumber()       # kysing.kr에서 번호 실존 여부 확인
       └─ validateSongMatch()     # OpenAI gpt-4o-mini로 제목/아티스트 일치 판단
  └─ updateSongsKyDB()           # 성공 시 DB 업데이트
  └─ postInvalidKYSongsDB()      # 실패 시 invalid_ky_songs 테이블에 기록
```

**KY 번호 검증 (기존 데이터 재확인)**

```
crawlYoutubeVerify.ts
  └─ getSongsKyNotNullDB()       # num_ky가 있는 곡 조회
  └─ getVerifyKySongsDB()        # 이미 검증된 ID 로드 (체크포인트)
  └─ isValidKYExistNumber()       # KY 사이트에서 실존 여부 재확인
  └─ 유효하면 postVerifyKySongsDB()     # verify_ky_songs 테이블에 insert
  └─ 유효하지 않으면 num_ky = null로 초기화
```

**Open API 방식 (보조)**

```
findKYByOpen.ts
  └─ @repo/open-api의 getSong()으로 금영 API 직접 조회
  └─ 제목 + 아티스트 문자열 비교로 KY 번호 매칭
```

### 핵심 패턴: 진행 상태 저장 (체크포인트)

장시간 실행되는 스크립트가 중단됐을 때 재시작하면 처음부터 다시 하지 않도록, `src/assets/`에 텍스트 파일로 진행 상태를 기록한다.

| 파일                                      | 용도                           |
| ----------------------------------------- | ------------------------------ |
| `src/assets/crawlKYValidList.txt`         | 검증 완료된 (제목-아티스트) 쌍 |
| `src/assets/crawlKYYoutubeFailedList.txt` | YouTube 크롤링 실패 목록       |

`logData.ts`의 `save*` / `load*` 함수로 관리. 스크립트 시작 시 로드해 `Set`으로 변환 후 O(1) 검색으로 스킵 처리.

### Path Alias

`@/` → `src/` (tsconfig의 paths 설정)

### Supabase 테이블

| 테이블             | 용도                             |
| ------------------ | -------------------------------- |
| `songs`            | 메인 곡 데이터 (TJ/KY 번호 포함) |
| `invalid_ky_songs` | KY 번호 수집 실패 목록           |
| `tags`             | 태그 마스터 (id, name, category) |
| `song_tags`        | 곡-태그 매핑 (song_id, tag_id)   |
| `verify_ky_songs`  | KY 번호 검증 완료 목록           |
| `chart_rankings`   | TJ 공식 차트 월별/장르별 순위    |

### AI 유틸

- `utils/validateSongMatch.ts` — `gpt-4o-mini`로 두 (제목, 아티스트) 쌍이 같은 곡인지 판단. `temperature: 0`, 완전 일치 시 API 호출 생략.
- `utils/transChatGPT.ts` — `gpt-4-turbo`로 일본어 → 한국어 번역.
- `utils/translateJpnToKo.ts` — `gpt-5.4-mini`로 J-POP 곡 제목/아티스트 한국어 번역.
- `utils/getSongTag.ts` — 곡에 언어 태그(100~199) 1개를 자동 할당. 한글/가나 감지 시 즉시 분류, 동일 아티스트 태그 재사용, 영문 전용 곡만 `gpt-5.4-mini`로 판별.

### 곡 태깅 파이프라인

```
taggingSongs.ts
  └─ getSongsAllDB()              # 전체 곡 조회
  └─ getSongTagSongIdsDB()        # 이미 태그된 곡 ID Set 로드 (스킵 처리)
  └─ autoTagSong(title, artist, tagsPrompt)  # 언어 태그 1개 반환 (한글/가나 → 즉시, 영문 → LLM)
  └─ postSongTagsDB(songId, [tagId])  # song_tags 테이블에 insert
```

### TJ 공식 차트 파이프라인

TJ미디어 공식 API(`legacy/api/topAndHot100`)에서 월별/장르별 TOP100을 수집해 `chart_rankings`에 적재한다. `songs` 테이블의 `num_tj`로 곡을 매칭하며, 매칭되지 않은 곡은 저장하지 않고 로그 파일에만 남긴다.

```
crawlTjChart.ts (매달 1일, 전월 1개월분)
crawlTjChartBackfill.ts (과거 월 일괄, 기간은 파일 상단 상수로 지정)
  └─ getSongsAllWithTjDB()        # num_tj 보유 곡 전체 조회
  └─ buildSongIdByNumTjMap()      # num_tj → song_id Map 구성
  └─ fetchTjChart(strType, ...)   # StrType 전체(12종) 순회 조회
  └─ matchChartRows()             # num_tj 매칭 → insert row / 미매칭 라인 분리
  └─ postTjChartRankingsDB()      # chart_rankings upsert (chart_month,type,rank 기준)
  └─ 미매칭은 src/assets/tjChart(Backfill)Unmatched.txt 에 append
```

`utils/tjChart.ts`가 조회·매칭·로깅 로직을 공유하고, 두 스크립트는 대상 기간 결정과 저장 시점만 다르다. `StrType` enum은 웹앱(`apps/web/src/types/tjChart.ts`)과 의도적으로 중복 정의되어 있으므로 장르를 추가·변경할 때 양쪽을 함께 수정해야 한다.

### TJ 반주 버전 뱃지 파이프라인

TJ는 한 곡에 반주 번호를 여러 개 등록한다(일반 / MR / 라이브 / 60이상 전용). 곡 검색 페이지의 아이콘을 파싱해 `songs.badges`(`text[]`)에 저장한다.

| 저장값 | DOM 클래스        | 차트 API             |
| ------ | ----------------- | -------------------- |
| `MV`   | `p.ico.mv`        | `mv_yn === 'Y'`      |
| `MR`   | `p.ico.mr`        | `icongubun === 'MR'` |
| `LV`   | `p.ico.live`      | `icongubun === 'LV'` |
| `60`   | `p.ico.exclusive` | `icongubun === '60'` |

`badges`가 `null`이면 미수집, `[]`면 수집했으나 뱃지 없음이다. **이 구분이 재개 지점 역할을 하므로 컬럼에 `not null default '{}'`를 걸면 안 된다.**

```
crawlTjBadges.ts (pnpm tj-badges)
  └─ getSongsBadgeNullDB()        # badges is null 인 곡을 청크(500)로 조회
  └─ buildBadgeSearchUrl()        # strType=16 번호 검색
  └─ parseBadgeRow()              # ok / not_found / num_mismatch 구분 반환
  └─ updateSongBadgesDB()         # 뱃지 조합별로 묶어 in(id) 갱신 (id 100개씩)
  └─ 이상 항목은 src/assets/tjBadgeErrors.txt 에 유형별로 append
```

환경변수로 조절한다: `BADGE_MAX_SONGS`(0=제한 없음), `BADGE_CONCURRENCY`(기본 5), `BADGE_DRY_RUN`.

`utils/tjBadge.ts`의 `sortBadges()`를 반드시 거쳐야 검색 페이지 경로와 차트 API 경로(`badgesFromChartItem`)가 같은 배열을 만든다.

`crawlRecentTJ`가 넣는 신곡도 `badges`가 `null`이므로, **`badges is null`만 보고 "TJ에서 사라진 곡"으로 판단하면 안 된다.** `crawl_recent_tj.yml`이 `recent-tj` 직후 `tj-badges`를 돌려 신곡 뱃지를 채운다.

`removeDeadTjSongs.ts`는 후보를 `badges is null`로 추리되 **삭제 직전에 TJ로 다시 조회**한다. 살아 있으면 지우지 않고 뱃지를 채워주고, 조회 자체가 실패하면 건드리지 않는다. 재확인 전에 **차트에 오른 곡**(번호 검색에는 없어도 차트에는 오른다)과 **`num_ky` 보유 곡**(금영으로는 부를 수 있다)은 아예 제외한다.

`songs`를 참조하는 `song_tags` · `invalid_ky_songs` · `verify_ky_songs`를 먼저 지워야 FK 제약에 걸리지 않는다. `invalid_ky_songs`와 `verify_ky_songs`는 별도 `song_id` 컬럼 없이 PK인 `id`가 곧 `songs.id`다.

### GitHub Actions 워크플로우

| 워크플로우 파일           | 스케줄 (UTC)      | 실행 스크립트        |
| ------------------------- | ----------------- | -------------------- |
| `crawl_recent_tj.yml`     | 매일 14:00        | `pnpm recent-tj`     |
| `crawl_tj_chart.yml`      | 매달 1일 01:00    | `pnpm tj-chart`      |
| `tagging_song.yml`        | 매일 07:00        | `pnpm tag-songs`     |
| `translation_jpn.yml`     | 매일 10:00        | `pnpm trans-jpn`     |
| `update_ky_youtube.yml`   | 매일 14:00        | `pnpm ky-youtube`    |
| `verify_ky_youtube.yml`   | 매주 월요일 14:00 | `pnpm ky-verify`     |
| `crawl_tj_all_number.yml` | 수동 전용         | `pnpm tj-all-number` |

`crawl_tj_all_number.yml`을 제외한 모든 워크플로우는 스케줄 + `workflow_dispatch`(수동) 양쪽으로 실행 가능하다. `crawl_tj_all_number.yml`은 번호 구간을 `matrix`로 병렬 분할해 수동으로만 실행한다.
