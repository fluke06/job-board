import Link from "next/link";
import { ArrowRight, MapPin, DollarSign } from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  remote: "Remote",
};

const TYPE_PILL: Record<string, string> = {
  "full-time":
    "bg-type-fulltime-bg text-type-fulltime-text border border-transparent",
  "part-time":
    "bg-type-parttime-bg text-type-parttime-text border border-transparent",
  remote: "bg-primary text-primary-foreground border border-transparent",
};

export function JobCard({
  job,
}: {
  job: {
    id: string;
    title: string;
    company: string;
    companySlug?: string;
    location: string;
    type: "full-time" | "part-time" | "remote";
    salaryRange?: string | null;
  };
}) {
  return (
    <article className="group jb-card-hover flex flex-col rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        {job.companySlug ? (
          <Link
            href={`/companies/${job.companySlug}`}
            className="text-small text-muted-foreground hover:text-foreground"
          >
            {job.company}
          </Link>
        ) : (
          <span className="text-small text-muted-foreground">
            {job.company}
          </span>
        )}
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-caption ${TYPE_PILL[job.type]}`}
        >
          {TYPE_LABEL[job.type]}
        </span>
      </div>
      <h3 className="mt-3 text-h4 font-semibold leading-tight">
        <Link
          href={`/jobs/${job.id}`}
          className="hover:underline focus-visible:outline-none"
        >
          {job.title}
        </Link>
      </h3>
      <div className="mt-4 flex flex-wrap gap-3 text-small text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-4" strokeWidth={1.75} aria-hidden="true" />
          {job.location}
        </span>
        {job.salaryRange ? (
          <span className="inline-flex items-center gap-1">
            <DollarSign
              className="size-4"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            {job.salaryRange}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex justify-end">
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1 text-small text-muted-foreground transition-colors hover:text-foreground"
        >
          View role
          <ArrowRight
            className="size-4 jb-arrow-nudge"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
