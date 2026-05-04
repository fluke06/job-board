import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, Users, Globe, Briefcase } from "lucide-react";
import { JobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { JobCard } from "@/components/job-card";
import { mapJobTypeOut } from "@/lib/validators";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });
  if (!company) return { title: "Company not found" };
  return {
    title: company.name,
    description:
      company.description ?? `Open roles at ${company.name} on JobBoard.`,
    alternates: { canonical: `/companies/${slug}` },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      jobs: {
        where: { status: JobStatus.OPEN },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { applications: true } } },
      },
    },
  });
  if (!company) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 md:px-8 md:py-16 space-y-12">
      <header className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-start md:gap-8">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
          <Building2
            className="size-8 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            {company.industry ? (
              <span className="text-caption text-brand-strong">
                {company.industry}
              </span>
            ) : null}
            <h1 className="mt-2 jb-display !text-[clamp(36px,5vw,56px)]">
              {company.name}.
            </h1>
          </div>
          <div className="flex flex-wrap gap-4 text-small text-muted-foreground">
            {company.size ? (
              <span className="inline-flex items-center gap-1">
                <Users
                  className="size-4"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                {company.size} employees
              </span>
            ) : null}
            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <Globe
                  className="size-4"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                Website
              </a>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Briefcase
                className="size-4"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              {company.jobs.length} open{" "}
              {company.jobs.length === 1 ? "role" : "roles"}
            </span>
          </div>
          {company.description ? (
            <p className="text-body text-foreground/90">{company.description}</p>
          ) : null}
        </div>
      </header>

      <section aria-labelledby="open-roles">
        <h2 id="open-roles" className="mb-6">
          Open roles
        </h2>
        {company.jobs.length === 0 ? (
          <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
            <p className="text-h4 font-semibold text-foreground">
              No open roles right now
            </p>
            <p className="mt-2 text-small">
              Follow{" "}
              <Link
                href="/jobs"
                className="font-medium text-foreground hover:underline"
              >
                /jobs
              </Link>{" "}
              for new postings across all companies.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {company.jobs.map((job) => (
              <JobCard
                key={job.id}
                job={{
                  id: job.id,
                  title: job.title,
                  company: company.name,
                  companySlug: company.slug,
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
      </section>
    </div>
  );
}
