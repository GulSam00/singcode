# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

일회성 데이터 수집/처리 스크립트 모음. 빌드 결과물을 배포하지 않으며, `tsx`로 스크립트를 직접 실행한다.

## Commands

```bash
pnpm ky-open       # Open API(금영)로 KY 번호 수집
pnpm ky-youtube    # YouTube 크롤링으로 KY 번호 수집 + AI 검증
pnpm ky-valid      # 기존 KY 번호의 실제 존재 여부 재검증
pnpm ky-update     # ky-youtube + ky-valid 병렬 실행
pnpm trans         # 일본어 아티스트명 → 한국어 번역 후 DB 저장
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
crawlYoutubeValid.ts
  └─ getSongsKyNotNullDB()       # num_ky가 있는 곡 조회
  └─ isValidKYExistNumber()       # KY 사이트에서 실존 여부 재확인
  └─ 유효하지 않으면 num_ky = null로 초기화
```

**Open API 방식 (보조)**

```
findKYByOpen.ts
  └─ @repo/open-api의 getSong()으로 금영 API 직접 조회
  └─ 제목 + 아티스트 문자열 비교로 KY 번호 매칭
```

**일본어 번역**

```
postTransDictionary.ts
  └─ getSongsJpnDB()             # 일본어 포함된 곡 필터링
  └─ transChatGPT()              # GPT-4-turbo로 아티스트명 번역
  └─ postTransDictionariesDB()   # trans_dictionaries 테이블에 저장
```

### 핵심 패턴: 진행 상태 저장 (체크포인트)

장시간 실행되는 스크립트가 중단됐을 때 재시작하면 처음부터 다시 하지 않도록, `src/assets/`에 텍스트 파일로 진행 상태를 기록한다.

| 파일 | 용도 |
|------|------|
| `src/assets/transList.txt` | 이미 번역 시도한 일본어 아티스트명 |
| `src/assets/crawlKYValidList.txt` | 검증 완료된 (제목-아티스트) 쌍 |
| `src/assets/crawlKYYoutubeFailedList.txt` | YouTube 크롤링 실패 목록 |

`logData.ts`의 `save*` / `load*` 함수로 관리. 스크립트 시작 시 로드해 `Set`으로 변환 후 O(1) 검색으로 스킵 처리.

### Path Alias

`@/` → `src/` (tsconfig의 paths 설정)

### Supabase 테이블

| 테이블 | 용도 |
|--------|------|
| `songs` | 메인 곡 데이터 (TJ/KY 번호 포함) |
| `invalid_ky_songs` | KY 번호 수집 실패 목록 |
| `trans_dictionaries` | 일본어 → 한국어 번역 사전 |

### AI 유틸

- `utils/validateSongMatch.ts` — `gpt-4o-mini`로 두 (제목, 아티스트) 쌍이 같은 곡인지 판단. `temperature: 0`, `max_tokens: 20`, 완전 일치 시 API 호출 생략.
- `utils/transChatGPT.ts` — `gpt-4-turbo`로 일본어 → 한국어 번역.
