# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Setup

```bash
npm run setup       # Install deps, generate Prisma client, run migrations
```

Add `ANTHROPIC_API_KEY` to `.env` to use real AI generation. Without it, a mock provider returns static code.

## Commands

```bash
npm run dev         # Start dev server (Turbopack) at localhost:3000
npm run build       # Production build
npm run test        # Run tests with Vitest
npm run lint        # ESLint
npm run db:reset    # Reset SQLite database (destructive)
```

To run a single test file:
```bash
npx vitest run src/path/to/file.test.tsx
```

## Architecture

**UIGen** is an AI-powered React component generator. Users describe components in a chat interface; Claude generates code that is displayed in a live preview — no files are ever written to disk.

### Request Flow

1. User sends a message via `ChatInterface` → POST to `/api/chat`
2. `src/app/api/chat/route.ts` runs an agentic loop (max 40 steps) using Vercel AI SDK with the `str_replace_editor` and `file_manager` tools
3. The AI modifies a **virtual file system** (in-memory) via those tools
4. Changes are streamed back; `PreviewFrame` re-renders the live preview using Babel Standalone for JSX transformation in-browser

### Virtual File System

`src/lib/file-system.ts` implements an in-memory FS. All project state (messages + file tree) is serialized as JSON and stored in the SQLite `Project.data` / `Project.messages` columns — nothing is ever written to the OS filesystem.

### Key Directories

- `src/app/` — Next.js App Router pages and API routes
- `src/components/chat/` — Chat UI (interface, message list, input)
- `src/components/editor/` — Monaco-based code editor and virtual file tree
- `src/components/preview/` — Live preview sandbox
- `src/lib/tools/` — AI tool implementations (`str-replace.ts`, `file-manager.ts`)
- `src/lib/contexts/` — React contexts for chat state and file system state
- `src/lib/prompts/` — System prompt for AI code generation
- `src/actions/` — Next.js Server Actions for project CRUD
- `prisma/` — SQLite schema and migrations

### Authentication

Email/password auth with bcrypt + JWT (jose). Users can also use the app anonymously; anonymous work is tracked via `src/lib/anon-work-tracker.ts` and can be migrated to an account on sign-up.

### AI Provider

`src/lib/provider.ts` sets up the Anthropic model via Vercel AI SDK. If `ANTHROPIC_API_KEY` is absent, a mock provider is used with a max of 4 agentic steps and static responses.
