import Link from "next/link";
import { Briefcase, Building2, FileText, UserPlus } from "lucide-react";
import { JobStatus, AppStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/animated-counter";
import { AvatarCircle } from "@/components/avatar-circle";
import { StatusBadge } from "@/components/status-badge";
import { mapAppStatusOut, mapJobTypeOut } from "@/lib/validators";

export const metadata = {
  title: "Admin | JobBoard",
  description: "Internal admin overview.",
};

const TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  remote: "Remote",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function relative(d: Date): string {
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

export default async function AdminOverviewPage() {
  const [
    totalJobs,
    openJobs,
    totalApps,
    pendingApps,
    totalUsers,
    totalCompanies,
    recentSignups,
    recentJobs,
    recentApps,
  ] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { status: JobStatus.OPEN } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: AppStatus.PENDING } }),
    prisma.user.count(),
    prisma.company.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        company: { select: { id: true, slug: true, name: true } },
      },
    }),
    prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { id: true, name: true, email: true } },
        job: {
          select: {
            id: true,
            title: true,
            company: { select: { name: true, slug: true } },
          },
        },
      },
    }),
  ]);

  const cards = [
    {
      label: "Total users",
      value: totalUsers,
      Icon: UserPlus,
      href: "/admin/users",
    },
    {
      label: "Companies",
      value: totalCompanies,
      Icon: Building2,
      href: "/admin/companies",
    },
    {
      label: "Open jobs",
      value: openJobs,
      Icon: Briefcase,
      href: "/admin/jobs",
      footnote: `${totalJobs} total`,
    },
    {
      label: "Pending apps",
      value: pendingApps,
      Icon: FileText,
      href: "/admin/applications",
      footnote: `${totalApps} total`,
    },
  ];

  const ROLE_LABEL: Record<Role, string> = {
    APPLICANT: "Applicant",
    EMPLOYER: "Employer",
    ADMIN: "Admin",
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16 space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-8">
        <div className="space-y-3">
          <span className="text-caption text-brand-strong">Platform admin</span>
          <h1 className="jb-display !text-[clamp(36px,5vw,56px)]">
            Admin overview.
          </h1>
          <p className="text-body-lg text-muted-foreground">
            Manage users, companies, jobs, and applications across the platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/users"
            className={`${buttonVariants({ variant: "outline" })} border-2 border-foreground shadow-[2px_2px_0_var(--foreground)]`}
          >
            Manage users
          </Link>
          <Link
            href="/admin/companies"
            className={`${buttonVariants({ variant: "outline" })} border-2 border-foreground shadow-[2px_2px_0_var(--foreground)]`}
          >
            Manage companies
          </Link>
        </div>
      </header>

      <section
        aria-labelledby="stats"
        className="grid gap-4 grid-cols-2 lg:grid-cols-4"
      >
        <h2 id="stats" className="sr-only">
          Platform stats
        </h2>
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group flex h-full flex-col gap-2 rounded-2xl border-2 border-foreground bg-card p-6 shadow-[3px_3px_0_var(--foreground)] transition-[transform,box-shadow] duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_var(--foreground)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-caption text-muted-foreground">
                {c.label}
              </span>
              <c.Icon
                className="size-5 text-muted-foreground transition-colors group-hover:text-brand"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </div>
            <span className="text-h2 font-bold leading-none">
              <AnimatedCounter value={c.value} />
            </span>
            {c.footnote ? (
              <span className="text-caption text-muted-foreground">
                {c.footnote}
              </span>
            ) : null}
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3">
          <header className="flex items-baseline justify-between">
            <h2 className="text-h3 font-semibold">Latest signups</h2>
            <Link
              href="/admin/users"
              className="text-small text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </header>
          {recentSignups.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-center text-small text-muted-foreground">
              No signups yet.
            </div>
          ) : (
            <ul className="overflow-hidden rounded-2xl border-2 border-foreground bg-card divide-y divide-border shadow-[3px_3px_0_var(--foreground)]">
              {recentSignups.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/30"
                >
                  <AvatarCircle name={u.name} seed={u.email} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-small font-medium">
                      {u.name}
                    </div>
                    <div className="truncate text-caption text-muted-foreground">
                      {ROLE_LABEL[u.role]} · {relative(u.createdAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <header className="flex items-baseline justify-between">
            <h2 className="text-h3 font-semibold">Latest jobs</h2>
            <Link
              href="/admin/jobs"
              className="text-small text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </header>
          {recentJobs.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-center text-small text-muted-foreground">
              No jobs posted yet.
            </div>
          ) : (
            <ul className="overflow-hidden rounded-2xl border-2 border-foreground bg-card divide-y divide-border shadow-[3px_3px_0_var(--foreground)]">
              {recentJobs.map((j) => (
                <li
                  key={j.id}
                  className="p-4 transition-colors hover:bg-muted/30"
                >
                  <Link
                    href={`/admin/jobs/${j.id}/edit`}
                    className="block"
                  >
                    <div className="truncate text-small font-medium hover:underline">
                      {j.title}
                    </div>
                    <div className="truncate text-caption text-muted-foreground">
                      {j.company.name} · {TYPE_LABEL[mapJobTypeOut(j.type)]} ·{" "}
                      {relative(j.createdAt)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <header className="flex items-baseline justify-between">
            <h2 className="text-h3 font-semibold">Latest applications</h2>
            <Link
              href="/admin/applications"
              className="text-small text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </header>
          {recentApps.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-center text-small text-muted-foreground">
              No applications yet.
            </div>
          ) : (
            <ul className="overflow-hidden rounded-2xl border-2 border-foreground bg-card divide-y divide-border shadow-[3px_3px_0_var(--foreground)]">
              {recentApps.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/30"
                >
                  <AvatarCircle
                    name={a.user.name}
                    seed={a.user.email}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-small font-medium">
                      {a.user.name}
                    </div>
                    <div className="truncate text-caption text-muted-foreground">
                      {a.job.title} · {relative(a.createdAt)}
                    </div>
                  </div>
                  <StatusBadge status={mapAppStatusOut(a.status)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
