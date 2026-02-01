# Web Application Context (`apps/web`)

## Overview

This is the main Next.js web application for SingCode. It serves as the frontend client for searching songs, viewing lyrics, and user interaction.

## Tech Stack

- **Framework:** Next.js 15.2.7 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, `tailwind-merge`, `clsx`, `class-variance-authority` (CVA).
- **UI Components:** Radix UI Primitives, Lucide React (Icons).
- **State Management:**
  - **Server State:** TanStack Query (`@repo/query`, v5).
  - **Client Global State:** Zustand.
  - **Local State:** React Hooks (`useState`, `useReducer`).
- **Backend & Auth:** Supabase (Auth, DB, SSR).
- **Animations:** GSAP, Motion (Framer Motion), Lottie, `tw-animate-css`.
- **Utilities:** `date-fns`, `immer`, `axios`.

## Key Features & Libraries

- **Drag & Drop:** `@dnd-kit` is used for interaction.
- **Physics Engine:** `matter-js` is used for specific visual effects.
- **AI Integration:** `openai` SDK is integrated for AI-related features.
- **Analytics:** PostHog, Vercel Analytics/Speed Insights.

## Coding Conventions & Guidelines

### 1. Component Structure

- Use **Functional Components** with TypeScript interfaces for props.
- Use `shadcn/ui` patterns: Combine Radix UI primitives with Tailwind CSS.
- Use `cn()` utility (clsx + tailwind-merge) for conditional class names.
  ```tsx
  // Example
  <div className={cn('bg-white p-4', className)}>...</div>
  ```

Context is in English, but please answer in Korean.
