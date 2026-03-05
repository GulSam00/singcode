# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Singcode** is a Korean karaoke song management web app (singcode.kr). Users can search for songs by title/singer/number, save songs to folders, track liked songs, and manage their "to-sing" list. The app uses Supabase for auth and database, and an external karaoke open API via the `@repo/open-api` workspace package.

## Commands

All commands run from `apps/web/`:

```bash
pnpm dev        # Start dev server with Turbopack (http://localhost:3000)
pnpm build      # Production build (also runs next-sitemap postbuild)
pnpm lint       # ESLint
pnpm format     # Prettier format all .ts, .tsx, .md files
pnpm start      # Start production server
```

No test suite is configured.

## Architecture

### Monorepo Structure

This is a pnpm workspace monorepo. The web app lives at `apps/web/`. Key workspace packages:
- `@repo/open-api` — wrapper around the external karaoke open API (used in API routes)
- `@repo/query` — shared TanStack Query setup
- `@repo/eslint-config`, `@repo/format-config` — shared tooling configs

### Tech Stack

- **Next.js 15** (App Router) with React 19
- **Supabase** (`@supabase/ssr`) for auth and database
- **TanStack Query** for server state
- **Zustand** for client state
- **Tailwind CSS v4** + **shadcn/ui** components in `src/components/ui/`
- **Axios** with a base `/api` instance in `src/lib/api/client.ts`
- **Framer Motion / GSAP** for animations

### Data Flow Pattern

1. **API routes** (`src/app/api/`) act as a BFF layer — client code calls these via Axios, never directly to Supabase or external APIs from the browser.
2. **API route handlers** use `src/lib/supabase/server.ts` (for Next.js route handlers) to get an authenticated Supabase client, then call `src/utils/getAuthenticatedUser.ts` to extract `userId`.
3. **Client-side API functions** live in `src/lib/api/` (e.g., `likeSong.ts`, `saveSong.ts`). They call internal Next.js API routes via the Axios instance.
4. **TanStack Query hooks** live in `src/queries/` — they wrap the `src/lib/api/` functions.

### Supabase Client Variants

Three different Supabase clients for different contexts:
- `src/lib/supabase/client.ts` — browser client (`createBrowserClient`), uses `NEXT_PUBLIC_` env vars
- `src/lib/supabase/server.ts` — server/route handler client (`createServerClient`)
- `src/lib/supabase/api.ts` — legacy API routes client (Next.js Pages-style `req/res`)
- `src/lib/supabase/middleware.ts` — middleware client (`updateSession`)

### Auth

`src/auth.tsx` is a client-side `AuthProvider` wrapping the app. It checks auth on every route change via `useAuthStore`. Public routes (no auth required): `/`, `/popular`, `/login`, `/signup`, `/recent`, `/tosing`, `/update-password`. All other routes redirect to `/login?alert=login`.

### State Management (Zustand)

- `src/stores/useModalStore.ts` — global message dialog state (use `openMessage`/`closeMessage`)
- `src/stores/useSearchHistoryStore.ts` — search history persisted to `localStorage`
- `src/stores/middleware.ts` — shared Zustand middleware
- Auth state is in `useAuthStore` (referenced but not shown above)

### Pages / Routes

- `/` → Song search (main feature, `src/app/search/HomePage.tsx`)
- `/popular` → Popular songs
- `/recent` → Recently added songs
- `/tosing` → User's "to-sing" list
- `/info` → User profile/info
- `/info/like` → Liked songs
- `/info/save` → Saved song folders (supports drag-and-drop via `@dnd-kit`)
- `/login`, `/signup`, `/update-password`, `/withdrawal` → Auth flows

### External Song Search API

Song searches go through `GET /api/open_songs/[type]/[param]` which proxies to `@repo/open-api`. Search types: `title`, `singer`, `composer`, `lyricist`, `no`, `release`, `popular`. The `brand` query param selects the karaoke brand.

### AI Chat

`POST /api/chat` proxies to OpenAI (using the `openai` package). Client-side in `src/lib/api/openAIchat.ts`, UI in `src/app/search/ChatBot.tsx`.

## Environment Variables

Required in `.env` / `.env.development.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL` (server-only, used in legacy API client)
- `SUPABASE_ANON_KEY` (server-only)
- OpenAI key for chat feature

## Git Conventions

### Branch Naming

Format: `<type>/<camelCaseName>`

| type | usage |
|------|-------|
| `feat` | new feature |
| `fix` | bug fix |
| `hotfix` | urgent fix |
| `chore` | maintenance, docs, config |
| `release` | release (e.g. `release/2.1.0`) |

The part after the slash uses camelCase (e.g. `feat/scrollText`, `feat/FooterNavbar`, `fix/loginAuth`).

Branch flow: `feat/*` → `develop` → `main`

### Commit Messages

Format: `<type> : <Korean description>` — one space before and after the colon.

| type | usage |
|------|-------|
| `feat` | new feature |
| `fix` | bug fix |
| `hotfix` | urgent bug fix |
| `chore` | version bump, config, format, cleanup |
| `refactor` | refactoring |
| `doc` | documentation |

Examples:
```
feat : MarqueeText 자동 스크롤 텍스트 적용
fix : SongCard css 수정
hotfix : 빌드 에러 수정. thumb 필드 옵셔널 타입 조정.
chore : 버전 2.3.0
refactor : useSearchSong 훅 분리 - 곡 모달 저장 분리
```

## Key Conventions

- Path alias `@/` maps to `src/`
- `src/utils/cn.ts` — `clsx` + `tailwind-merge` utility for className merging
- `src/utils/isSuccessResponse.ts` — type guard for API responses
- `src/utils/getErrorMessage.ts` — standardized error message extraction
- shadcn/ui components are in `src/components/ui/` and should not be modified directly
- `src/components/reactBits/` — custom animation components (AnimatedContent, SplitText, GradientText, Shuffle)
- Global toast notifications use `sonner` (`<Toaster>` in layout)
- Global modal dialog uses `useModalStore` + `<MessageDialog>` in layout
