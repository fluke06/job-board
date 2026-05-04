import Link from "next/link";
import { ArrowRight, MapPin, DollarSign, Sparkles, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  remote: "Remote",
};

const TYPE_PILL: Record<string, string> = {
  "full-time":
    "bg-type-fulltime-bg text-type-fulltime-text border-[1.5px] border-type-fulltime-text/30",
  "part-time":
    "bg-type-parttime-bg text-type-parttime-text border-[1.5px] border-type-parttime-text/30",
  remote: "bg-foreground text-background border-[1.5px] border-foreground",
};

const DAY_MS = 24 * 60 * 60 * 1000;

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
    createdAt?: Date | string;
    applicationCount?: number;
  };
}) {
  const createdAtMs =
    job.createdAt instanceof Date
      ? job.createdAt.getTime()
      : typeof job.createdAt === "string"
        ? new Date(job.createdAt).getTime()
        : null;
  const isNew = createdAtMs ? Date.now() - createdAtMs < 3 * DAY_MS : false;
  const isHot = (job.applicationCount ?? 0) >= 3;

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border-2 border-foreground bg-card p-6 shadow-[3px_3px_0_var(--foreground)] transition-[transform,box-shadow] duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_var(--foreground)]">
      {isNew || isHot ? (
        <div className="pointer-events-none absolute -right-2 -top-2 flex flex-col gap-1.5">
          {isNew ? (
            <span className="jb-sticker jb-sticker-new pointer-events-auto">
              <Sparkles className="size-3" strokeWidth={2.5} />
              New
            </span>
          ) : null}
          {isHot ? (
            <span className="jb-sticker jb-sticker-hot pointer-events-auto">
              <Flame className="size-3" strokeWidth={2.5} />
              Hot
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        {job.companySlug ? (
          <Link
            href={`/companies/${job.companySlug}`}
            className="text-small font-medium text-muted-foreground hover:text-foreground"
          >
            {job.company}
          </Link>
        ) : (
          <span className="text-small font-medium text-muted-foreground">
            {job.company}
          </span>
        )}
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            TYPE_PILL[job.type],
          )}
        >
          {TYPE_LABEL[job.type]}
        </span>
      </div>
      <h3 className="mt-3 text-h4 font-bold leading-tight">
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
          className="inline-flex items-center gap-1 text-small font-semibold text-foreground"
        >
          View role
          <ArrowRight
            className="size-4 jb-arrow-nudge"
            strokeWidth={2}
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
