# Job Board — Full Specification

> Authoritative reference for implementation. When `BUILD_PLAN.md` and this document conflict, **this document wins**. Section numbers (§1–§17) are referenced from the build plan.

---

## §1. Tech Stack (locked)

### Core Framework

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | `14.2.15` |
| Language | TypeScript | `5.4.5` |
| Runtime | Node.js | `20.x LTS` |

### Database & ORM

| Layer | Choice | Version |
|---|---|---|
| Database (dev) | SQLite | bundled |
| Database (prod) | Turso (libSQL) **or** Neon Postgres | latest free tier |
| ORM | Prisma | `5.18.0` |

### Auth & Security

| Layer | Choice | Version |
|---|---|---|
| JWT | `jose` | `5.6.3` |
| Password hashing | `bcryptjs` | `2.4.3` (12 rounds) |
| Validation | `zod` | `3.23.8` |
| Rate limit | in-memory `Map` | — |

### UI

| Layer | Choice | Version |
|---|---|---|
| CSS | Tailwind CSS | `3.4.10` |
| Components | shadcn/ui (copy-in) | latest CLI |
| Primitives | Radix (via shadcn) | bundled |
| Icons | `lucide-react` | `0.400.0` |
| Fonts | `next/font` + Geist | bundled |

### Forms

| Layer | Choice | Version |
|---|---|---|
| Forms | `react-hook-form` | `7.52.2` |
| Resolver | `@hookform/resolvers` | `3.9.0` |

### Excluded (do NOT add)

NextAuth/Auth.js, Lucia, Clerk, Auth0, Redux, Zustand, Jotai, TanStack Query, SWR, Axios, Material UI, Chakra, Ant Design, Mantine, Docker, Jest, Playwright, Storybook, Husky, lint-staged, Sentry, Stripe, Resend/SendGrid, Cloudinary, S3, Redis, Upstash, i18n libraries.

### Hosting

Vercel Hobby + Turso or Neon free tier. **Total cost: $0/mo.**

---

## §2. Project Structure

```
app/
  (public)/
    page.tsx
    jobs/page.tsx
    jobs/[id]/page.tsx
    login/page.tsx
    register/page.tsx
  (auth)/
    layout.tsx
    dashboard/page.tsx
    dashboard/applications/page.tsx
  (admin)/
    layout.tsx
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
  ui/                       # shadcn primitives
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

## §3. Environment Variables

`.env.example`:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-32-byte-random-string-from-openssl-rand-base64-32"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
```

Generate `JWT_SECRET` with: `openssl rand -base64 32`.

---

## §4. Prisma Schema

```prisma
generator client { provider = "prisma-client-js" }
datasource db    { provider = "sqlite"; url = env("DATABASE_URL") }

enum Role        { APPLICANT ADMIN }
enum JobType     { FULL_TIME PART_TIME REMOTE }
enum JobStatus   { OPEN CLOSED }
enum AppStatus   { PENDING REVIEWED ACCEPTED REJECTED }

model User {
  id           String        @id @default(cuid())
  name         String
  email        String        @unique
  passwordHash String
  role         Role          @default(APPLICANT)
  createdAt    DateTime      @default(now())
  jobs         Job[]         @relation("JobsCreated")
  applications Application[]
}

model Job {
  id           String        @id @default(cuid())
  title        String
  company      String
  location     String
  type         JobType
  salaryRange  String?
  description  String
  requirements String
  status       JobStatus     @default(OPEN)
  createdById  String
  createdBy    User          @relation("JobsCreated", fields: [createdById], references: [id])
  createdAt    DateTime      @default(now())
  applications Application[]

  @@index([status, type, location])
  @@index([createdAt])
}

model Application {
  id          String    @id @default(cuid())
  jobId       String
  job         Job       @relation(fields: [jobId], references: [id], onDelete: Cascade)
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  coverLetter String
  resumeUrl   String?
  status      AppStatus @default(PENDING)
  createdAt   DateTime  @default(now())

  @@unique([jobId, userId])
  @@index([userId, createdAt])
}
```

> **SQLite + enums note:** Prisma supports enums on SQLite at the schema level (mapped to `TEXT` with a CHECK constraint). If migration fails, fall back to `String` fields with TS-level enums imported from a shared `lib/enums.ts` — but try the schema above first.

---

## §5. Auth Strategy

- **Password hashing:** `bcryptjs`, **12 rounds**.
- **JWT:** HS256 via `jose`. Payload: `{ sub: userId, role, iat, exp }`. Lifetime per `JWT_EXPIRES_IN` env.
- **Cookie:** name `session`. Attributes: `httpOnly: true`, `secure: process.env.NODE_ENV === "production"`, `sameSite: "lax"`, `path: "/"`, `maxAge: 60 * 60 * 24 * 7` (7d).
- **`lib/auth.ts` exports:** `signToken({sub,role})`, `verifyToken(jwt)`, `getSession()`, `setSessionCookie(response, token)`, `clearSessionCookie(response)`.
- **`middleware.ts`** redirects unauthenticated `/dashboard/*` and `/admin/*` to `/login`. Cannot check DB role on edge — that is enforced in route-group layouts and `requireAdmin()`.

---

## §6. API Contract

All responses are JSON. Errors: `{ "error": "<message>" }`. Validation failures: `400 { "error": "Validation failed", "issues": [...] }` (issues = `error.issues` from Zod).

### Auth

| Method | Path | Body | Success | Errors |
|---|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | `201 { user: {id,name,email,role} }` + sets cookie | `409` email taken |
| POST | `/api/auth/login` | `{ email, password }` | `200 { user }` + sets cookie | `401` invalid creds, `429` rate limited |
| POST | `/api/auth/logout` | — | `200 { ok: true }` clears cookie | — |
| GET | `/api/auth/me` | — | `200 { user }` | `401` if no session |

`401` for login uses generic message: `"Invalid email or password"`. Never disclose whether email exists.

### Jobs

**`GET /api/jobs`** — public. Query params:

- `q` — string, searches `title`, `company`, `description` (case-insensitive `contains`)
- `type` — `full-time` | `part-time` | `remote`
- `location` — string, case-insensitive `contains`
- `status` — `open` | `closed` | `all`. Default: `open`. Non-admin callers cannot use `closed` or `all`; if they pass it, silently coerce to `open`.
- `page` — int ≥1, default 1
- `pageSize` — int 1–50, default 10

Response: `200 { items: Job[], page, pageSize, total }`. Order: `createdAt desc`.

**`GET /api/jobs/:id`** — public. `200 { job }` or `404`.

**`POST /api/jobs`** — admin only. Body matches `jobCreateSchema` (§7). Returns `201 { job }`. Sets `createdById` from session.

**`PUT /api/jobs/:id`** — admin only. Partial update via `jobUpdateSchema`. Returns `200 { job }` or `404`.

**`DELETE /api/jobs/:id`** — admin only. Returns `200 { ok: true }` or `404`. Cascades to applications.

### Applications

**`POST /api/jobs/:id/apply`** — applicant only.

- Body: `{ coverLetter, resumeUrl? }`.
- `404` if job missing.
- `400 { error: "Job is closed" }` if job status is `CLOSED`.
- `409 { error: "Already applied" }` if user has existing application.
- `201 { application }` on success.

**`GET /api/applications/me`** — any authenticated user.

- Always filtered by `session.userId` server-side. Client cannot pass `userId`.
- Response: `200 { items }` ordered by `createdAt desc`.
- Each item includes embedded `job: { id, title, company, location }`.

**`GET /api/admin/applications`** — admin only.

- Query params: `status?`, `jobId?`, `page` (default 1), `pageSize` (default 10, max 50).
- Response: `200 { items, page, pageSize, total }`.
- Each item includes embedded `user: { id, name, email }` and `job: { id, title, company }`.

**`PUT /api/admin/applications/:id/status`** — admin only.

- Body: `{ status: "pending" | "reviewed" | "accepted" | "rejected" }`.
- Returns `200 { application }`.

---

## §7. Validation (Zod schemas in `lib/validators.ts`)

```ts
// Use these exact constraints
registerSchema     = { name: 2-60, email: valid, password: 8-72 chars, must contain ≥1 letter AND ≥1 number }
loginSchema        = { email: valid, password: 1-72 }
jobCreateSchema    = {
  title: 3-120,
  company: 2-80,
  location: 2-80,
  type: enum ["full-time","part-time","remote"],
  salaryRange: 0-60 nullable,
  description: 20-5000,
  requirements: 10-3000,
  status: enum ["open","closed"] default "open"
}
jobUpdateSchema    = jobCreateSchema.partial()
applySchema        = { coverLetter: 30-3000, resumeUrl: valid url nullable }
statusUpdateSchema = { status: enum ["pending","reviewed","accepted","rejected"] }
listJobsQuery      = {
  q: ≤100 optional,
  type: enum optional,
  location: ≤80 optional,
  status: enum["open","closed","all"] optional,
  page: int ≥1 default 1,
  pageSize: int 1-50 default 10
}
```

### API enum → Prisma enum mappers

Export from `lib/validators.ts`:

```ts
mapJobType:   "full-time"→FULL_TIME, "part-time"→PART_TIME, "remote"→REMOTE
mapJobStatus: "open"→OPEN, "closed"→CLOSED
mapAppStatus: "pending"→PENDING, "reviewed"→REVIEWED, "accepted"→ACCEPTED, "rejected"→REJECTED
```

Plus inverse mappers (`mapJobTypeOut`, etc.) for serializing Prisma → API responses. **All API responses use the lowercase string form**, never the Prisma uppercase form.

---

## §8. Page Specs

- **`/`** — hero with "Browse Jobs" CTA → `/jobs`. Below hero: 3 most recent open jobs as cards.
- **`/jobs`** — server component fetches from Prisma directly (not the API). Filter sidebar (search input, type checkboxes, location text). Pagination at the bottom. URL search params are the source of truth.
- **`/jobs/[id]`** — full job detail.
  - Logged-in applicant who has not applied → "Apply" button opens `<ApplyDialog />`.
  - Logged-in applicant who has applied → status badge shown.
  - Admin → "Edit" + "Delete" buttons.
- **`/login`, `/register`** — shadcn `Form`. Posts to API. Redirects to `/dashboard` on success.
- **`/dashboard`** — greeting with user name. Four cards showing application counts by status.
- **`/dashboard/applications`** — shadcn `Table`: Job, Company, Applied date, Status (use `<StatusBadge />`).
- **`/admin`** — overview cards: total jobs, open jobs, total applications, pending applications.
- **`/admin/jobs`** — table of all jobs. Row dropdown: Edit, Delete (with confirmation `Dialog`). "New Job" button.
- **`/admin/jobs/new`** + **`/admin/jobs/[id]/edit`** — both wrap `<JobForm />`.
- **`/admin/applications`** — table with embedded user + job info. Inline status change via shadcn `Select`, calls PUT, then `router.refresh()`.

All `(auth)` and `(admin)` route group layouts call `getSession()` server-side; redirect on missing/insufficient role.

---

## §9. Seed Data (`prisma/seed.ts`)

**Users:**
- 1 admin: `admin@example.com` / `Admin123!` (note: 12 chars, contains letter + number — passes the password regex)
- 2 applicants: `alice@example.com`, `bob@example.com` — both password `Password123!`

**Jobs (10 total):** Mix across all 3 types and 4 locations: Manila, Remote, Singapore, Tokyo. Suggested distribution:
- 4 full-time, 3 part-time, 3 remote
- All have `createdById = admin.id`
- 8 OPEN, 2 CLOSED (so admin's "open jobs" count differs from "total jobs")

**Applications (4 total):**
- Alice → 2 jobs (1 PENDING, 1 ACCEPTED)
- Bob → 2 jobs (1 REVIEWED, 1 REJECTED)
- Different jobs for each applicant to avoid uniqueness collisions.

**Idempotency:** Use `upsert` keyed on email/title so re-running seed doesn't crash.

---

## §10. Setup Commands

```bash
npm install
cp .env.example .env
# edit .env to set JWT_SECRET (generate: openssl rand -base64 32)
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

---

## §11. Definition of Done — v1 baseline

(Superseded by §16 which incorporates v1 + v2 acceptance criteria. Listed here for traceability.)

---

## §12. Security Requirements (OWASP Top 10 2021)

### A01 — Broken Access Control

- Every API route handler's first line(s) call `requireUser()` or `requireAdmin()`.
- IDOR: `/api/applications/me` filters by `session.userId` only. No `userId` accepted from client.
- `middleware.ts` enforces route-group protection (edge-level, signature only).
- `requireAdmin()` **re-reads role from DB**, does not trust JWT alone for admin mutations.

### A02 — Cryptographic Failures

- bcryptjs **12 rounds**.
- JWT HS256, secret ≥32 bytes.
- Cookie attributes per §5.
- No password/token/PII in logs (see A09).

### A03 — Injection

- All DB access via Prisma parameterized queries.
- **No `$queryRawUnsafe`. Ever.**
- All input validated by Zod before reaching Prisma.
- **No `dangerouslySetInnerHTML`** anywhere.

### A04 — Insecure Design

- Rate limit `/api/auth/login` and `/api/auth/register`: **5 attempts per IP per 15 min** (in-memory `Map`, `lib/rate-limit.ts`). README documents Redis as the production replacement.
- Generic auth error: `"Invalid email or password"`.
- Application uniqueness at DB level (`@@unique([jobId, userId])`).

### A05 — Security Misconfiguration / Headers

`next.config.js` returns these headers on `/:path*`:

```
Content-Security-Policy:    default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
Strict-Transport-Security:  max-age=63072000; includeSubDomains; preload
X-Content-Type-Options:     nosniff
X-Frame-Options:            DENY
Referrer-Policy:            strict-origin-when-cross-origin
Permissions-Policy:         camera=(), microphone=(), geolocation=(), interest-cohort=()
```

Plus in `next.config.js`:
- `poweredByHeader: false`
- `productionBrowserSourceMaps: false`

README notes: `'unsafe-inline'` in CSP `script-src` is required for Next 14 inline bootstrap; switch to nonce-based CSP for higher-assurance deploys.

### A06 — Vulnerable Components

- `package.json` pins exact versions (no `^` or `~`).
- README: "Run `npm audit --omit=dev` before deploy. Fix or document any high/critical findings."

### A07 — Identification and Authentication Failures

- Password policy: min 8 chars, ≥1 letter, ≥1 number (Zod regex).
- Session 7 days; logout clears cookie immediately.
- Login rate limit (A04).

### A08 — Software and Data Integrity Failures

- No `eval`, no `new Function`, no remote `<script src="...">` to third-party origins.
- `package-lock.json` committed. README: "CI uses `npm ci`."

### A09 — Logging and Monitoring

`lib/logger.ts` exports `logEvent(type, data)`. Logs:

- `auth.register` (success)
- `auth.login.success`
- `auth.login.failure`
- `auth.logout`
- `rbac.denied` (403 from requireAdmin)

Each log: `{ ts, type, ip, emailHash }` (SHA-256 of email if relevant). **Never** log raw email, password, token, or cookie. Output: `console.log(JSON.stringify(...))`.

### A10 — SSRF

- `resumeUrl` validated as URL but **never fetched server-side**. Stored as text. Rendered with `<a rel="noopener noreferrer" target="_blank">`.

### CSRF

- `sameSite=lax` cookies + JSON-only mutating routes is sufficient for portfolio scope.
- README: "Add double-submit CSRF token for higher-trust deployments."

### CORS

- API is same-origin only. **Do not** add permissive `Access-Control-Allow-Origin`.

---

## §13. SEO Requirements (target: Lighthouse SEO = 100)

- **Metadata API**: every page exports `metadata` or `generateMetadata` with `title`, `description`, `openGraph`, `twitter`, `alternates.canonical`.
- **Title pattern**: `"{Page Title} | JobBoard"`. 30–60 chars.
- **Description**: 120–160 chars per page.
- **`app/robots.ts`**: allow `/`, `/jobs`, `/jobs/*`, `/login`, `/register`. Disallow `/dashboard`, `/admin`, `/api`.
- **`app/sitemap.ts`**: `/`, `/jobs`, and every `OPEN` `/jobs/[id]`. Cache 1h.
- **Canonical URLs**: set on every page via `metadata.alternates.canonical`.
- **Structured data** on `/jobs/[id]`: `<script type="application/ld+json">` with Google `JobPosting` schema. Required fields:
  - `@context`: `"https://schema.org"`
  - `@type`: `"JobPosting"`
  - `title`
  - `description`
  - `datePosted` (ISO string from `job.createdAt`)
  - `validThrough` (ISO string, `job.createdAt + 30 days`)
  - `employmentType`: map `FULL_TIME`→`"FULL_TIME"`, `PART_TIME`→`"PART_TIME"`, `REMOTE`→`"OTHER"` (with `jobLocationType: "TELECOMMUTE"`)
  - `hiringOrganization`: `{ "@type": "Organization", "name": job.company }`
  - `jobLocation`: `{ "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": job.location } }`
- **Semantic HTML**: one `<h1>` per page. Use `<main>`, `<nav>`, `<article>`, `<footer>`.
- **`<html lang="en">`** in root layout.
- **Internal linking**: `next/link` everywhere. No raw `<a>` for internal navigation.
- **Image `alt` text** required on every `<Image>`.

---

## §14. Performance Requirements

**Honest target:** Lighthouse Performance ≥95 on Vercel production deploy. GTmetrix Grade A. Not 100 — that is unstable.

Implementation:
- `next/image` for every image. No `<img>`.
- `next/font` self-hosted (Geist). No Google Fonts CDN.
- Public pages = server components with direct Prisma calls.
- `/jobs`: `export const revalidate = 60`.
- No client-side data fetching on public pages.
- Tailwind production purge (default).
- shadcn components imported per-component (default).
- `app/loading.tsx` skeleton for `/jobs` and `/jobs/[id]`.
- All `<Image>` and skeleton elements have explicit width/height (no CLS).
- Admin tables/dialogs: `dynamic(() => import(...), { ssr: false })` if bundle pressure shows up — only if needed.
- Single Prisma client via `lib/prisma.ts` singleton.

---

## §15. Accessibility Requirements (target ≥95)

- Every form input has `<Label htmlFor>` paired with `id`.
- Buttons: discernible text or `aria-label`.
- Color contrast: shadcn defaults pass; verify if customizing.
- Focus visible: do not remove Tailwind ring.
- Skip-to-content link in root layout.
- `aria-live="polite"` region for form feedback (sonner toasts handle this).

---

## §16. Definition of Done — Final Acceptance Checklist

1. ☐ `npm run dev` starts cleanly after the 5 setup commands (§10).
2. ☐ All 4 auth routes work; `/api/auth/me` returns 401/200 correctly.
3. ☐ Guest can browse `/jobs`, filter by type+location+search, paginate, view detail.
4. ☐ Applicant can register, log in, apply once per job, view their applications with live status.
5. ☐ Admin can create/edit/delete jobs and change application statuses.
6. ☐ Middleware blocks unauthenticated `/dashboard/*`; admin layout blocks non-admin `/admin/*`.
7. ☐ Duplicate applications return `409`, not 500.
8. ☐ `npx prisma studio` shows seeded data.
9. ☐ `npm run build` succeeds with no TypeScript errors.
10. ☐ `npm audit --omit=dev` shows 0 high/critical (or documented in README).
11. ☐ `curl -I http://localhost:3000` shows all 6 security headers from §12 A05.
12. ☐ `/robots.txt` and `/sitemap.xml` resolve and contain expected entries.
13. ☐ Job detail page contains valid `JobPosting` JSON-LD (verify via Google Rich Results Test).
14. ☐ Lighthouse on production build of `/jobs/[id]`: **Perf ≥95, A11y ≥95, Best Practices ≥95, SEO = 100**.
15. ☐ Hitting `/api/auth/login` 6 times in 15 min from one IP returns `429` on the 6th.
16. ☐ Logging out clears the `session` cookie (verify via DevTools).
17. ☐ Applicant accessing `/admin` redirects to `/`.
18. ☐ Project deployed to Vercel free tier from a public GitHub repo (URL in README).

---

## §17. Out of Scope (do not implement)

- File uploads (resume is a URL field).
- Email verification / password reset.
- Two-factor authentication.
- Social login.
- Payments.
- Multi-tenancy.
- i18n.
- Analytics.
- A/B testing.
- Admin user management UI (admins set via DB seed only).
- Saved jobs / favorites.
- Job alerts / email digests.
- Comments / messaging between applicant and admin.
- Pagination cursors (offset-based is fine at this scale).
- Tests (unit, integration, e2e).
- CI/CD beyond Vercel's default git-push deploy.
- Lighthouse score of 100 on Performance — target is ≥95.
- GTmetrix score of 100 — that metric does not exist; target is Grade A.
- Full OWASP ASVS Level 2 or 3 compliance — Top 10 + ASVS L1 basics only.
