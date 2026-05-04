import Link from "next/link";
import { AppStatus, Prisma } from "@prisma/client";
import { Search, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/rbac";
import { mapAppStatusOut } from "@/lib/validators";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { computeMatchScore } from "@/lib/match";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Talent Pool",
};

type Filter = "all" | "pending" | "reviewed" | "accepted" | "rejected";

const FILTER_TO_STATUS: Record<Filter, AppStatus | null> = {
  all: null,
  pending: AppStatus.PENDING,
  reviewed: AppStatus.REVIEWED,
  accepted: AppStatus.ACCEPTED,
  rejected: AppStatus.REJECTED,
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

type SearchParams = { q?: string | string[]; filter?: string | string[] };

function flatten(sp: SearchParams, key: keyof SearchParams): string | undefined {
  const v = sp[key];
  if (Array.isArray(v)) return v[0];
  return typeof v === "string" ? v : undefined;
}

export default async function TalentPoolPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const ctx = await requireEmployer();
  if (ctx.companyIds.length === 0) {
    return null;
  }
  const sp = await searchParams;
  const q = flatten(sp, "q")?.trim();
  const filterParam = flatten(sp, "filter");
  const filter: Filter =
    filterParam && filterParam in FILTER_TO_STATUS
      ? (filterParam as Filter)
      : "all";

  const where: Prisma.ApplicationWhereInput = {
    job: { companyId: { in: ctx.companyIds } },
  };
  if (q) {
    where.OR = [
      { user: { name: { contains: q } } },
      { user: { email: { contains: q } } },
      { job: { title: { contains: q } } },
    ];
  }
  if (FILTER_TO_STATUS[filter]) {
    where.status = FILTER_TO_STATUS[filter]!;
  }

  const [items, allCount, statusCounts] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        job: {
          select: {
            id: true,
            title: true,
            requirements: true,
            company: { select: { id: true, slug: true, name: true } },
          },
        },
      },
    }),
    prisma.application.count({
      where: { job: { companyId: { in: ctx.companyIds } } },
    }),
    prisma.application.groupBy({
      by: ["status"],
      where: { job: { companyId: { in: ctx.companyIds } } },
      _count: { _all: true },
    }),
  ]);

  const counts: Record<AppStatus, number> = {
    PENDING: 0,
    REVIEWED: 0,
    ACCEPTED: 0,
    REJECTED: 0,
  };
  for (const g of statusCounts) counts[g.status] = g._count._all;

  function buildHref(next: { filter?: Filter; q?: string }) {
    const p = new URLSearchParams();
    const f = next.filter ?? filter;
    if (f && f !== "all") p.set("filter", f);
    const query = next.q ?? q;
    if (query) p.set("q", query);
    const qs = p.toString();
    return qs ? `/employer/candidates?${qs}` : "/employer/candidates";
  }

  const filterPills: Array<{ value: Filter; label: string; count: number }> = [
    { value: "all", label: "All", count: allCount },
    { value: "pending", label: "Pending", count: counts.PENDING },
    { value: "reviewed", label: "Reviewed", count: counts.REVIEWED },
    { value: "accepted", label: "Accepted", count: counts.ACCEPTED },
    { value: "rejected", label: "Rejected", count: counts.REJECTED },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16 space-y-8">
      <header className="space-y-3 border-b-2 border-foreground pb-6">
        <span className="text-caption text-brand-strong">Your candidates</span>
        <h1 className="jb-display !text-[clamp(36px,5vw,56px)] inline-flex items-center gap-3">
          <Users className="size-9" strokeWidth={2.5} aria-hidden="true" />
          Talent Pool.
        </h1>
        <p className="text-body-lg text-muted-foreground">
          Every candidate who has applied across your jobs.
        </p>
      </header>

      <form action="/employer/candidates" className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-[400px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <Input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by name, email, or role"
            className="pl-9"
            aria-label="Search candidates"
          />
        </div>
        {filter !== "all" ? (
          <input type="hidden" name="filter" value={filter} />
        ) : null}
        <p className="text-small text-muted-foreground">
          {items.length} {items.length === 1 ? "candidate" : "candidates"}
          {q ? ` for “${q}”` : ""}
        </p>
      </form>

      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {filterPills.map((p) => {
          const selected = filter === p.value;
          return (
            <Link
              key={p.value}
              href={buildHref({ filter: p.value })}
              aria-current={selected ? "true" : undefined}
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

      {items.length === 0 ? (
        <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
          <p className="text-h4 font-semibold text-foreground">
            {q || filter !== "all"
              ? "No candidates match"
              : "No candidates yet"}
          </p>
          <p className="mt-2 text-small">
            {q || filter !== "all"
              ? "Try a different search or filter."
              : "Candidates will appear here as they apply to your roles."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-caption text-muted-foreground">
                  Candidate
                </TableHead>
                <TableHead className="text-caption text-muted-foreground">
                  Match
                </TableHead>
                <TableHead className="text-caption text-muted-foreground">
                  Applying for
                </TableHead>
                <TableHead className="text-caption text-muted-foreground">
                  Applied
                </TableHead>
                <TableHead className="text-caption text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-right text-caption text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="font-medium">{a.user.name}</div>
                    <div className="text-caption text-muted-foreground">
                      {a.user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-caption text-primary">
                      {computeMatchScore(a.coverLetter, a.job.requirements)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/employer/jobs/${a.job.id}/candidates`}
                      className="hover:underline"
                    >
                      {a.job.title}
                    </Link>
                    <div className="text-caption text-muted-foreground">
                      {a.job.company.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dateFmt.format(a.createdAt)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={mapAppStatusOut(a.status)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/employer/candidates/${a.id}`}
                      className="text-small font-medium text-foreground hover:underline"
                    >
                      Review →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
