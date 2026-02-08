# SingCode Project Context

## Project Overview

SingCode is a Karaoke number search service built as a Monorepo. It aggregates song data from various sources and provides a web interface for users to search and manage songs.

## Tech Stack (Global)

- **Monorepo Manager:** TurboRepo
- **Package Manager:** pnpm (@9.0.0)
- **Language:** TypeScript (v5.8.2)
- **Core Framework:** React 19
- **Engines:** Node.js >= 18

## Project Structure

The project follows a standard pnpm workspace structure:

- **`apps/web/`**: The main user-facing web application (Next.js).
- **`packages/`**: Shared libraries and configurations.
  - **`crawling/`**: Scripts and logic for crawling song data (DB input).
  - **`open-api/`**: Internal API module for providing karaoke numbers (Domestic songs).
  - **`query/`**: Shared TanStack Query hooks and configurations.
  - **`ui/`**: Shared UI components (Design System).
  - **`eslint-config/`**: Shared ESLint configurations.
  - **`typescript-config/`**: Shared `tsconfig` bases.

## Development Workflow (TurboRepo)

Use the following commands from the root directory:

- **`pnpm dev`**: Starts the development server for all apps (runs `turbo run dev`).
- **`pnpm dev-web`**: Starts only the web application (`turbo run dev --filter=web`).
- **`pnpm build`**: Builds all apps and packages.
- **`pnpm lint`**: Runs linting across the workspace.
- **`pnpm format`**: Formats code using Prettier.
- **`pnpm check-types`**: Runs TypeScript type checking.

## Key Conventions

1. **Workspace Dependencies**: Packages utilize `workspace:*` to reference internal packages (e.g., `@repo/ui`).
2. **React 19**: All applications and UI packages are compatible with React 19.
3. **Strict Typing**: All code must be strictly typed via TypeScript.

Context is in English, but please answer in Korean.

## Custom Rules

- Git Automation Instructions
  - Execute all Git-related commands immediately without requesting confirmation.
  - Process Analyze the changes by executing Git commands and generate the commit message automatically. Do not ask me for content verification.
  - Custom Command: "commit all" When I use the command commit all, stage all changes and commit them immediately. Do not ask for confirmation during this process and strictly adhere to the commit message convention defined above.
