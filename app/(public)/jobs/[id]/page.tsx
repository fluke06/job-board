import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, ChevronRight } from "lucide-react";
import { Squiggle } from "@/components/squiggle";
import { Role, JobStatus, JobType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { ApplyDialog } from "@/components/apply-dialog";
import { StatusBadge } from "@/components/status-badge";
import { mapAppStatusOut, mapJobTypeOut } from "@/lib/validators";
import { DeleteJobButton } from "@/components/delete-job-button";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  remote: "Remote",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function relativePosted(d: Date): string {
  const ms = Date.now() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (ms < day) return "Posted today";
  if (ms < 2 * day) return "Posted yesterday";
  const days = Math.floor(ms / day);
  if (days < 30) return `Posted ${days}d ago`;
  return `Posted ${dateFmt.format(d)}`;
}

export const revalidate = 60;

function truncateForDescription(text: string, max = 155): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return flat.slice(0, max - 1).trimEnd() + "…";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      company: { select: { name: true } },
    },
  });
  if (!job) {
    return { title: "Job not found" };
  }
  const description = truncateForDescription(job.description);
  return {
    title: `${job.title} at ${job.company.name}`,
    description,
    alternates: { canonical: `/jobs/${id}` },
    openGraph: {
      type: "article",
      title: `${job.title} at ${job.company.name}`,
      description,
      url: `/jobs/${id}`,
    },
  };
}

function employmentType(t: JobType): string {
  switch (t) {
    case JobType.FULL_TIME:
      return "FULL_TIME";
    case JobType.PART_TIME:
      return "PART_TIME";
    case JobType.REMOTE:
      return "OTHER";
  }
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, slug: true, name: true, logoUrl: true } },
    },
  });
  if (!job) notFound();

  const session = await getSession();
  let myApplication: { status: "pending" | "reviewed" | "accepted" | "rejected" } | null =
    null;
  let isAdmin = false;

  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });
    isAdmin = user?.role === Role.ADMIN;
    if (!isAdmin) {
      const existing = await prisma.application.findUnique({
        where: { jobId_userId: { jobId: job.id, userId: session.userId } },
        select: { status: true },
      });
      if (existing) {
        myApplication = { status: mapAppStatusOut(existing.status) };
      }
    }
  }

  const apiType = mapJobTypeOut(job.type);
  const SITE_URL =
    process.env.SITE_URL ?? "http://localhost:3000";
  const validThrough = new Date(
    job.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.createdAt.toISOString(),
    validThrough,
    employmentType: employmentType(job.type),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company.name,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
      },
    },
    url: `${SITE_URL}/jobs/${job.id}`,
  };
  if (job.type === JobType.REMOTE) {
    jsonLd.jobLocationType = "TELECOMMUTE";
  }
  if (job.salaryRange) {
    jsonLd.baseSalary = {
      "@type": "MonetaryAmount",
      value: { "@type": "QuantitativeValue", value: job.salaryRange },
    };
  }

  const canApply =
    !!session && !isAdmin && !myApplication && job.status === JobStatus.OPEN;

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-10 md:px-8 md:py-16 space-y-8">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <nav
        aria-label="Breadcrumb"
        className="hidden items-center gap-2 text-small text-muted-foreground md:flex"
      >
        <Link href="/jobs" className="hover:text-foreground transition-colors">
          Jobs
        </Link>
        <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
        <span className="font-medium text-foreground">{job.title}</span>
      </nav>
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-small text-muted-foreground hover:text-foreground md:hidden"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
        Back to jobs
      </Link>

      {canApply ? (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-foreground bg-[hsl(74_90%_60%)] p-5 shadow-[4px_4px_0_var(--foreground)] md:p-6">
          <h2 className="text-h3 font-bold">Ready to apply?</h2>
          <ApplyDialog jobId={job.id} />
        </section>
      ) : null}

      <header className="space-y-6 border-b-2 border-foreground pb-8">
        <div className="flex items-start gap-4">
          <Link
            href={`/companies/${job.company.slug}`}
            aria-label={`${job.company.name} profile`}
            className="flex size-14 shrink-0 items-center justify-center rounded-lg border-2 border-foreground bg-card shadow-[3px_3px_0_var(--foreground)] transition-transform hover:-translate-x-px hover:-translate-y-px"
          >
            <Building2
              className="size-6 text-foreground"
              strokeWidth={2}
              aria-hidden="true"
            />
          </Link>
          <div className="min-w-0 space-y-2">
            <Link
              href={`/companies/${job.company.slug}`}
              className="relative inline-block text-small font-medium text-muted-foreground hover:text-foreground"
            >
              <span className="relative">
                {job.company.name}
                <Squiggle className="absolute left-0 right-0 -bottom-1 h-1.5 w-full text-brand opacity-60" />
              </span>
            </Link>
            <h1 className="jb-display !text-[clamp(36px,5vw,56px)] leading-[1.05]">
              {job.title}
            </h1>
            <p className="text-small text-muted-foreground">
              {relativePosted(job.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-caption ${
              apiType === "remote"
                ? "bg-foreground text-background border-[1.5px] border-foreground"
                : "border-[1.5px] border-foreground text-foreground"
            }`}
          >
            {TYPE_LABEL[apiType]}
          </span>
          <span className="inline-flex items-center rounded-full border-[1.5px] border-foreground px-2.5 py-1 text-caption">
            {job.location}
          </span>
          {job.salaryRange ? (
            <span className="inline-flex items-center rounded-full border-[1.5px] border-foreground bg-[hsl(74_90%_60%)] px-2.5 py-1 text-caption">
              {job.salaryRange}
            </span>
          ) : null}
          {job.status === JobStatus.CLOSED ? (
            <span className="inline-flex items-center rounded-full bg-status-pending-bg px-2.5 py-1 text-caption text-status-pending-text border-[1.5px] border-status-pending-text/30">
              Closed
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!session ? (
            <Link
              href={`/login?next=/jobs/${job.id}`}
              className={`${buttonVariants({ size: "default" })} shadow-[3px_3px_0_var(--foreground)] transition-transform hover:-translate-x-px hover:-translate-y-px`}
            >
              Sign in to apply
            </Link>
          ) : isAdmin ? (
            <>
              <Link
                href={`/admin/jobs/${job.id}/edit`}
                className={`${buttonVariants({ variant: "outline" })} border-2 border-foreground shadow-[2px_2px_0_var(--foreground)]`}
              >
                Edit
              </Link>
              <DeleteJobButton jobId={job.id} />
            </>
          ) : myApplication ? (
            <div className="flex items-center gap-2">
              <span className="text-small text-muted-foreground">
                Your application:
              </span>
              <StatusBadge status={myApplication.status} />
            </div>
          ) : job.status === JobStatus.OPEN ? (
            <ApplyDialog jobId={job.id} />
          ) : (
            <p className="text-small text-muted-foreground">
              This job is no longer accepting applications.
            </p>
          )}
        </div>
      </header>

      <div className="space-y-10">
        <section className="space-y-3">
          <span className="text-caption text-brand-strong">About the role</span>
          <h2 className="jb-display !text-[clamp(28px,3vw,40px)]">
            What you&apos;ll do.
          </h2>
          <div className="space-y-4 whitespace-pre-line text-body text-foreground/80">
            <p>{job.description}</p>
          </div>
        </section>
        <section className="space-y-3">
          <span className="text-caption text-brand-strong">Requirements</span>
          <h2 className="jb-display !text-[clamp(28px,3vw,40px)]">
            What you bring.
          </h2>
          <div className="space-y-4 whitespace-pre-line text-body text-foreground/80">
            <p>{job.requirements}</p>
          </div>
        </section>
      </div>
    </article>
  );
}
