import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Mail, Calendar, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireCompanyMember } from "@/lib/rbac";
import { mapAppStatusOut, mapJobTypeOut } from "@/lib/validators";
import { StatusBadge } from "@/components/status-badge";
import { CandidateStatusSelect } from "@/components/candidate-status-select";
import { Card, CardContent } from "@/components/ui/card";
import { computeMatchScore } from "@/lib/match";

export const metadata = {
  title: "Candidate",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  remote: "Remote",
};

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, createdAt: true } },
      job: {
        include: {
          company: { select: { id: true, slug: true, name: true } },
        },
      },
    },
  });
  if (!application) notFound();
  await requireCompanyMember(application.job.companyId);

  const otherApps = await prisma.application.findMany({
    where: {
      userId: application.userId,
      id: { not: application.id },
    },
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          company: { select: { name: true } },
        },
      },
    },
    take: 5,
  });

  const status = mapAppStatusOut(application.status);
  const matchScore = computeMatchScore(
    application.coverLetter,
    application.job.requirements,
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 md:px-8 md:py-16 space-y-8">
      <header className="border-b border-border pb-8">
        <Link
          href={`/employer/jobs/${application.job.id}/candidates`}
          className="text-small text-muted-foreground hover:text-foreground"
        >
          ← Back to {application.job.title}
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1>{application.user.name}</h1>
              <span
                className="rounded-md bg-primary/10 px-2 py-1 text-caption text-primary"
                title="Estimated keyword match between cover letter and job requirements"
              >
                {matchScore}% match
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-small text-muted-foreground">
              <a
                href={`mailto:${application.user.email}`}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <Mail
                  className="size-4"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                {application.user.email}
              </a>
              <span className="inline-flex items-center gap-1">
                <Calendar
                  className="size-4"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                Applied {dateFmt.format(application.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={status} />
            <CandidateStatusSelect
              applicationId={application.id}
              value={status}
            />
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardContent className="space-y-3 py-6">
              <h2 className="text-h4 font-semibold">Cover letter</h2>
              <p className="whitespace-pre-line text-body">
                {application.coverLetter}
              </p>
            </CardContent>
          </Card>
          {application.resumeUrl ? (
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-6">
                <div>
                  <h2 className="text-h4 font-semibold">Resume</h2>
                  <p className="mt-1 text-small text-muted-foreground">
                    Open the candidate&apos;s resume in a new tab.
                  </p>
                </div>
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-small font-medium hover:underline"
                >
                  Open resume
                  <ExternalLink
                    className="size-4"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </a>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="space-y-6">
          <Card>
            <CardContent className="space-y-2 py-6">
              <h2 className="text-h4 font-semibold">Applying for</h2>
              <p className="font-medium">{application.job.title}</p>
              <p className="text-small text-muted-foreground">
                {application.job.company.name}
              </p>
              <p className="inline-flex items-center gap-1 text-small text-muted-foreground">
                <MapPin
                  className="size-4"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                {application.job.location} ·{" "}
                {TYPE_LABEL[mapJobTypeOut(application.job.type)]}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 py-6">
              <h2 className="text-h4 font-semibold">Other applications</h2>
              {otherApps.length === 0 ? (
                <p className="text-small text-muted-foreground">
                  This is their only application on JobBoard.
                </p>
              ) : (
                <ul className="space-y-2 text-small">
                  {otherApps.map((o) => (
                    <li key={o.id} className="flex items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="font-medium">{o.job.title}</span>{" "}
                        <span className="text-muted-foreground">
                          · {o.job.company.name}
                        </span>
                      </span>
                      <StatusBadge status={mapAppStatusOut(o.status)} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
