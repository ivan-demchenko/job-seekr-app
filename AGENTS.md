# job-seekr-app

## Stack

- **Runtime:** Bun 1.2+ (use `bun` not `npm`/`node`)
- **Monorepo:** Bun workspaces (`packages/*`) — `@job-seekr/api`, `@job-seekr/data`, `@job-seekr/config`, `@job-seekr/web-client`
- **API:** Hono (Bun-native), runs on port 3000
- **Web client:** React 19 + Vite + Tailwind CSS v4 + TanStack Query + React Router 7
- **DB:** PostgreSQL + Drizzle ORM with Zod validation (`drizzle-zod`)
- **Auth:** Kinde (cloud) / fake local user (local)
- **Formatter/Linter:** Biome 1.9 (`bun run code:fix`)

## Dev commands

| Command | What |
|---|---|
| `bun install` | Install all deps |
| `bun run --filter=@job-seekr/* dev` | Start API + Vite (concurrently) |
| `bun run --filter=@job-seekr/api test` | Run API tests (no DB needed) |
| `bun run code:fix` | Format + lint (Biome) |
| `bun run --filter=@job-seekr/data db:migration:generate` | Generate Drizzle migration |
| `bun run --filter=@job-seekr/data db:migration:run` | Apply migrations |
| `docker compose up -d` | Full local prod-like stack |

## Architecture

- `packages/data/` — DB connection, Drizzle schemas, validation schemas, migrations
  - `domain/db.schemas.ts` — table definitions (`applications`, `interviews`, `interviewComments`)
  - `domain/validation.schemas.ts` — Zod schemas for API (re-exported as `./validation`)
- `packages/config/` — env var parsing via Zod (`HOSTING_MODE` discriminates cloud vs local)
- `packages/api/` — Hono app with controllers, repositories, routes, DTOs
  - `index.ts` — entrypoint (Bun serve)
  - `src/main.ts` — wires DB, auth middleware, controllers
  - `src/auth.middleware.ts` — `HOSTING_MODE=local` → fake user; `cloud` → Kinde OAuth
  - `src/main.router.ts` — routes + static file serving for built web-client
- `packages/web-client/` — SPA (Vite dev server on 5173, proxies `/api` → 3000)
  - `src/lib/api.ts` — typed Hono RPC client + TanStack Query options

## Key conventions

- **Local dev has no auth.** `HOSTING_MODE=local` injects a fake user; no Kinde setup needed
- **Tests** use Bun's built-in runner, hit the Hono app in-memory (no DB required), fake auth applies automatically
- **All `.ts` files** use `verbatimModuleSyntax` (must use `import type` for type-only imports)
- **Biome** with double quotes, 2-space indent, trailing whitespace trimmed
- **DB migration flow:** generate → commit migration SQL → run via `db:migration:run`
- **Build output** goes to `dist/` at repo root (Docker copies from there)
- **API + web-client share types** via `@job-seekr/api/api.types` and `@job-seekr/data/validation`

## Deployment

- Docker image built on git tag `v*.*.*` → pushed to `ghcr.io/ivan-demchenko/job-seekr-app`
- Multi-arch build (linux/amd64 + linux/arm64)
- Production requires `DATABASE_URL`, `KINDE_*` env vars, and `HOSTING_MODE=cloud`
