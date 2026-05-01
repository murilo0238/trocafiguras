# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on port 8080
npm run build      # Production build
npm run build:dev  # Development build
npm run preview    # Preview production build
npm run lint       # Lint with ESLint
```

There is no test suite configured.

## Architecture

**Troca Figurinha** is a World Cup sticker collection and trading web app. React + TypeScript frontend with Supabase (PostgreSQL + Auth) as the backend.

**Stack:** Vite, React 18, TypeScript, TanStack React Query, shadcn/ui, Tailwind CSS, React Router v6, Supabase JS client.

**Source layout:**
- `src/pages/` — Route-level components: `Index`, `Auth`, `ResetPassword`, `Profile`, `NotFound`
- `src/components/` — Feature components (sticker cards, trading panel, QR codes, rankings, filters). `src/components/ui/` holds the full shadcn/ui library — don't hand-edit those files.
- `src/hooks/` — All data fetching and business logic lives here as custom hooks. `useAuth.tsx` provides the auth context. Other hooks (`useStickerCollection`, `useTrading`, `useTradeRequests`, `useStickerStats`) wrap React Query calls to Supabase.
- `src/integrations/supabase/` — Supabase client (`client.ts`) and auto-generated TypeScript types (`types.ts`). Regenerate types with the Supabase CLI when the schema changes; do not edit `types.ts` by hand.
- `src/data/teams.ts` — Static sticker/team data.

**Data flow:** Components call custom hooks → hooks use React Query + Supabase client → Supabase RLS policies enforce access control at the database level. Authentication state is provided via `useAuth` context (wraps `supabase.auth`).

**Path alias:** `@/` maps to `src/`.

**TypeScript:** Strict mode is off (`noImplicitAny` and `strictNullChecks` are false in tsconfig).

## Supabase

Credentials are in `.env` (never commit new secrets). The Supabase project config lives in `supabase/config.toml`. RLS policies are the primary access control mechanism — all queries go through the typed client in `src/integrations/supabase/client.ts`.

## Styling

Tailwind with custom theme tokens in `tailwind.config.ts`: custom colors (`gold`, card state colors), Fredoka font family, and extra animations. Use these tokens for new UI rather than raw hex values.
