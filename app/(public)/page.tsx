import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";
import { buttonVariants } from "@/components/ui/button";
import { JobCard } from "@/components/job-card";
import { mapJobTypeOut } from "@/lib/validators";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Find work that fits",
  description:
    "Curated full-time, part-time, and remote roles from companies hiring now. Apply in two clicks on JobBoard.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const recent = await prisma.job.findMany({
    where: { status: JobStatus.OPEN },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      company: { select: { id: true, slug: true, name: true } },
    },
  });

  return (
    <div className="w-full">
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-24 pb-16 text-center md:pt-32 md:pb-24">
        <h1>Find work that fits.</h1>
        <p className="mt-4 max-w-xl text-body-lg text-muted-foreground">
          Curated full-time, part-time, and remote roles. Apply in two clicks.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link href="/jobs" className={buttonVariants({ size: "default" })}>
            Browse jobs
          </Link>
          <Link
            href="/register"
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Sign up
          </Link>
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-8"
        aria-labelledby="recent-jobs"
      >
        <div className="mb-8 flex items-end justify-between">
          <h2 id="recent-jobs">Recently posted</h2>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-small text-muted-foreground hover:text-foreground"
          >
            View all jobs
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recent.map((job) => (
            <JobCard
              key={job.id}
              job={{
                id: job.id,
                title: job.title,
                company: job.company.name,
                companySlug: job.company.slug,
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
