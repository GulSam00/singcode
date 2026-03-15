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

## Git Workflows

### "branch 정리해줘"

원격에서 merge 후 삭제된 브랜치를 로컬에서도 동기화한다.

```bash
# 1. 원격 삭제된 브랜치 참조 정리
git fetch --prune

# 2. 원격에 없는 로컬 브랜치 목록 확인
git branch -vv | grep ': gone]'

# 3. 삭제 대상 브랜치 제거 (main, develop, 현재 브랜치 제외)
git branch -vv | grep ': gone]' | awk '{print $1}' | xargs -r git branch -d
```

- `-d` 플래그 사용 (merge되지 않은 브랜치는 삭제 안 됨, 안전)
- 삭제 전 목록을 사용자에게 보여주고 확인 후 진행

## Git Conventions

Branch format: `<type>/<camelCaseName>` — flow: `feat/*` → `develop` → `main`

Commit format: `<type> : <Korean description>` (space before and after colon)

Types: `feat`, `fix`, `hotfix`, `chore`, `refactor`, `doc`

Examples:
```
feat : MarqueeText 자동 스크롤 텍스트 적용
fix : SongCard css 수정
chore : 버전 2.3.0
```
