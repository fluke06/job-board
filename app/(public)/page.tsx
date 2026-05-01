import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";
import { buttonVariants } from "@/components/ui/button";
import { JobCard } from "@/components/job-card";
import { mapJobTypeOut } from "@/lib/validators";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Find your next role",
  description:
    "Browse curated full-time, part-time, and remote job openings and apply in minutes on JobBoard.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const recent = await prisma.job.findMany({
    where: { status: JobStatus.OPEN },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Find your next role.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse curated full-time, part-time, and remote opportunities.
        </p>
        <div className="mt-8">
          <Link href="/jobs" className={buttonVariants({ size: "lg" })}>
            Browse Jobs
          </Link>
        </div>
      </section>

      <section aria-labelledby="recent-jobs">
        <div className="flex items-baseline justify-between mb-4">
          <h2 id="recent-jobs" className="text-2xl font-semibold">
            Recent openings
          </h2>
          <Link href="/jobs" className="text-sm font-medium hover:underline">
            See all →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {recent.map((job) => (
            <JobCard
              key={job.id}
              job={{
                id: job.id,
                title: job.title,
                company: job.company,
                location: job.location,
                type: mapJobTypeOut(job.type),
                salaryRange: job.salaryRange,
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
