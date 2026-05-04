import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { JobStatus, Prisma } from "@prisma/client";
import { CompaniesSearch } from "@/components/companies-search";
import { Squiggle } from "@/components/squiggle";
import { AnimatedCounter } from "@/components/animated-counter";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Companies",
  description: "Browse companies hiring on JobBoard.",
  alternates: { canonical: "/companies" },
};

type SearchParams = { q?: string | string[] };

function flatten(sp: SearchParams): string | undefined {
  const v = sp.q;
  if (Array.isArray(v)) return v[0];
  return typeof v === "string" ? v : undefined;
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = flatten(sp)?.trim();

  const where: Prisma.CompanyWhereInput = q
    ? {
        OR: [
          { name: { contains: q } },
          { industry: { contains: q } },
        ],
      }
    : {};

  const companies = await prisma.company.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          jobs: { where: { status: JobStatus.OPEN } },
        },
      },
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16 space-y-12">
      <header className="space-y-4">
        <span className="text-caption text-brand-strong">The roster</span>
        <h1 className="jb-display !text-[clamp(40px,7vw,72px)]">
          The{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-brand-strong via-brand to-fuchsia-500 bg-clip-text text-transparent">
              companies
            </span>
            <Squiggle className="absolute left-0 right-0 -bottom-1 h-2 w-full text-brand" />
          </span>{" "}
          hiring.
        </h1>
        <p className="max-w-2xl text-body-lg text-muted-foreground">
          <AnimatedCounter value={companies.length} /> teams ·{" "}
          <AnimatedCounter
            value={companies.reduce((acc, c) => acc + c._count.jobs, 0)}
          />{" "}
          open roles. No recruiter spam.
        </p>
      </header>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CompaniesSearch defaultQ={q} />
        <p className="text-small text-muted-foreground">
          Showing {companies.length}{" "}
          {companies.length === 1 ? "company" : "companies"}
          {q ? ` for “${q}”` : ""}
        </p>
      </div>

      {companies.length === 0 ? (
        <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
          <p className="text-h4 font-semibold text-foreground">
            {q ? "No companies match" : "No companies yet"}
          </p>
          <p className="mt-2 text-small">
            {q ? "Try a different search term." : "Check back soon."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <Link
              key={c.id}
              href={`/companies/${c.slug}`}
              className="group flex h-full flex-col rounded-2xl border-2 border-foreground bg-card p-6 shadow-[3px_3px_0_var(--foreground)] transition-[transform,box-shadow] duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_var(--foreground)]"
            >
              <div className="mb-4 flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border-2 border-foreground bg-gradient-to-br from-brand-soft to-card">
                  <Building2
                    className="size-5 text-foreground"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>
                <div className="min-h-12 min-w-0 flex-1">
                  <h3 className="text-h4 font-bold leading-tight group-hover:underline">
                    {c.name}
                  </h3>
                  <span className="block text-caption text-muted-foreground">
                    {c.industry ?? " "}
                  </span>
                </div>
              </div>
              <p className="mb-6 line-clamp-2 min-h-[2.6em] flex-grow text-small text-muted-foreground">
                {c.description ?? " "}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <span className="rounded-full border-[1.5px] border-foreground/30 bg-muted px-2.5 py-1 text-caption text-muted-foreground">
                  {c._count.jobs} open{" "}
                  {c._count.jobs === 1 ? "role" : "roles"}
                </span>
                <span className="inline-flex items-center gap-1 text-small font-semibold text-foreground group-hover:underline">
                  View
                  <ArrowRight
                    className="size-4 jb-arrow-nudge"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
