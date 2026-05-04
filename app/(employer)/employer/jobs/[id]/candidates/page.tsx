import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ChevronRight, Clock, MapPin } from "lucide-react";
import { AvatarCircle } from "@/components/avatar-circle";
import { prisma } from "@/lib/prisma";
import { AppStatus, JobStatus } from "@prisma/client";
import { requireCompanyMember } from "@/lib/rbac";
import { mapAppStatusOut, mapJobTypeOut } from "@/lib/validators";
import { CandidateStatusSelect } from "@/components/candidate-status-select";
import { cn } from "@/lib/utils";
import { computeMatchScore } from "@/lib/match";

export const metadata = {
  title: "Candidate pipeline",
};

const TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  remote: "Remote",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
});

type Filter = "all" | "pending" | "reviewed" | "accepted" | "rejected";

const FILTER_TO_STATUS: Record<Filter, AppStatus | null> = {
  all: null,
  pending: AppStatus.PENDING,
  reviewed: AppStatus.REVIEWED,
  accepted: AppStatus.ACCEPTED,
  rejected: AppStatus.REJECTED,
};

function relativePosted(d: Date): string {
  const ms = Date.now() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (ms < day) return "Posted today";
  if (ms < 2 * day) return "Posted yesterday";
  const days = Math.floor(ms / day);
  if (days < 30) return `Posted ${days}d ago`;
  return `Posted ${dateFmt.format(d)}`;
}

function relativeApplied(d: Date): string {
  const ms = Date.now() - d.getTime();
  const hour = 60 * 60 * 1000;
  if (ms < hour) return "Applied just now";
  if (ms < 24 * hour) return `Applied ${Math.floor(ms / hour)}h ago`;
  const day = 24 * hour;
  const days = Math.floor(ms / day);
  if (days < 30) return `Applied ${days}d ago`;
  return `Applied ${dateFmt.format(d)}`;
}

export default async function CandidatePipelinePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, slug: true, name: true } },
    },
  });
  if (!job) notFound();
  await requireCompanyMember(job.companyId);

  const apps = await prisma.application.findMany({
    where: { jobId: id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const counts = {
    all: apps.length,
    pending: apps.filter((a) => a.status === AppStatus.PENDING).length,
    reviewed: apps.filter((a) => a.status === AppStatus.REVIEWED).length,
    accepted: apps.filter((a) => a.status === AppStatus.ACCEPTED).length,
    rejected: apps.filter((a) => a.status === AppStatus.REJECTED).length,
  };

  const filter: Filter =
    sp.filter && sp.filter in FILTER_TO_STATUS
      ? (sp.filter as Filter)
      : "all";
  const statusFilter = FILTER_TO_STATUS[filter];
  const visible = statusFilter
    ? apps.filter((a) => a.status === statusFilter)
    : apps;

  const filterPills: Array<{ value: Filter; label: string; count: number }> = [
    { value: "all", label: "All", count: counts.all },
    { value: "pending", label: "Pending", count: counts.pending },
    { value: "reviewed", label: "Reviewed", count: counts.reviewed },
    { value: "accepted", label: "Accepted", count: counts.accepted },
    { value: "rejected", label: "Rejected", count: counts.rejected },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16 space-y-8">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-small text-muted-foreground"
      >
        <Link
          href="/employer"
          className="hover:text-foreground transition-colors"
        >
          Employer
        </Link>
        <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
        <Link
          href="/employer/jobs"
          className="hover:text-foreground transition-colors"
        >
          Jobs
        </Link>
        <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
        <span className="text-foreground font-medium">{job.title}</span>
      </nav>

      <section className="rounded-xl border border-border bg-card p-5 md:p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <h1 className="text-h2">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-small text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin
                  className="size-4"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock
                  className="size-4"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                {TYPE_LABEL[mapJobTypeOut(job.type)]}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar
                  className="size-4"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                {relativePosted(job.createdAt)}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-caption uppercase",
                  job.status === JobStatus.OPEN
                    ? "bg-status-accepted-bg text-status-accepted-text"
                    : "bg-status-pending-bg text-status-pending-text",
                )}
              >
                {job.status === JobStatus.OPEN ? "Open" : "Closed"}
              </span>
            </div>
          </div>
          <div className="flex w-full items-stretch divide-x divide-border border-t border-border pt-4 md:w-auto md:border-t-0 md:border-l md:pt-0 md:pl-6">
            {[
              {
                label: "Total",
                value: counts.all,
                tone: "text-foreground",
              },
              {
                label: "Pending",
                value: counts.pending,
                tone: "text-status-pending-text",
              },
              {
                label: "Reviewed",
                value: counts.reviewed,
                tone: "text-status-reviewed-text",
              },
              {
                label: "Accepted",
                value: counts.accepted,
                tone: "text-status-accepted-text",
              },
              {
                label: "Rejected",
                value: counts.rejected,
                tone: "text-status-rejected-text",
              },
            ].map((s) => (
              <div key={s.label} className="flex-1 px-3 text-center">
                <p className="text-caption text-muted-foreground">
                  {s.label}
                </p>
                <p className={`mt-1 text-h4 font-semibold ${s.tone}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div
        className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0"
        role="tablist"
        aria-label="Filter candidates by status"
      >
        {filterPills.map((p) => {
          const selected = filter === p.value;
          return (
            <Link
              key={p.value}
              href={
                p.value === "all"
                  ? `/employer/jobs/${job.id}/candidates`
                  : `/employer/jobs/${job.id}/candidates?filter=${p.value}`
              }
              role="tab"
              aria-selected={selected}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-1.5 text-small transition-colors",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              {p.label} ({p.count})
            </Link>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
          <p className="text-h4 font-semibold text-foreground">
            {apps.length === 0
              ? "No applicants yet"
              : "No candidates in this status"}
          </p>
          <p className="mt-2 text-small">
            {apps.length === 0
              ? "Applicants will appear here as they apply."
              : "Try a different filter."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((a) => (
            <article
              key={a.id}
              className="flex flex-col gap-6 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm md:flex-row md:items-start md:justify-between md:p-6"
            >
              <div className="flex flex-grow items-start gap-4">
                <AvatarCircle
                  name={a.user.name}
                  seed={a.user.email}
                  size="lg"
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/employer/candidates/${a.id}`}
                      className="text-h4 font-semibold leading-tight hover:underline"
                    >
                      {a.user.name}
                    </Link>
                    <span
                      className="rounded-md bg-primary/10 px-2 py-0.5 text-caption text-primary"
                      title="Estimated keyword match between this cover letter and the role requirements"
                    >
                      {computeMatchScore(a.coverLetter, job.requirements)}% match
                    </span>
                  </div>
                  <p className="mt-1 text-small text-muted-foreground">
                    {a.user.email} · {relativeApplied(a.createdAt)}
                  </p>
                  <p className="mt-3 line-clamp-2 max-w-2xl text-body text-foreground/80">
                    {a.coverLetter}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:flex-col md:items-end">
                <CandidateStatusSelect
                  applicationId={a.id}
                  value={mapAppStatusOut(a.status)}
                />
                <Link
                  href={`/employer/candidates/${a.id}`}
                  className="text-small font-medium text-foreground hover:underline"
                >
                  Review →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
