# JobBoard

A small full-stack job board: guests browse and filter open jobs, applicants register and apply, admins manage jobs and triage applications.

Built as a portfolio app — Next.js App Router, server components for public pages (no client-side data fetching), Prisma + SQLite for storage, hand-rolled JWT auth, shadcn/ui on Base UI primitives.

## Tech stack

| Layer        | Choice                                  |
| ------------ | --------------------------------------- |
| Framework    | Next.js 16.2.4 (App Router) + Turbopack |
| Language     | TypeScript 5.9.3                        |
| UI           | Tailwind CSS 4 + shadcn/ui (Base UI)    |
| Forms        | react-hook-form 7.74 + Zod 4            |
| Auth         | jose (HS256 JWT) + bcryptjs (12 rounds) |
| ORM          | Prisma 6.19.3                           |
| DB (dev)     | SQLite                                  |
| DB (prod)    | Turso or Neon (deferred — see Deploy)   |
| Icons        | lucide-react                            |
| Hosting      | Vercel Hobby (free)                     |

All `package.json` versions are pinned exact (no `^`/`~`).

## Setup

```bash
npm install
cp .env.example .env
# edit .env to set JWT_SECRET (generate with: openssl rand -base64 32)
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command              | Purpose                          |
| -------------------- | -------------------------------- |
| `npm run dev`        | Dev server (Turbopack)           |
| `npm run build`      | Production build                 |
| `npm start`          | Production server                |
| `npm run lint`       | ESLint                           |
| `npm run db:migrate` | Apply Prisma migration           |
| `npm run db:seed`    | Seed users, jobs, applications   |
| `npm run db:studio`  | Open Prisma Studio               |

## Seeded accounts

| Role      | Email                  | Password       |
| --------- | ---------------------- | -------------- |
| Admin     | `admin@example.com`    | `Admin123!`    |
| Applicant | `alice@example.com`    | `Password123!` |
| Applicant | `bob@example.com`      | `Password123!` |

The seed creates 10 jobs (mix of full-time, part-time, remote across Manila, Singapore, Tokyo, Remote; 8 OPEN, 2 CLOSED) and 4 applications spanning every status. Re-running `npm run db:seed` is idempotent.

## Project structure

```
app/
  (public)/        # /, /jobs, /jobs/[id], /login, /register
  (auth)/          # /dashboard/* (session required, via middleware)
  (admin)/         # /admin/* (admin role required, re-checked in layout)
  api/             # auth + jobs + applications routes
  robots.ts
  sitemap.ts
  layout.tsx
lib/
  auth.ts          # JWT sign/verify, cookie, getSession
  rbac.ts          # requireUser, requireAdmin (re-reads role from DB)
  validators.ts    # Zod schemas + Prisma↔API enum mappers
  serialize.ts     # Job/Application → API response shape
  password.ts, prisma.ts, rate-limit.ts, logger.ts, utils.ts
components/        # navbar, job-card, apply-dialog, job-form, etc.
middleware.ts      # edge-level signature check on /dashboard/*, /admin/*
prisma/
  schema.prisma
  seed.ts
```

## Security notes

Implements OWASP Top 10 (2021) baseline — see `SPEC.md` §12 for the full mapping.

- **Auth**: JWT HS256 via `jose`, 7-day cookie (`HttpOnly`, `SameSite=lax`, `Secure` in production), bcryptjs at 12 rounds, password policy 8–72 chars with letter + number.
- **RBAC**: every API handler calls `requireUser()` or `requireAdmin()` first; admin mutations always re-read role from DB rather than trusting the JWT claim. Middleware (edge) checks JWT signature for `/dashboard/*` and additionally checks `role === "ADMIN"` from the JWT claim for `/admin/*` so the admin UI never streams to non-admins. The admin route-group layout also re-reads role from DB as defense-in-depth.
- **IDOR**: `/api/applications/me` filters by `session.userId` server-side; the client cannot pass `userId`.
- **Rate limiting**: `/api/auth/login` and `/api/auth/register` throttled to 5 attempts per IP per 15 minutes via in-memory `Map`. **Production note:** swap for Redis or an Upstash KV — a serverless instance memory map doesn't share state across cold-started lambdas.
- **CSRF**: `SameSite=lax` cookies + JSON-only mutating routes covers the portfolio scope. For higher-trust deployments, add a double-submit CSRF token.
- **Headers** (set in `next.config.ts`): CSP, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. `X-Powered-By` removed.
- **CSP exception**: `script-src 'self' 'unsafe-inline'` is required for Next 16's inline bootstrap. Switch to nonce-based CSP for higher-assurance deploys.
- **JSON-LD exception**: the only `dangerouslySetInnerHTML` in the codebase is the `JobPosting` JSON-LD on `/jobs/[id]`. The content is `JSON.stringify` of trusted server data with `<` escaped to `<` to prevent any `</script>` injection.
- **`npm audit --omit=dev`**: 0 high/critical. 3 moderate via `postcss` (transitive through `next`) — fix would downgrade Next 16→9, breaking. Re-audit on every Next bump.
- **Logging**: structured JSON via `lib/logger.ts`. Never logs raw email/password/token; emails are hashed (SHA-256 truncated).

## Deploy to Vercel

1. Push to a public GitHub repo and import it on Vercel.
2. Set environment variables in the Vercel dashboard:
   - `DATABASE_URL` — point at a Turso libSQL or Neon Postgres free-tier URL. Switch the Prisma provider in `prisma/schema.prisma` if you choose Postgres, then `prisma migrate deploy`.
   - `JWT_SECRET` — generate with `openssl rand -base64 32`.
   - `JWT_EXPIRES_IN` — `7d` (or your preference).
   - `SITE_URL` — `https://your-domain.vercel.app` (used for canonicals, OG, sitemap, JSON-LD).
3. Deploy. Vercel runs `npm run build` automatically; CI uses `npm ci` (clean, lockfile-driven).
4. Run `npx prisma migrate deploy` against the production database (manually or via a one-off CI job — there is no CI configured here on purpose).

## Free-tier limits

- Vercel Hobby: 100 GB-hours/month of serverless execution, 100 GB bandwidth.
- Turso free: 9 GB total storage, 1B row reads/month.
- Neon free: 0.5 GB storage, 100 hours of compute time.

In-memory rate-limiting state is per-instance, so on Vercel it effectively rate-limits per warm lambda. Production deployments handling real traffic should swap to Redis/Upstash KV.

## Out of scope

File uploads (resume is a URL), email verification, password reset, 2FA, social login, payments, multi-tenancy, i18n, analytics, A/B testing, admin UI for managing users (set role via DB seed), saved jobs, job alerts, comments, cursor pagination, tests (unit/integration/e2e), CI beyond Vercel default.

## Deviations from spec

`SPEC.md` was originally written for Next 14.2.15 / React 18 / Tailwind 3.4 / Prisma 5.18 / Zod 3 / Radix-based shadcn / lucide 0.4 / etc. This implementation uses the latest stable equivalents per project guidance:

- Next 16, React 19, Tailwind 4 (CSS-config), Prisma 6 (Prisma 7 requires an external `prisma.config.ts` + adapter, breaking SQLite simplicity), Zod 4, jose 6, bcryptjs 3, lucide-react 1.x, ESLint 9 (flat config).
- shadcn primitives are now Base UI (`@base-ui/react`), not Radix. Pattern changes: `Button`/`DialogTrigger` no longer accept `asChild` — use `buttonVariants()` className on `<Link>` and controlled-state Dialogs. `DropdownMenuItem` uses `onClick={router.push}` instead of `asChild` + `Link`.
- Next 16 deprecates `middleware.ts` in favour of `proxy.ts` (same semantics). Kept as `middleware.ts` per spec; rename when convenient.
- Next 16 dynamic route handlers receive `params` as a Promise — `await params` everywhere.
- Added `lib/serialize.ts` (one file beyond spec's lib list) so Job/Application → API serialization (lowercased enums, embedded `job`/`user`) lives in one place.
