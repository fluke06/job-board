# Job Board — Build Plan for Claude Code

> **How to use this document:** Read this file once at the start of the session. Work through phases in order. Do not skip ahead. After each phase, run the Verify step before moving on. If a Verify step fails, fix before continuing — do not accumulate broken state.

---

## 0. Operating Rules (read first, follow always)

1. **No improvisation on stack.** Every package and version is locked in §1 of the spec. If you think something else is needed, stop and ask.
2. **No tests, no Docker, no CI configs, no Storybook.** Out of scope.
3. **No comments unless non-obvious.** No JSDoc. Code should be self-explanatory through naming.
4. **No `try/catch` around code that cannot throw.** No defensive null checks for values guaranteed by types.
5. **Build order is sacred:** schema → lib → API → middleware → public pages → auth pages → dashboard → admin → security headers → SEO. Do not retrofit security/SEO mid-build.
6. **Read these files once, never re-derive their contents:**
   - `prisma/schema.prisma` (source of DB types)
   - `lib/validators.ts` (source of input types via `z.infer`)
   - `lib/auth.ts` (source of session shape)
7. **Pin exact versions in `package.json`.** No `^`, no `~`.
8. **Stop and report after each phase.** One sentence: "Phase N complete, [N] files created, verified by [command]." Wait for "continue" before next phase. This prevents runaway token use.
9. **Reference the spec by section number** when implementing (e.g., "implementing §12 A05"). Do not paraphrase the spec back at the user.
10. **If blocked, ask one specific question.** Do not guess.

---

## 1. Tech Stack (locked)

### Core
- Next.js `14.2.15` (App Router) + TypeScript `5.4.5` + Node 20 LTS
- Prisma `5.18.0` + SQLite (dev) / Turso or Neon (prod, deferred)
- Tailwind `3.4.10` + **shadcn/ui** (dashboard + admin UI) + Radix (via shadcn) + lucide-react `0.400.0`
- `react-hook-form` `7.52.2` + `@hookform/resolvers` `3.9.0` + `zod` `3.23.8`
- `jose` `5.6.3` (JWT) + `bcryptjs` `2.4.3` (password hashing)

### Excluded (do not add)
NextAuth, Lucia, Clerk, Auth0, Redux, Zustand, TanStack Query, SWR, Axios, Material UI, Chakra, Ant Design, Mantine, Docker, Jest, Playwright, Husky, Sentry, Stripe, Resend, Cloudinary, S3, Redis, Upstash.

### Hosting target
Vercel Hobby (free) + Turso or Neon free tier. Total cost: $0/mo.

### `package.json` (use exactly this)

```json
{
  "name": "job-board",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "prisma": { "seed": "tsx prisma/seed.ts" },
  "dependencies": {
    "next": "14.2.15",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@prisma/client": "5.18.0",
    "jose": "5.6.3",
    "bcryptjs": "2.4.3",
    "zod": "3.23.8",
    "react-hook-form": "7.52.2",
    "@hookform/resolvers": "3.9.0",
    "lucide-react": "0.400.0",
    "tailwindcss": "3.4.10",
    "class-variance-authority": "0.7.0",
    "clsx": "2.1.1",
    "tailwind-merge": "2.5.2"
  },
  "devDependencies": {
    "@types/node": "20.14.10",
    "@types/react": "18.3.3",
    "@types/bcryptjs": "2.4.6",
    "typescript": "5.4.5",
    "prisma": "5.18.0",
    "tsx": "4.16.2",
    "eslint": "8.57.0",
    "eslint-config-next": "14.2.15",
    "postcss": "8.4.41",
    "autoprefixer": "10.4.20"
  }
}
```

---

## 2. Project Structure (target)

```
app/
  (public)/
    page.tsx
    jobs/page.tsx
    jobs/[id]/page.tsx
    login/page.tsx
    register/page.tsx
  (auth)/
    layout.tsx                    # session guard
    dashboard/page.tsx
    dashboard/applications/page.tsx
  (admin)/
    layout.tsx                    # admin guard
    admin/page.tsx
    admin/jobs/page.tsx
    admin/jobs/new/page.tsx
    admin/jobs/[id]/edit/page.tsx
    admin/applications/page.tsx
  api/
    auth/register/route.ts
    auth/login/route.ts
    auth/logout/route.ts
    auth/me/route.ts
    jobs/route.ts
    jobs/[id]/route.ts
    jobs/[id]/apply/route.ts
    applications/me/route.ts
    admin/applications/route.ts
    admin/applications/[id]/status/route.ts
  layout.tsx
  globals.css
  robots.ts
  sitemap.ts
  loading.tsx
lib/
  prisma.ts
  auth.ts
  password.ts
  validators.ts
  rbac.ts
  rate-limit.ts
  logger.ts
  utils.ts
components/
  ui/                             # shadcn primitives (auto-generated)
  navbar.tsx
  job-card.tsx
  job-filters.tsx
  apply-dialog.tsx
  status-badge.tsx
  job-form.tsx
  application-row.tsx
middleware.ts
prisma/
  schema.prisma
  seed.ts
next.config.js
tailwind.config.ts
tsconfig.json
.env.example
README.md
```

---

## 3. Phased Task List

Each phase has: **Goal → Tasks → Files → Verify**. Stop after each Verify step.

---

### Phase 1 — Project bootstrap

**Goal:** Empty Next.js project that runs.

**Tasks:**
1. `npx create-next-app@14.2.15 . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"` — accept defaults for the rest.
2. Replace `package.json` with the exact one in §1.
3. `npm install`.
4. `npx shadcn@latest init` — choose: Default style, Slate base color, CSS variables yes.
5. Install all shadcn components in one command:
   ```
   npx shadcn@latest add button input textarea select card badge table dialog label dropdown-menu form sonner skeleton tabs avatar separator
   ```
6. Create `.env.example` per spec §3, then copy to `.env`.
7. Generate `JWT_SECRET`: `openssl rand -base64 32` and put in `.env`.

**Verify:**
- `npm run dev` starts, `http://localhost:3000` loads default Next page.
- `components/ui/` contains 16 component files.
- `cat package.json | grep '"\^\\|"~"'` returns nothing (no caret/tilde versions).

**Stop and report.**

---

### Phase 2 — Database schema

**Goal:** Prisma schema migrated, client generated.

**Tasks:**
1. Create `prisma/schema.prisma` per spec §4 (exact schema, do not modify).
2. `npx prisma migrate dev --name init`.
3. Verify the migration file in `prisma/migrations/` was created.

**Verify:**
- `npx prisma studio` opens, shows 3 empty tables.
- `node -e "const{PrismaClient}=require('@prisma/client');new PrismaClient().\$connect().then(()=>console.log('ok'))"` prints `ok`.

**Stop and report.**

---

### Phase 3 — `lib/` utilities

**Goal:** All shared libs exist before any route uses them. Build in this order so each file only depends on previous files.

**Tasks (in order):**

1. **`lib/prisma.ts`** — Prisma client singleton (handles HMR).
2. **`lib/utils.ts`** — `cn()` helper from shadcn (already created by shadcn init; verify it exists).
3. **`lib/password.ts`** — `hashPassword(plain)` (bcryptjs, **12 rounds** per §12 A02), `verifyPassword(plain, hash)`.
4. **`lib/validators.ts`** — All Zod schemas per spec §7. Export `z.infer` types. Include the API-enum-to-Prisma-enum mapper (`mapJobType`, `mapJobStatus`, `mapAppStatus`).
5. **`lib/auth.ts`** — `signToken({sub, role})`, `verifyToken(jwt)`, `getSession()` (reads `session` cookie via `next/headers`, returns `{userId, role} | null`), `setSessionCookie(response, token)`, `clearSessionCookie(response)`. Cookie attrs per §12 A02.
6. **`lib/rbac.ts`** — `requireUser()` (returns session or throws 401), `requireAdmin()` (returns session or throws 403, **re-reads role from DB** per §12 A01).
7. **`lib/rate-limit.ts`** — In-memory `Map<string, {count, resetAt}>`. Export `checkRateLimit(key, limit, windowMs)`. Per §12 A04: 5 req / 15 min for auth.
8. **`lib/logger.ts`** — `logEvent(type, data)`. Redact `password`, `passwordHash`, `token`, `cookie`, full `email` (log SHA-256 hash of email instead). Output: `console.log(JSON.stringify({ts, type, ...redacted}))`.

**Verify:**
- `npx tsc --noEmit` passes (no type errors).
- Each file exports what's listed above (grep the file).

**Stop and report.**

---

### Phase 4 — Auth API routes

**Goal:** All 4 auth endpoints work end-to-end.

**Tasks:**
1. `app/api/auth/register/route.ts` — POST. Validate with `registerSchema`. Hash password. Insert user. Sign JWT. Set cookie. Return `201 {user}`. Handle `409` on email conflict.
2. `app/api/auth/login/route.ts` — POST. Apply `checkRateLimit` keyed on IP (`req.headers.get('x-forwarded-for') ?? 'local'`). Generic error message (§12 A04). Log auth event (§12 A09).
3. `app/api/auth/logout/route.ts` — POST. Clear cookie. Return `200 {ok:true}`.
4. `app/api/auth/me/route.ts` — GET. Read session, fetch user (without `passwordHash`), return `200 {user}` or `401`.

**Verify (use curl, save cookies between calls):**
```bash
# Register
curl -i -c cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Password123"}'
# expect 201

# Me
curl -i -b cookies.txt http://localhost:3000/api/auth/me
# expect 200 with user

# Logout
curl -i -b cookies.txt -X POST http://localhost:3000/api/auth/logout
# expect 200 + clear cookie

# Rate limit (run 6 times fast)
for i in {1..6}; do curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"x@x.com","password":"wrong"}'; done
# expect: 401 401 401 401 401 429
```

**Stop and report.**

---

### Phase 5 — Jobs + Applications API routes

**Goal:** All remaining API routes work.

**Tasks:**
1. `app/api/jobs/route.ts` — GET (public, with filters per spec §6), POST (admin).
2. `app/api/jobs/[id]/route.ts` — GET (public), PUT (admin), DELETE (admin).
3. `app/api/jobs/[id]/apply/route.ts` — POST (applicant only). 404 if missing, 400 if closed, 409 if duplicate.
4. `app/api/applications/me/route.ts` — GET (any authed user). Always filtered by `session.userId` (§12 A01 IDOR protection).
5. `app/api/admin/applications/route.ts` — GET (admin).
6. `app/api/admin/applications/[id]/status/route.ts` — PUT (admin).

**Implementation note:** Every handler's first 3 lines should be: parse body (if applicable) → validate with Zod → call `requireUser()` or `requireAdmin()`. If any throws, return the appropriate status.

**Verify:**
```bash
# Login as admin (after Phase 7 seed; for now, manually set role in Prisma Studio)
# Then test:
curl -i http://localhost:3000/api/jobs                    # 200, empty or seeded
curl -i http://localhost:3000/api/jobs?type=remote        # 200, filtered
curl -i http://localhost:3000/api/jobs/nonexistent-id     # 404
curl -i -X DELETE http://localhost:3000/api/jobs/x        # 401 (not logged in)
```

**Stop and report.**

---

### Phase 6 — Middleware + route group layouts

**Goal:** Protected routes redirect correctly.

**Tasks:**
1. `middleware.ts` — match `/dashboard/:path*` and `/admin/:path*`. Redirect to `/login` if no session. **Note:** middleware runs on edge, can only verify JWT signature, NOT re-check DB role. Role check lives in the layout below (§12 A01 defense in depth).
2. `app/(auth)/layout.tsx` — server component. Calls `getSession()`. Redirects to `/login` if null.
3. `app/(admin)/layout.tsx` — server component. Calls `requireAdmin()` (which re-reads role from DB). Redirects to `/` if not admin.

**Verify:**
- Logged out, visiting `/dashboard` → redirects to `/login`.
- Logged in as applicant, visiting `/admin` → redirects to `/`.
- Logged in as admin, visiting `/admin` → loads (will be empty until Phase 9, but should not redirect).

**Stop and report.**

---

### Phase 7 — Seed data

> **This phase is a candidate for a subagent** if you want to test the workflow. The task is isolated: read `prisma/schema.prisma`, write `prisma/seed.ts`, run it. No other files touched. If running solo (no subagent), just do it inline.

**Goal:** Database populated with realistic data.

**Tasks:**
1. `prisma/seed.ts` per spec §9: 1 admin, 2 applicants, 10 jobs (mix of types and 4 locations: Manila, Remote, Singapore, Tokyo), 4 applications across statuses.
2. `npm run db:seed`.

**Verify:**
- Prisma Studio shows the seeded rows.
- `curl http://localhost:3000/api/jobs` returns 10 jobs.
- Login with `admin@example.com` / `Admin123!` succeeds.

**Stop and report.**

---

### Phase 8 — Public pages

**Goal:** Guest experience works end-to-end.

**Tasks (build in this order):**
1. `app/layout.tsx` — root layout with `<html lang="en">`, `next/font` (Geist), `<Navbar />`, `<main>`, footer. Toaster from `sonner`.
2. `components/navbar.tsx` — links: Home, Jobs, Login/Register OR Dashboard/Logout based on session.
3. `app/(public)/page.tsx` — landing. Hero + 3 most recent open jobs (server component, Prisma direct, not API).
4. `components/job-card.tsx` — shadcn `Card` with title, company, location, type badge, "View" link.
5. `components/job-filters.tsx` — client component reading/writing search params. Inputs: search, type checkboxes, location.
6. `app/(public)/jobs/page.tsx` — server component. Reads search params. Prisma query with filters. Pagination. `export const revalidate = 60` per §14.
7. `app/(public)/jobs/[id]/page.tsx` — server component. Job detail. If session is applicant and not yet applied, render `<ApplyDialog />`. If admin, render Edit/Delete buttons.
8. `components/apply-dialog.tsx` — client component. shadcn `Dialog` with form (cover letter, optional resume URL). Posts to `/api/jobs/:id/apply`. Toasts on success/error.
9. `app/(public)/login/page.tsx` and `/register/page.tsx` — shadcn `Form` (which wires react-hook-form + zod automatically). Posts to API. On success, `router.push('/dashboard'); router.refresh()`.
10. `app/loading.tsx` — skeleton for `/jobs` per §14.

**Verify:**
- Lighthouse run on `/` and `/jobs` in dev mode (will not be 100, but should have no console errors).
- Apply flow works: register → login → /jobs/[id] → apply → see toast.
- Filtering by type + search works (URL updates, results filter).

**Stop and report.**

---

### Phase 9 — Dashboard (applicant)

**Goal:** Applicant private pages.

**Tasks:**
1. `app/(auth)/dashboard/page.tsx` — server component. Show user name, count of applications by status (use shadcn `Card` × 4).
2. `app/(auth)/dashboard/applications/page.tsx` — server component. shadcn `Table` with columns: Job, Company, Applied, Status (use `<StatusBadge />`).
3. `components/status-badge.tsx` — shadcn `Badge` with variants per status.

**Verify:**
- Login as `alice@example.com`, see her applications from seed.
- Counts match the table.

**Stop and report.**

---

### Phase 10 — Admin pages

**Goal:** Admin can manage everything.

**Tasks:**
1. `app/(admin)/admin/page.tsx` — overview cards: total jobs, open jobs, total applications, pending applications.
2. `app/(admin)/admin/jobs/page.tsx` — shadcn `Table` of all jobs. Row actions via `DropdownMenu`: Edit, Delete (opens confirmation `Dialog`). "New Job" button.
3. `components/job-form.tsx` — shared form for new + edit. shadcn `Form` with all fields from `jobCreateSchema`.
4. `app/(admin)/admin/jobs/new/page.tsx` — wraps `<JobForm mode="create" />`.
5. `app/(admin)/admin/jobs/[id]/edit/page.tsx` — server component fetches job, wraps `<JobForm mode="edit" defaultValues={...} />`.
6. `app/(admin)/admin/applications/page.tsx` — shadcn `Table` with embedded user + job. Status changed inline via shadcn `Select` (calls PUT endpoint, then `router.refresh()`).

**Verify:**
- Login as admin, create a job, see it appear in `/jobs`.
- Edit the job, change is reflected.
- Delete the job (confirmation dialog appears).
- Change an application's status, refresh, status persists.

**Stop and report.**

---

### Phase 11 — Security headers + hardening (§12)

**Goal:** All headers from spec §12 A05 present on every response.

**Tasks:**
1. `next.config.js` — `headers()` async function returning the 7 headers from §12 A05 for `source: '/:path*'`. Set `poweredByHeader: false`, `productionBrowserSourceMaps: false`.
2. Verify `lib/auth.ts` cookie has `secure: process.env.NODE_ENV === 'production'`.
3. Audit codebase: grep for `dangerouslySetInnerHTML`, `$queryRawUnsafe`, `eval`, `new Function`. Should be 0 hits.
4. Run `npm audit --omit=dev`. Document any findings in README.

**Verify:**
```bash
npm run build && npm start &
sleep 3
curl -sI http://localhost:3000/ | grep -E "Content-Security-Policy|Strict-Transport|X-Content-Type|X-Frame|Referrer-Policy|Permissions-Policy"
# expect 6 lines (HSTS only sets in HTTPS but header should still appear)
```

**Stop and report.**

---

### Phase 12 — SEO (§13)

**Goal:** Lighthouse SEO = 100, valid Job Posting structured data.

**Tasks:**
1. Add `metadata` export to every page (title, description, openGraph, twitter, alternates.canonical).
2. `app/robots.ts` — allow `/`, `/jobs`, `/login`, `/register`. Disallow `/dashboard`, `/admin`, `/api`.
3. `app/sitemap.ts` — list `/`, `/jobs`, and dynamic `/jobs/[id]` for all `OPEN` jobs.
4. On `app/(public)/jobs/[id]/page.tsx`, render JSON-LD `JobPosting` with required Google fields per §13.
5. `generateMetadata` on job detail pages: `title: ${job.title} at ${job.company} | JobBoard`.
6. Verify all internal links use `next/link`. Verify all images have `alt`.

**Verify:**
- `curl http://localhost:3000/robots.txt` returns expected.
- `curl http://localhost:3000/sitemap.xml` returns expected URLs.
- View source on `/jobs/[id]`, contains `<script type="application/ld+json">` with valid JSON.
- Paste page URL into Google Rich Results Test (you may run this manually).

**Stop and report.**

---

### Phase 13 — Final polish + README

**Goal:** Project is shippable.

**Tasks:**
1. `README.md` — sections: Overview, Tech Stack, Setup (the 5 commands), Seeded Accounts, Security Notes (link to §12), Deploy to Vercel guide, Free-tier limits.
2. Run `npm run build`. Fix any TypeScript or ESLint errors.
3. Run Lighthouse on production build (`npm start`):
   - On `/jobs/[id]`: Performance ≥95, Accessibility ≥95, Best Practices ≥95, SEO = 100.
   - If any miss target, identify the specific audit failing and fix.

**Verify (final acceptance — spec §16):**
1. ☐ `npm run dev` starts cleanly after the 5 setup commands.
2. ☐ All 4 auth routes work; `/api/auth/me` returns 401/200 correctly.
3. ☐ Guest can browse, filter, paginate.
4. ☐ Applicant can register, login, apply once per job, view applications.
5. ☐ Admin can CRUD jobs, change application statuses.
6. ☐ Middleware blocks unauthenticated/non-admin routes.
7. ☐ Duplicate applications return 409.
8. ☐ `npx prisma studio` shows seeded data.
9. ☐ `npm run build` succeeds with no errors.
10. ☐ `npm audit --omit=dev` shows 0 high/critical.
11. ☐ Security headers present (curl check from Phase 11).
12. ☐ `/robots.txt` and `/sitemap.xml` resolve.
13. ☐ Job detail JSON-LD validates.
14. ☐ Lighthouse on `/jobs/[id]`: SEO=100, others ≥95.
15. ☐ Login rate limit returns 429 after 5 attempts.
16. ☐ Logout clears cookie.
17. ☐ Applicant accessing `/admin` redirects.
18. ☐ Duplicate apply returns 409.

**Done.** Report total file count and any deferred items.

---

## 4. When NOT to ask

Don't ask permission for:
- Choosing variable names, function names within the conventions of the spec.
- Choosing layout details (spacing, copy text) when the spec doesn't dictate.
- Adding a small helper inside `lib/utils.ts` if reused 3+ times.

DO ask before:
- Adding a dependency not in §1.
- Skipping a Verify step.
- Deviating from the file structure in §2.
- Anything that contradicts §0.

---

## 5. Token-saving directives

- **Don't re-read `BUILD_PLAN.md` between phases.** Keep it in your working memory; the task list is small enough.
- **Don't re-read files you wrote in a previous phase** unless the current phase explicitly modifies them.
- **Don't run `npm install` after Phase 1** unless adding a dependency (which requires asking first).
- **Don't generate large code blocks for the user to review** unless they ask. Just write the file and report it was written.
- **Batch shadcn component additions** into one command (already done in Phase 1).
- **Don't print full file contents in your responses.** Reference paths and line numbers.

---

## 6. Where the spec lives

The full specification with all section references (§1–§17) is in the conversation history. This document is the **execution plan**, not the spec itself. When in doubt, the spec wins.
