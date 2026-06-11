# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

일회성 데이터 수집/처리 스크립트 모음. 빌드 결과물을 배포하지 않으며, `tsx`로 스크립트를 직접 실행한다.

## Commands

```bash
pnpm ky-open       # Open API(금영)로 KY 번호 수집
pnpm ky-youtube    # YouTube 크롤링으로 KY 번호 수집 + AI 검증
pnpm ky-verify     # 기존 KY 번호의 실제 존재 여부 재검증 (체크포인트 지원)
pnpm ky-update     # ky-youtube + ky-verify 병렬 실행
pnpm recent-tj     # TJ 최신곡 크롤링
pnpm tag-songs     # AI 기반 곡 자동 태깅
pnpm trans-jpn     # J-POP 곡 제목/아티스트 한국어 번역
pnpm test          # vitest 실행
pnpm lint          # ESLint
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

### GitHub Actions 워크플로우

| 워크플로우 파일          | 스케줄 (UTC)        | 실행 스크립트         |
| ------------------------ | ------------------- | --------------------- |
| `crawl_recent_tj.yml`    | 매일 14:00          | `pnpm recent-tj`      |
| `tagging_song.yml`       | 매주 월요일 10:00   | `pnpm tag-songs`      |
| `translation_jpn.yml`    | 매주 금요일 14:00   | `pnpm trans-jpn`      |
| `crawl_tj_by_number.yml` | 수동                | `pnpm test-tj-number` |
| `update_ky_youtube.yml`  | 수동                | `pnpm ky-youtube`     |
| `verify_ky_youtube.yml`  | 수동                | `pnpm ky-verify`      |

모든 워크플로우는 `workflow_dispatch`로 수동 실행도 가능하다.
