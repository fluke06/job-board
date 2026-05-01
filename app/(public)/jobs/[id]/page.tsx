import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Role, JobStatus, JobType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApplyDialog } from "@/components/apply-dialog";
import { StatusBadge } from "@/components/status-badge";
import { mapAppStatusOut, mapJobTypeOut } from "@/lib/validators";
import { DeleteJobButton } from "@/components/delete-job-button";

const TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  remote: "Remote",
};

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
    select: { title: true, company: true, description: true },
  });
  if (!job) {
    return { title: "Job not found" };
  }
  const description = truncateForDescription(job.description);
  return {
    title: `${job.title} at ${job.company}`,
    description,
    alternates: { canonical: `/jobs/${id}` },
    openGraph: {
      type: "article",
      title: `${job.title} at ${job.company}`,
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
  const job = await prisma.job.findUnique({ where: { id } });
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
      name: job.company,
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

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <p className="text-lg text-muted-foreground">{job.company}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="secondary">{TYPE_LABEL[apiType]}</Badge>
            <Badge variant="outline">{job.location}</Badge>
            {job.status === JobStatus.CLOSED ? (
              <Badge variant="destructive">Closed</Badge>
            ) : null}
          </div>
        </div>
        {job.salaryRange ? (
          <p className="text-sm text-foreground/80">
            Salary: {job.salaryRange}
          </p>
        ) : null}
      </header>

      <Card>
        <CardContent className="prose prose-sm max-w-none whitespace-pre-line py-6">
          <h2 className="text-base font-semibold">Description</h2>
          <p>{job.description}</p>
          <h2 className="text-base font-semibold mt-4">Requirements</h2>
          <p>{job.requirements}</p>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 flex-wrap">
        {!session ? (
          <Link
            href={`/login?next=/jobs/${job.id}`}
            className={buttonVariants()}
          >
            Log in to apply
          </Link>
        ) : isAdmin ? (
          <>
            <Link
              href={`/admin/jobs/${job.id}/edit`}
              className={buttonVariants({ variant: "outline" })}
            >
              Edit
            </Link>
            <DeleteJobButton jobId={job.id} />
          </>
        ) : myApplication ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Your application:
            </span>
            <StatusBadge status={myApplication.status} />
          </div>
        ) : job.status === JobStatus.OPEN ? (
          <ApplyDialog jobId={job.id} />
        ) : (
          <p className="text-sm text-muted-foreground">
            This job is no longer accepting applications.
          </p>
        )}
      </div>
    </article>
  );
}
