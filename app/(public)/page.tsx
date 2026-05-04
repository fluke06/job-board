import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  MapPin,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";
import { buttonVariants } from "@/components/ui/button";
import { mapJobTypeOut } from "@/lib/validators";
import { AnimatedCounter } from "@/components/animated-counter";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { Marquee } from "@/components/marquee";
import { Squiggle } from "@/components/squiggle";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Find work that fits",
  description:
    "Curated full-time, part-time, and remote roles from companies hiring now. Apply in two clicks on JobBoard.",
  alternates: { canonical: "/" },
};

const HOW_IT_WORKS = [
  {
    Icon: Search,
    title: "Browse curated roles",
    body: "Filter by type, location, or keyword. Every role is posted by a verified employer.",
  },
  {
    Icon: Send,
    title: "Apply in two clicks",
    body: "One profile, one cover letter. Track every application in your dashboard.",
  },
  {
    Icon: CheckCircle2,
    title: "Hear back faster",
    body: "Employers triage candidates inline — no black-hole inbox.",
  },
];

const TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  remote: "Remote",
};

const TYPE_PILL: Record<string, string> = {
  "full-time": "bg-type-fulltime-bg text-type-fulltime-text",
  "part-time": "bg-type-parttime-bg text-type-parttime-text",
  remote: "bg-foreground text-background",
};

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function HomePage() {
  const [recent, featuredCompanies, jobCount, companyCount, openCount] =
    await Promise.all([
      prisma.job.findMany({
        where: { status: JobStatus.OPEN },
        orderBy: { createdAt: "desc" },
        take: 7,
        include: {
          company: { select: { id: true, slug: true, name: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.company.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { jobs: { where: { status: JobStatus.OPEN } } },
          },
        },
      }),
      prisma.job.count(),
      prisma.company.count(),
      prisma.job.count({ where: { status: JobStatus.OPEN } }),
    ]);

  const locationGroups = await prisma.job.groupBy({
    by: ["location"],
    where: { status: JobStatus.OPEN },
    _count: { _all: true },
    orderBy: { _count: { location: "desc" } },
    take: 6,
  });

  const [featured, ...rest] = recent;

  function jobBadges(j: {
    createdAt: Date;
    _count: { applications: number };
  }): Array<"new" | "hot"> {
    const out: Array<"new" | "hot"> = [];
    if (Date.now() - j.createdAt.getTime() < 3 * DAY_MS) out.push("new");
    if (j._count.applications >= 3) out.push("hot");
    return out;
  }

  return (
    <div className="w-full">
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 jb-mesh-bg [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_85%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 jb-grid-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
        />
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pt-20 pb-16 text-center md:pt-28">
          <span className="jb-anim-fade-up inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card/80 px-3 py-1 text-caption shadow-[2px_2px_0_var(--foreground)] backdrop-blur">
            <span className="relative flex size-2 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-status-accepted-text opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-status-accepted-text" />
            </span>
            <span className="font-bold">LIVE</span>
            <span className="text-muted-foreground">
              <AnimatedCounter value={openCount} /> roles ·{" "}
              <AnimatedCounter value={companyCount} /> companies
            </span>
          </span>
          <h1 className="mt-8 jb-display jb-anim-fade-up-delay-1">
            Find work that{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-brand-strong via-brand to-fuchsia-500 bg-clip-text text-transparent">
                fits
              </span>
              <Squiggle className="absolute left-0 right-0 -bottom-2 h-2 w-full text-brand" />
            </span>
            .
          </h1>
          <p className="mt-6 max-w-xl text-body-lg text-muted-foreground jb-anim-fade-up-delay-2">
            Curated full-time, part-time, and remote roles. Apply in two
            clicks. No spam, no algorithmic feed of nonsense.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 jb-anim-fade-up-delay-3">
            <Link
              href="/jobs"
              className={`${buttonVariants({ size: "lg" })} shadow-[3px_3px_0_var(--foreground)] transition-transform hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--foreground)]`}
            >
              Browse jobs
              <ArrowRight
                className="size-4 jb-arrow-nudge"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/register?role=applicant"
              className={`${buttonVariants({ variant: "outline", size: "lg" })} border-2 border-foreground shadow-[3px_3px_0_var(--foreground)] transition-transform hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--foreground)]`}
            >
              Sign up
            </Link>
          </div>
        </div>

        <div className="border-y-2 border-foreground bg-foreground py-3">
          <Marquee speed={50}>
            {featuredCompanies.map((c) => (
              <Link
                key={c.id}
                href={`/companies/${c.slug}`}
                className="group inline-flex items-center gap-3 text-background"
              >
                <span className="size-1.5 rounded-full bg-background/40" />
                <span className="text-h4 font-bold tracking-tight transition-opacity group-hover:opacity-70">
                  {c.name}
                </span>
                <span className="text-small text-background/60">
                  {c._count.jobs} {c._count.jobs === 1 ? "role" : "roles"}
                </span>
              </Link>
            ))}
          </Marquee>
        </div>
      </section>

      {featured ? (
        <RevealOnScroll>
          <section
            aria-labelledby="recent-jobs"
            className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-24"
          >
            <div className="mb-10 flex items-end justify-between flex-wrap gap-4">
              <div>
                <span className="text-caption text-brand-strong">
                  Recently posted
                </span>
                <h2 id="recent-jobs" className="mt-2">
                  Hot off the press.
                </h2>
              </div>
              <Link
                href="/jobs"
                className="group inline-flex items-center gap-1 text-small font-medium text-foreground hover:underline"
              >
                View all jobs
                <ArrowRight
                  className="size-4 jb-arrow-nudge"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-12">
              <Link
                href={`/jobs/${featured.id}`}
                className="group jb-card-hover relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border-2 border-foreground bg-gradient-to-br from-brand-soft via-card to-card p-8 shadow-[4px_4px_0_var(--foreground)] md:col-span-7 md:row-span-2 md:p-10"
              >
                <div
                  aria-hidden="true"
                  className="absolute -right-12 -top-12 size-56 rounded-full bg-gradient-to-br from-brand/40 to-fuchsia-300/40 blur-3xl jb-anim-blob"
                />
                <div className="relative flex flex-wrap items-start gap-3">
                  <span className="jb-sticker jb-sticker-new">
                    <Sparkles className="size-3" strokeWidth={2.5} />
                    Featured
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-caption ${TYPE_PILL[mapJobTypeOut(featured.type)]}`}
                  >
                    {TYPE_LABEL[mapJobTypeOut(featured.type)]}
                  </span>
                  {jobBadges(featured).includes("hot") ? (
                    <span className="jb-sticker jb-sticker-hot">Hot</span>
                  ) : null}
                </div>
                <div className="relative space-y-3">
                  <p className="text-small text-muted-foreground">
                    {featured.company.name}
                  </p>
                  <h3 className="text-h2 font-bold leading-tight">
                    {featured.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-small text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin
                        className="size-4"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      {featured.location}
                    </span>
                    {featured.salaryRange ? (
                      <span>{featured.salaryRange}</span>
                    ) : null}
                    <span>
                      <AnimatedCounter
                        value={featured._count.applications}
                      />{" "}
                      {featured._count.applications === 1
                        ? "applicant"
                        : "applicants"}
                    </span>
                  </div>
                </div>
                <div className="relative flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-small font-semibold text-foreground">
                    Read the full role
                    <ArrowUpRight
                      className="size-4 jb-arrow-nudge"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>

              {rest.slice(0, 4).map((j, i) => {
                const badges = jobBadges(j);
                const type = mapJobTypeOut(j.type);
                const span =
                  i === 0 || i === 3 ? "md:col-span-3" : "md:col-span-2";
                return (
                  <Link
                    key={j.id}
                    href={`/jobs/${j.id}`}
                    className={`group jb-card-hover relative flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-5 ${span} md:col-start-auto`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-caption text-muted-foreground">
                        {j.company.name}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TYPE_PILL[type]}`}
                      >
                        {TYPE_LABEL[type]}
                      </span>
                    </div>
                    <h3 className="text-h4 font-semibold leading-tight">
                      {j.title}
                    </h3>
                    <div className="flex items-center justify-between text-small text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin
                          className="size-3.5"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        {j.location}
                      </span>
                      {badges.length ? (
                        <span className="flex gap-1">
                          {badges.includes("new") ? (
                            <span className="jb-sticker jb-sticker-new">
                              New
                            </span>
                          ) : null}
                          {badges.includes("hot") ? (
                            <span className="jb-sticker jb-sticker-hot">
                              Hot
                            </span>
                          ) : null}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </RevealOnScroll>
      ) : null}

      <section
        aria-labelledby="by-location"
        className="border-y-2 border-foreground bg-gradient-to-b from-muted/30 to-background"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <RevealOnScroll>
            <div className="mb-10 flex items-end justify-between flex-wrap gap-4">
              <div>
                <span className="text-caption text-brand-strong">
                  Hiring everywhere
                </span>
                <h2 id="by-location" className="mt-2">
                  Browse by location.
                </h2>
              </div>
              <Link
                href="/jobs"
                className="group inline-flex items-center gap-1 text-small text-muted-foreground hover:text-foreground"
              >
                All locations
                <ArrowRight
                  className="size-4 jb-arrow-nudge"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </RevealOnScroll>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {locationGroups.map((g, i) => (
              <RevealOnScroll key={g.location} delay={i * 60}>
                <Link
                  href={`/jobs?location=${encodeURIComponent(g.location)}`}
                  className="jb-card-hover group flex h-full flex-col gap-2 rounded-xl border-2 border-foreground bg-card p-5 shadow-[3px_3px_0_var(--foreground)] transition-transform hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--foreground)]"
                >
                  <MapPin
                    className="size-5 text-brand"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <div className="text-h4 font-bold">{g.location}</div>
                  <div className="text-small text-muted-foreground">
                    <AnimatedCounter value={g._count._all} /> open{" "}
                    {g._count._all === 1 ? "role" : "roles"}
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="how-it-works"
        className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-24"
      >
        <RevealOnScroll>
          <header className="mb-12 max-w-2xl">
            <span className="text-caption text-brand-strong">The vibe</span>
            <h2 id="how-it-works" className="mt-2">
              How JobBoard works.
            </h2>
            <p className="mt-3 text-body-lg text-muted-foreground">
              Built for the people who actually have to read the job
              description and the people who actually have to read the cover
              letter.
            </p>
          </header>
        </RevealOnScroll>
        <ol className="grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
            <RevealOnScroll key={step.title} delay={i * 100}>
              <li className="jb-card-hover relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border-2 border-foreground bg-card p-6 shadow-[3px_3px_0_var(--foreground)]">
                <span
                  className="absolute right-4 top-4 text-[80px] font-black leading-none text-foreground/5"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="relative flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-strong text-small font-bold text-brand-foreground shadow-sm">
                    {i + 1}
                  </span>
                  <step.Icon
                    className="size-5 text-muted-foreground"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </div>
                <div className="relative">
                  <h3 className="text-h4 font-bold">{step.title}</h3>
                  <p className="mt-2 text-small text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            </RevealOnScroll>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-8">
        <RevealOnScroll>
          <div className="relative overflow-hidden rounded-3xl border-2 border-foreground bg-[hsl(74_90%_60%)] p-10 shadow-[6px_6px_0_var(--foreground)] md:p-14">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-20 size-72 rounded-full bg-foreground/10 blur-2xl jb-anim-blob"
            />
            <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
              <div className="space-y-4 md:max-w-2xl">
                <span className="jb-sticker">
                  <Briefcase className="size-3" strokeWidth={2.5} />
                  For employers
                </span>
                <h2 className="jb-display !text-[clamp(40px,6vw,72px)]">
                  Hire the people<br />
                  who{" "}
                  <span className="relative inline-block">
                    actually
                    <Squiggle className="absolute left-0 right-0 -bottom-1 h-2 w-full" />
                  </span>{" "}
                  read the brief.
                </h2>
                <p className="text-body-lg text-foreground/80">
                  Set up your company once. Post unlimited roles. Review every
                  applicant in one place — no inbox archaeology.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register?role=employer"
                  className={`${buttonVariants({ size: "lg" })} bg-foreground text-background shadow-[3px_3px_0_hsl(0_0%_0%/0.3)] transition-transform hover:-translate-x-px hover:-translate-y-px`}
                >
                  Start hiring
                  <ArrowRight
                    className="size-4 jb-arrow-nudge"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  href="/for-employers"
                  className={`${buttonVariants({ variant: "outline", size: "lg" })} border-2 border-foreground bg-card`}
                >
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <section className="border-t-2 border-foreground bg-foreground text-background">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-12 md:grid-cols-4 md:px-8">
          {[
            { value: openCount, label: "Open roles" },
            { value: companyCount, label: "Companies hiring" },
            { value: jobCount, label: "Jobs posted" },
            { value: locationGroups.length, label: "Locations" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-h1 font-black leading-none">
                <AnimatedCounter value={s.value} />
              </div>
              <div className="mt-2 text-caption text-background/60">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
