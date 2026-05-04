import Link from "next/link";
import type { Metadata } from "next";
import { Prisma, JobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { JobCard } from "@/components/job-card";
import { JobFilters } from "@/components/job-filters";
import { listJobsQuery, mapJobType, mapJobTypeOut } from "@/lib/validators";
import { buttonVariants } from "@/components/ui/button";
import { Squiggle } from "@/components/squiggle";
import { AnimatedCounter } from "@/components/animated-counter";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Browse jobs",
  description:
    "Search and filter open job postings by type and location. Apply directly through JobBoard in a few clicks.",
  alternates: { canonical: "/jobs" },
};

type SearchParams = { [k: string]: string | string[] | undefined };

function flatten(sp: SearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (Array.isArray(v)) {
      if (v[0] !== undefined) out[k] = v[0];
    } else if (typeof v === "string") {
      out[k] = v;
    }
  }
  return out;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const parsed = listJobsQuery.safeParse(flatten(sp));
  const params = parsed.success
    ? parsed.data
    : { page: 1, pageSize: 10 as const };

  const where: Prisma.JobWhereInput = { status: JobStatus.OPEN };
  let sort: "newest" | "oldest" | "popular" = "newest";
  if (parsed.success) {
    if (parsed.data.type) where.type = mapJobType(parsed.data.type);
    if (parsed.data.location)
      where.location = { contains: parsed.data.location };
    if (parsed.data.companySlug)
      where.company = { slug: parsed.data.companySlug };
    if (parsed.data.posted) {
      const days =
        parsed.data.posted === "24h"
          ? 1
          : parsed.data.posted === "7d"
            ? 7
            : 30;
      where.createdAt = {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      };
    }
    if (parsed.data.q) {
      where.OR = [
        { title: { contains: parsed.data.q } },
        { company: { name: { contains: parsed.data.q } } },
        { description: { contains: parsed.data.q } },
      ];
    }
    sort = parsed.data.sort;
  }

  const page = params.page;
  const pageSize = params.pageSize;

  const orderBy: Prisma.JobOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "popular"
        ? { applications: { _count: "desc" } }
        : { createdAt: "desc" };

  const [items, total, allCompanies] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        company: { select: { id: true, slug: true, name: true } },
        _count: { select: { applications: true } },
      },
    }),
    prisma.job.count({ where }),
    prisma.company.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  function buildHref(targetPage: number) {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === "string" && k !== "page") next.set(k, v);
    }
    next.set("page", String(targetPage));
    return `/jobs?${next.toString()}`;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <header className="border-b-2 border-foreground pb-8">
        <span className="text-caption text-brand-strong">Open roles</span>
        <h1 className="mt-2 jb-display !text-[clamp(40px,7vw,72px)]">
          Browse{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-brand-strong via-brand to-fuchsia-500 bg-clip-text text-transparent">
              every
            </span>
            <Squiggle className="absolute left-0 right-0 -bottom-1 h-2 w-full text-brand" />
          </span>{" "}
          role.
        </h1>
        <p className="mt-4 text-body-lg text-muted-foreground">
          {total === 0 ? (
            "No open positions match your filters."
          ) : (
            <>
              Showing {start}–{end} of <AnimatedCounter value={total} /> open{" "}
              {total === 1 ? "position" : "positions"}.
            </>
          )}
        </p>
      </header>

      <div className="mt-8 grid gap-8 md:grid-cols-[280px_1fr]">
        <aside>
          <JobFilters companies={allCompanies} />
        </aside>
        <section>
          {items.length === 0 ? (
            <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
              <p className="text-h4 font-semibold text-foreground">
                No jobs match your filters
              </p>
              <p className="mt-2 text-small">
                Try removing a filter or clearing your search.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {items.map((job) => (
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
                    createdAt: job.createdAt,
                    applicationCount: job._count.applications,
                  }}
                />
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <nav
              aria-label="Pagination"
              className="mt-8 flex items-center justify-between"
            >
              <Link
                href={hasPrev ? buildHref(page - 1) : "#"}
                aria-disabled={!hasPrev}
                tabIndex={hasPrev ? undefined : -1}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  !hasPrev && "pointer-events-none opacity-50",
                )}
              >
                Previous
              </Link>
              <span className="text-small text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Link
                href={hasNext ? buildHref(page + 1) : "#"}
                aria-disabled={!hasNext}
                tabIndex={hasNext ? undefined : -1}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  !hasNext && "pointer-events-none opacity-50",
                )}
              >
                Next
              </Link>
            </nav>
          ) : null}
        </section>
      </div>
    </div>
  );
}
