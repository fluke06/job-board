import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Plus } from "lucide-react";
import { JobStatus, AppStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/rbac";
import { buttonVariants } from "@/components/ui/button";
import { JobStatusBadge } from "@/components/status-badge";
import { mapJobTypeOut } from "@/lib/validators";

export const metadata = {
  title: "Employer dashboard",
};

const TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  remote: "Remote",
};

export default async function EmployerDashboardPage() {
  const ctx = await requireEmployer();
  if (ctx.companyIds.length === 0) redirect("/employer/onboarding");

  const [companies, jobs, totalApps, pendingApps, recentJobs] =
    await Promise.all([
      prisma.company.findMany({
        where: { id: { in: ctx.companyIds } },
        select: { id: true, slug: true, name: true },
      }),
      prisma.job.count({
        where: { companyId: { in: ctx.companyIds } },
      }),
      prisma.application.count({
        where: { job: { companyId: { in: ctx.companyIds } } },
      }),
      prisma.application.count({
        where: {
          job: { companyId: { in: ctx.companyIds } },
          status: AppStatus.PENDING,
        },
      }),
      prisma.job.findMany({
        where: { companyId: { in: ctx.companyIds } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          company: { select: { name: true, slug: true } },
          _count: { select: { applications: true } },
        },
      }),
    ]);

  const openJobs = await prisma.job.count({
    where: { companyId: { in: ctx.companyIds }, status: JobStatus.OPEN },
  });

  const acceptedApps = await prisma.application.count({
    where: {
      job: { companyId: { in: ctx.companyIds } },
      status: AppStatus.ACCEPTED,
    },
  });

  const cards = [
    { label: "Open jobs", value: openJobs },
    { label: "Total applicants", value: totalApps },
    { label: "Pending review", value: pendingApps },
    { label: "Accepted", value: acceptedApps },
  ];

  const company = companies[0];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16 space-y-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md border border-border bg-muted">
              <Building2
                className="size-5 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </div>
            <span className="text-h4 font-semibold text-muted-foreground">
              {company?.name ?? "Your company"}
            </span>
          </div>
          <h1>Dashboard</h1>
          <p className="text-body-lg text-muted-foreground">
            Manage your job postings and candidate pipeline.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/employer/jobs/new"
            className={buttonVariants({ size: "default" })}
          >
            <Plus className="size-4" strokeWidth={1.75} aria-hidden="true" />
            Post a job
          </Link>
          <Link
            href="/employer/company"
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Company settings
          </Link>
        </div>
      </header>

      <section
        aria-labelledby="stats"
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        <h2 id="stats" className="sr-only">
          Hiring stats
        </h2>
        {cards.map((c) => (
          <article
            key={c.label}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-6"
          >
            <span className="text-caption text-muted-foreground">
              {c.label}
            </span>
            <span className="text-h2 font-bold leading-none">{c.value}</span>
          </article>
        ))}
      </section>

      <section aria-labelledby="recent-jobs">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="recent-jobs" className="text-h3 font-semibold">
            Recent jobs
          </h2>
          <Link
            href="/employer/jobs"
            className="text-small text-muted-foreground hover:text-foreground"
          >
            View all →
          </Link>
        </div>
        {recentJobs.length === 0 ? (
          <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
            <p className="text-h4 font-semibold text-foreground">
              No jobs yet
            </p>
            <p className="mt-2 text-small">
              Post your first role to start receiving applications.
            </p>
            <div className="mt-6">
              <Link
                href="/employer/jobs/new"
                className={buttonVariants()}
              >
                Post a job
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {recentJobs.map((j) => (
              <article
                key={j.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/employer/jobs/${j.id}/candidates`}
                    className="text-h4 font-semibold hover:underline"
                  >
                    {j.title}
                  </Link>
                  <p className="mt-1 text-small text-muted-foreground">
                    {j.company.name} · {j.location} ·{" "}
                    {TYPE_LABEL[mapJobTypeOut(j.type)]}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <JobStatusBadge
                    status={j.status === JobStatus.OPEN ? "open" : "closed"}
                  />
                  <span className="text-small text-muted-foreground">
                    {j._count.applications}{" "}
                    {j._count.applications === 1 ? "applicant" : "applicants"}
                  </span>
                  <Link
                    href={`/employer/jobs/${j.id}/edit`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    Edit
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
