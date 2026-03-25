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
  mobile/   — Expo React Native app (early stage)
packages/
  open-api/ — Wrapper around the external karaoke open API (@repo/open-api)
  query/    — Shared TanStack Query hooks for open-api (@repo/query)
  api/      — Internal API utilities (@repo/api), built with tsup
  ui/       — Shared UI components (@repo/ui)
  eslint-config/   — Shared ESLint config (@repo/eslint-config)
  format-config/   — Shared Prettier config (@repo/format-config)
  typescript-config/ — Shared tsconfig bases
  crawling/ — One-off data crawling scripts (not a published package)
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
| `/commit`   | 커밋 메시지 생성 및 커밋                 | **필수**  |

### 단축 사이클

- 긴급 핫픽스: `/start` → `/spsc` → `/green` → `/verify` → `/commit`
- `/red` ~ `/refactor` 는 상황에 따라 생략 가능하나, `/verify` → `/commit` 은 항상 실행한다.

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

## Self-Maintenance

이 파일(CLAUDE.md)은 프로젝트의 규칙과 구조가 변경될 때 함께 업데이트한다.
별도 요청 없이도 아래 항목에 해당하는 변경이 발생하면 자동으로 반영한다.

- 커맨드(`.claude/commands/`) 추가·수정·삭제 시 → **Workflow Commands** 섹션 반영
- 브랜치·커밋 규칙 변경 시 → **Git Conventions** 섹션 반영
- 패키지 추가·삭제·구조 변경 시 → **Monorepo Structure** 섹션 반영
- 기술 스택·아키텍처 변경 시 → **Web App Architecture** 섹션 반영
- 빌드·린트·포맷 명령어 변경 시 → **Commands** 섹션 반영
