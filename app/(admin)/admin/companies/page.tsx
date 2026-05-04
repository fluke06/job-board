import Link from "next/link";
import type { Metadata } from "next";
import { Building2, ExternalLink, Search } from "lucide-react";
import { Prisma, JobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DeleteCompanyButton } from "@/components/admin-row-actions";

export const metadata: Metadata = {
  title: "Companies | Admin",
};

type SearchParams = { q?: string | string[] };

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function flatten(sp: SearchParams): string | undefined {
  const v = sp.q;
  if (Array.isArray(v)) return v[0];
  return typeof v === "string" ? v : undefined;
}

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const q = flatten(sp)?.trim();

  const where: Prisma.CompanyWhereInput = q
    ? {
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
          { industry: { contains: q } },
        ],
      }
    : {};

  const companies = await prisma.company.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          jobs: true,
          members: true,
        },
      },
      jobs: {
        select: {
          _count: { select: { applications: true } },
          status: true,
        },
      },
    },
  });

  const rows = companies.map((c) => ({
    ...c,
    openJobs: c.jobs.filter((j) => j.status === JobStatus.OPEN).length,
    totalApps: c.jobs.reduce((acc, j) => acc + j._count.applications, 0),
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16 space-y-8">
      <header className="space-y-3 border-b-2 border-foreground pb-8">
        <span className="text-caption text-brand-strong">Platform admin</span>
        <h1 className="jb-display !text-[clamp(36px,5vw,56px)]">Companies.</h1>
        <p className="text-body-lg text-muted-foreground">
          Every company on the platform. Inspect membership, jobs, and
          applications.
        </p>
      </header>

      <form
        action="/admin/companies"
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
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
            placeholder="Search by name, slug, or industry"
            className="pl-9"
            aria-label="Search companies"
          />
        </div>
        <p className="text-small text-muted-foreground">
          {companies.length} {companies.length === 1 ? "company" : "companies"}
          {q ? ` matching “${q}”` : ""}
        </p>
      </form>

      {companies.length === 0 ? (
        <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
          <p className="text-h4 font-semibold text-foreground">
            No companies yet
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border-2 border-foreground bg-card shadow-[3px_3px_0_var(--foreground)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-caption text-muted-foreground">
                  Company
                </TableHead>
                <TableHead className="text-caption text-muted-foreground">
                  Industry
                </TableHead>
                <TableHead className="text-caption text-muted-foreground">
                  Members
                </TableHead>
                <TableHead className="text-caption text-muted-foreground">
                  Jobs
                </TableHead>
                <TableHead className="text-caption text-muted-foreground">
                  Apps
                </TableHead>
                <TableHead className="text-caption text-muted-foreground">
                  Created
                </TableHead>
                <TableHead className="text-right text-caption text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                        <Building2
                          className="size-4 text-muted-foreground"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      </span>
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-caption text-muted-foreground">
                          {c.slug}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.industry ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c._count.members}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.openJobs}{" "}
                    <span className="text-caption">/ {c._count.jobs}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.totalApps}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dateFmt.format(c.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/companies/${c.slug}`}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-small font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        View
                        <ExternalLink
                          className="size-3.5"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      </Link>
                      <DeleteCompanyButton slug={c.slug} name={c.name} />
                    </div>
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
