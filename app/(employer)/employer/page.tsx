import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, MapPin, User as UserIcon } from "lucide-react";
import { JobStatus, AppStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/rbac";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { mapAppStatusOut } from "@/lib/validators";
import { EmployerCompanyChip } from "@/components/employer-sidebar";

export const metadata = {
  title: "Employer dashboard",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function relativeApplied(d: Date): string {
  const ms = Date.now() - d.getTime();
  const min = 60 * 1000;
  const hour = 60 * min;
  const day = 24 * hour;
  if (ms < min) return "just now";
  if (ms < hour) return `${Math.floor(ms / min)}m ago`;
  if (ms < day) return `${Math.floor(ms / hour)}h ago`;
  if (ms < 30 * day) return `${Math.floor(ms / day)}d ago`;
  return dateFmt.format(d);
}

export default async function EmployerDashboardPage() {
  const ctx = await requireEmployer();
  if (ctx.companyIds.length === 0) redirect("/employer/onboarding");

  const [companies, openJobs, totalApps, pendingApps, acceptedApps, activeJobs, latestApps] =
    await Promise.all([
      prisma.company.findMany({
        where: { id: { in: ctx.companyIds } },
        select: { id: true, slug: true, name: true },
      }),
      prisma.job.count({
        where: { companyId: { in: ctx.companyIds }, status: JobStatus.OPEN },
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
      prisma.application.count({
        where: {
          job: { companyId: { in: ctx.companyIds } },
          status: AppStatus.ACCEPTED,
        },
      }),
      prisma.job.findMany({
        where: { companyId: { in: ctx.companyIds }, status: JobStatus.OPEN },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          _count: { select: { applications: true } },
        },
      }),
      prisma.application.findMany({
        where: { job: { companyId: { in: ctx.companyIds } } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { id: true, name: true, email: true } },
          job: { select: { id: true, title: true } },
        },
      }),
    ]);

  const cards = [
    { label: "Open jobs", value: openJobs },
    { label: "Total applicants", value: totalApps },
    { label: "Pending review", value: pendingApps },
    { label: "Accepted", value: acceptedApps },
  ];

  const company = companies[0];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12 space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          {company ? <EmployerCompanyChip name={company.name} /> : null}
          <h1>Dashboard</h1>
        </div>
        <Link
          href="/employer/jobs/new"
          className={buttonVariants({ size: "default" })}
        >
          <Plus className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Post a job
        </Link>
      </header>

      <section
        aria-labelledby="stats"
        className="grid gap-4 grid-cols-2 lg:grid-cols-4"
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

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <header className="flex items-center justify-between px-1">
            <h2 className="text-h3 font-semibold">Active jobs</h2>
            <Link
              href="/employer/jobs"
              className="text-small text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </header>
          {activeJobs.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-center text-small text-muted-foreground">
              No active jobs.{" "}
              <Link
                href="/employer/jobs/new"
                className="font-medium text-foreground hover:underline"
              >
                Post one
              </Link>
              .
            </div>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-border bg-card divide-y divide-border">
              {activeJobs.map((j) => (
                <li
                  key={j.id}
                  className="p-5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <Link
                      href={`/employer/jobs/${j.id}/candidates`}
                      className="text-h4 font-semibold leading-tight hover:underline"
                    >
                      {j.title}
                    </Link>
                    <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-caption text-muted-foreground">
                      {j._count.applications}{" "}
                      {j._count.applications === 1 ? "applicant" : "applicants"}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-small text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="size-1.5 rounded-full bg-status-accepted-text"
                        aria-hidden="true"
                      />
                      Active
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin
                        className="size-4"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      {j.location}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4 lg:col-span-7">
          <header className="flex items-center justify-between px-1">
            <h2 className="text-h3 font-semibold">Latest applicants</h2>
            <Link
              href="/employer/candidates"
              className="text-small text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </header>
          {latestApps.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-center text-small text-muted-foreground">
              No applicants yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-caption text-muted-foreground">
                      Candidate
                    </th>
                    <th className="px-4 py-3 text-caption text-muted-foreground">
                      Role
                    </th>
                    <th className="px-4 py-3 text-caption text-muted-foreground">
                      Applied
                    </th>
                    <th className="px-4 py-3 text-caption text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-small">
                  {latestApps.map((a) => (
                    <tr
                      key={a.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/employer/candidates/${a.id}`}
                          className="flex items-center gap-3 hover:underline"
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                            <UserIcon
                              className="size-4 text-muted-foreground"
                              strokeWidth={1.75}
                              aria-hidden="true"
                            />
                          </span>
                          <span className="font-medium">{a.user.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {a.job.title}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {relativeApplied(a.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={mapAppStatusOut(a.status)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
