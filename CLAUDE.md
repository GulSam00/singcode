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

| 커맨드      | 설명                                    | 필수 여부 |
| ----------- | --------------------------------------- | --------- |
| `/start`    | GitHub Issue 생성 + 작업 브랜치 체크아웃 | 권장      |
| `/spsc`     | 이슈 기반 작업 범위 정의                 | 권장      |
| `/red`      | 실패 테스트 먼저 작성 (TDD)              | 생략 가능 |
| `/green`    | 구현 코드 작성                           | 필수      |
| `/refactor` | 코드 품질 개선 (동작 변경 X)             | 생략 가능 |
| `/verify`   | build, lint, format, test 전체 검증      | **필수**  |
| `/commit`        | 커밋 메시지 생성 및 커밋                 | **필수**  |
| `/pr`            | PR 생성 및 Qodo AI 리뷰 요청            | 권장      |
| `/check-review`  | Qodo 리뷰 코멘트 읽기 및 이슈 브리핑    | 권장      |

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

코드는 완성됐으나 아래 수동 작업이 남아있어 실제로는 아직 동작하지 않는다.

1. `apps/web/artist-vote-schema.sql`을 Supabase SQL Editor에서 실행 — `artists`(마스터), `artist_votes`, `monthly_artist_rankings` 테이블 + RLS 정책 생성. `artists`를 먼저 만들고 나머지 두 테이블이 `artist`를 그 `name`으로 FK 참조하는 순서라 반드시 이 파일 그대로 한 번에 실행해야 한다.
2. `packages/crawling`에서 `pnpm backfill-artists`를 환경변수 없이(전체 스캔) 최초 1회 실행해 `artists`를 채운다 — 비어있으면 `artist_votes.artist`의 FK 제약 때문에 투표 자체가 전부 실패한다.
3. 환경변수/시크릿 등록
   - Vercel(`apps/web` 프로덕션): `SUPABASE_SERVICE_ROLE_KEY`(turbo.json엔 이미 선언돼 있으나 실제 값 미설정), `ARTIST_VOTE_FINALIZE_SECRET`(새로 발급)
   - GitHub Actions repo secret: `ARTIST_VOTE_FINALIZE_SECRET` (`finalize_artist_of_month.yml`에서 사용, Vercel과 같은 값이어야 함)
4. 위 설정 후 투표 → 월간 확정(`finalize_artist_of_month.yml`) → 곡 카드 배지 노출까지 전체 흐름을 수동 QA (테스트 스위트 없음)

## Self-Maintenance

이 파일(CLAUDE.md)은 프로젝트의 규칙과 구조가 변경될 때 함께 업데이트한다.
별도 요청 없이도 아래 항목에 해당하는 변경이 발생하면 자동으로 반영한다.

- 커맨드(`.claude/commands/`) 추가·수정·삭제 시 → **Workflow Commands** 섹션 반영
- 브랜치·커밋 규칙 변경 시 → **Git Conventions** 섹션 반영
- 패키지 추가·삭제·구조 변경 시 → **Monorepo Structure** 섹션 반영
- 기술 스택·아키텍처 변경 시 → **Web App Architecture** 섹션 반영
- 빌드·린트·포맷 명령어 변경 시 → **Commands** 섹션 반영
