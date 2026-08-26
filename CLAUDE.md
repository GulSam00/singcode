# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Singcode** is a Korean karaoke song management service (singcode.kr). This is a pnpm workspace monorepo managed with Turborepo.

## Commands

Run from the **repo root** to target all workspaces:

```bash
pnpm dev          # Start all dev servers via Turbo
pnpm dev-web      # Start only the web app dev server
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm format       # Prettier format all packages
pnpm check-types  # TypeScript type-check all packages
```

Run from **`apps/web/`** for web-only work:

```bash
pnpm dev    # Next.js dev server with Turbopack (http://localhost:3000)
pnpm build  # Production build + next-sitemap postbuild
pnpm lint   # ESLint
pnpm format # Prettier format .ts, .tsx, .md
```

No test suite is configured.

## Monorepo Structure

```
apps/
  web/      — Next.js 15 web app (primary app, see apps/web/CLAUDE.md)
  twa/      — Bubblewrap TWA build workspace for Play Store (see apps/twa/CLAUDE.md)
  mobile/   — [DEPRECATED — frozen, see apps/mobile/README.md] Expo wrapper app, replaced by TWA approach. Excluded from pnpm workspace.
packages/
  open-api/ — Wrapper around the external karaoke open API (@repo/open-api)
  query/    — Shared TanStack Query hooks for open-api (@repo/query)
  api/      — Internal API utilities (@repo/api), built with tsup
  ui/       — Shared UI components (@repo/ui)
  constants/ — Shared domain constants & rules (@repo/constants). 아티스트 별칭(`artistAlias`),
              이름 정규화(`artistName.ts`), 투표 집계 규칙(`rankArtistVotes.ts`), KST 월 계산
              (`kstMonth.ts`)이 있다. 배치(`packages/crawling`)와 웹이 같은 규칙을 써야 해
              여기 둔다 — 한쪽만 고치면 화면에 적힌 순위와 저장된 순위가 어긋난다.
  eslint-config/   — Shared ESLint config (@repo/eslint-config)
  format-config/   — Shared Prettier config (@repo/format-config)
  typescript-config/ — Shared tsconfig bases
  crawling/ — Data crawling & tagging scripts (see packages/crawling/CLAUDE.md)
```

## Web App Architecture

See [apps/web/CLAUDE.md](apps/web/CLAUDE.md) for full detail. Key points:

- **Next.js 15 App Router** + React 19, deployed on Vercel
- **BFF pattern**: client → internal API routes (`/api/*`) → Supabase / external karaoke API. Never call Supabase or external APIs directly from the browser.
- **Supabase** (`@supabase/ssr`) for auth and database; three client variants (browser, server/route handler, middleware)
- **TanStack Query** for server state; **Zustand** for client state
- **Tailwind CSS v4** + **shadcn/ui** in `src/components/ui/` (do not modify directly)
- Path alias `@/` → `src/`

## Workflow Commands

`.claude/commands/` 에 정의된 슬래시 커맨드로 작업을 진행한다.

### 전체 플로우

```
/start → /spsc → /red → /green → /refactor → /verify → /commit
```

| 커맨드          | 설명                                     | 필수 여부 |
| --------------- | ---------------------------------------- | --------- |
| `/start`        | GitHub Issue 생성 + 작업 브랜치 체크아웃 | 권장      |
| `/spsc`         | 이슈 기반 작업 범위 정의                 | 권장      |
| `/red`          | 실패 테스트 먼저 작성 (TDD)              | 생략 가능 |
| `/green`        | 구현 코드 작성                           | 필수      |
| `/refactor`     | 코드 품질 개선 (동작 변경 X)             | 생략 가능 |
| `/verify`       | build, lint, format, test 전체 검증      | **필수**  |
| `/commit`       | 커밋 메시지 생성 및 커밋                 | **필수**  |
| `/pr`           | PR 생성 및 Qodo AI 리뷰 요청             | 권장      |
| `/check-review` | Qodo 리뷰 코멘트 읽기 및 이슈 브리핑     | 권장      |

### 단축 사이클

- 긴급 핫픽스: `/start` → `/spsc` → `/green` → `/verify` → `/commit`
- `/red` ~ `/refactor` 는 상황에 따라 생략 가능하나, `/verify` → `/commit` 은 항상 실행한다.
- PR 생성 후: `/pr` → `/review-brief` 로 리뷰 이슈를 확인한다.

## Git Conventions

Branch format: `<type>/<issue-number>-<camelCaseName>` — flow: `feat/*` → `develop` → `main`

Types: `feat`, `fix`, `hotfix`, `chore`, `refactor`, `doc`

Branch examples:

```
feat/42-addSearchFilter
fix/57-songCardCss
chore/61-versionBump
```

Commit format: `<type> : <Korean description> (#issue-number)` (space before and after colon)

Examples:

```
feat : MarqueeText 자동 스크롤 텍스트 적용 (#42)
fix : SongCard css 수정 (#57)
chore : 버전 2.3.0 (#61)
```

## 진행 중인 작업

### #307 이달의 아티스트 (포인트 투표)

코드는 완성됐다. 남은 건 배포 설정과 실데이터 QA다.

**완료**

- `apps/web/artist-vote-schema.sql` 실행 — 테이블 3종 + RLS 정책 + `artists.image_url`.
  최초 버전에는 정책이 하나도 없어서 앱(anon 키)에서 모든 조회가 조용히 빈 배열로 돌아왔다.
  파일 전체가 `if not exists` / `drop policy if exists`라 다시 실행해도 안전하다.
- `pnpm backfill-artists`로 `artists` 적재 (13,869명).
- 랭킹 화면: 1~3위 액자(1위 금 / 2·3위 황동) + 카드 위 우승 별(`WinStars`) + 득표 파이(1~10위).
  화면 확인용 목업은 제거했다.

**남은 작업**

1. GitHub Actions repo secret 확인 — `SUPABASE_URL`, `SUPABASE_KEY`(service_role).
   `finalize_artist_of_month.yml`이 확정과 사진 백필 양쪽에 쓴다. 다른 크롤링 워크플로가
   이미 쓰는 값이라 등록돼 있을 가능성이 높지만, 이 워크플로에서는 처음 참조한다.
   **Vercel 쪽에 추가로 넣을 환경변수는 없다.**
2. 실데이터 QA (테스트 스위트 없음)
   - 아티스트 검색 자동완성 — RLS 정책이 실제로 붙었는지 확인하는 가장 빠른 길
   - `artists(name_ko, image_url)` 임베드 첫 조회에서 `PGRST200`이 나면 FK 힌트 문법을 명시해야 한다
   - 투표(포인트 차감) → 월간 확정 → 곡 카드 배지까지. 카카오 로그인이라 자동 검증이 어렵다
3. 아티스트 사진 — `artists.image_url`
   - `finalize_artist_of_month.yml`의 마지막 단계가 채운다. 확정된 그달 1~3위 중 사진이 없는
     사람만 `ARTIST_IMAGE_PODIUM=3`으로 처리한다. 사진이 쓰이는 자리가 시상대뿐이라
     13,000명을 미리 채우지 않는다.
   - 이름 매칭은 MusicBrainz(별칭 사전) → Deezer(사진) 순이다. 우리 DB는 TJ 표기(한글·원어)인데
     음원 서비스 등록은 로마자라("방탄소년단" ↔ "BTS"), 이 다리가 없으면 사진이 있는데도 못 찾는다.
   - 태연·잔나비·폴킴 3명은 이 다리를 붙이기 전에 채워져 팬 수 20~60짜리 중복 등록에서 온 사진이다.
     정품으로 바꾸려면 `update public.artists set image_url = null where name in (...)` 후 다시 돌려야 한다
     (`image_url is null`인 행만 대상이라 그냥 두면 갱신되지 않는다).

**월간 확정이 도는 자리**

`packages/crawling`의 `pnpm finalize-artist`다. 원래는 웹앱 API 라우트
(`/api/artist-vote/finalize`)였는데, 인증 없는 공개 URL이 순위를 지우고 다시 쓰는 구조라
공유 시크릿으로 잠가야 했다. 배치로 옮기면서 그 엔드포인트와 `ARTIST_VOTE_FINALIZE_SECRET`,
Vercel의 `SUPABASE_SERVICE_ROLE_KEY`가 모두 없어졌다. **확정 로직을 웹으로 되돌리지 말 것** —
공개 엔드포인트가 다시 생긴다.

### 태그 기능 제거 (완료 — 참고용)

검색 언어 태그 필터가 오작동해 관련 코드를 전부 걷어냈다: 프론트(`LanguageTagFilter.tsx` 등)와 `api/search`의 `song_tags` 조인, `artists.language_tag_id` 참조(추후 대시보드에서 컬럼 수동 삭제 예정)를 제거했고, `packages/crawling`의 `taggingSongs.ts`/`translationJpn.ts`는 삭제 대신 전체 주석처리했다. `tagging_song.yml`/`translation_jpn.yml`은 `schedule` 트리거만 비활성화(주석)했고 `workflow_dispatch`로 수동 실행은 여전히 가능하다. `tags`/`song_tags` 테이블 자체는 DB에 남아있지만 앱은 더 이상 참조하지 않는다.

## Self-Maintenance

이 파일(CLAUDE.md)은 프로젝트의 규칙과 구조가 변경될 때 함께 업데이트한다.
별도 요청 없이도 아래 항목에 해당하는 변경이 발생하면 자동으로 반영한다.

- 커맨드(`.claude/commands/`) 추가·수정·삭제 시 → **Workflow Commands** 섹션 반영
- 브랜치·커밋 규칙 변경 시 → **Git Conventions** 섹션 반영
- 패키지 추가·삭제·구조 변경 시 → **Monorepo Structure** 섹션 반영
- 기술 스택·아키텍처 변경 시 → **Web App Architecture** 섹션 반영
- 빌드·린트·포맷 명령어 변경 시 → **Commands** 섹션 반영
