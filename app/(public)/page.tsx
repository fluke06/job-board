import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  MapPin,
  Search,
  Send,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";
import { buttonVariants } from "@/components/ui/button";
import { JobCard } from "@/components/job-card";
import { mapJobTypeOut } from "@/lib/validators";

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

export default async function HomePage() {
  const [recent, featuredCompanies, jobCount, companyCount, openCount] =
    await Promise.all([
      prisma.job.findMany({
        where: { status: JobStatus.OPEN },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          company: { select: { id: true, slug: true, name: true } },
        },
      }),
      prisma.company.findMany({
        orderBy: { name: "asc" },
        take: 8,
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

  return (
    <div className="w-full">
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-24 pb-12 text-center md:pt-32">
        <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-caption text-muted-foreground">
          {openCount} open roles · {companyCount} companies hiring
        </span>
        <h1 className="mt-6">Find work that fits.</h1>
        <p className="mt-4 max-w-xl text-body-lg text-muted-foreground">
          Curated full-time, part-time, and remote roles. Apply in two clicks.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link href="/jobs" className={buttonVariants({ size: "default" })}>
            Browse jobs
          </Link>
          <Link
            href="/register?role=applicant"
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Sign up
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="trusted-by"
        className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8"
      >
        <h2
          id="trusted-by"
          className="text-caption text-muted-foreground text-center"
        >
          Hiring on JobBoard right now
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
          {featuredCompanies.map((c) => (
            <Link
              key={c.id}
              href={`/companies/${c.slug}`}
              className="group flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/40"
              aria-label={`${c.name} — ${c._count.jobs} open roles`}
            >
              <Building2
                className="size-4 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span className="text-small font-medium group-hover:underline">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="recent-jobs"
        className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-8"
      >
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 id="recent-jobs">Recently posted</h2>
            <p className="mt-2 text-body-lg text-muted-foreground">
              The freshest open roles from companies hiring this week.
            </p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-small text-muted-foreground hover:text-foreground"
          >
            View all jobs
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recent.map((job) => (
            <JobCard
              key={job.id}
              job={{
                id: job.id,
                title: job.title,
                company: job.company.name,
                companySlug: job.company.slug,
                location: job.location,
                type: mapJobTypeOut(job.type),
                salaryRange: job.salaryRange,
              }}
            />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="by-location"
        className="border-y border-border bg-muted/20"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
            <div>
              <h2 id="by-location">Browse by location</h2>
              <p className="mt-2 text-body-lg text-muted-foreground">
                Where the people who post here are based.
              </p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 text-small text-muted-foreground hover:text-foreground"
            >
              All locations
              <ArrowRight
                className="size-4"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {locationGroups.map((g) => (
              <Link
                key={g.location}
                href={`/jobs?location=${encodeURIComponent(g.location)}`}
                className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-sm"
              >
                <MapPin
                  className="size-5 text-muted-foreground"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <div className="text-h4 font-semibold group-hover:underline">
                  {g.location}
                </div>
                <div className="text-small text-muted-foreground">
                  {g._count._all} open {g._count._all === 1 ? "role" : "roles"}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="how-it-works"
        className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8 md:py-24"
      >
        <header className="mb-12 max-w-2xl">
          <h2 id="how-it-works">How JobBoard works</h2>
          <p className="mt-2 text-body-lg text-muted-foreground">
            Built for the people who actually have to read the job description
            and the people who actually have to read the cover letter.
          </p>
        </header>
        <ol className="grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
            <li
              key={step.title}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background text-small font-semibold">
                  {i + 1}
                </span>
                <step.Icon
                  className="size-5 text-muted-foreground"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="text-h4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-small text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-8">
        <div className="flex flex-col items-start gap-6 rounded-2xl border border-border bg-card p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div className="space-y-2">
            <span className="text-caption text-muted-foreground">
              For employers
            </span>
            <h2>Hiring? Post a role in minutes.</h2>
            <p className="max-w-xl text-body-lg text-muted-foreground">
              Set up your company once. Post unlimited roles. Review every
              applicant in one place — no inbox archaeology.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register?role=employer"
              className={buttonVariants({ size: "default" })}
            >
              <Briefcase
                className="size-4"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              Start hiring
            </Link>
            <Link
              href="/for-employers"
              className={buttonVariants({
                variant: "outline",
                size: "default",
              })}
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-12 md:grid-cols-4 md:px-8">
          {[
            { value: openCount, label: "Open roles" },
            { value: companyCount, label: "Companies hiring" },
            { value: jobCount, label: "Jobs posted (all-time)" },
            { value: locationGroups.length, label: "Locations" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-h2 font-bold">{s.value}</div>
              <div className="mt-1 text-small text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
