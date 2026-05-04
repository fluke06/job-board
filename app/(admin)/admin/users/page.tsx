import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { Prisma, Role } from "@prisma/client";
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
import { AvatarCircle } from "@/components/avatar-circle";
import { UserRoleSelect } from "@/components/user-role-select";
import { DeleteUserButton } from "@/components/admin-row-actions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Users | Admin",
};

type SearchParams = { q?: string | string[]; role?: string | string[] };

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const ROLE_TO_API: Record<Role, "applicant" | "employer" | "admin"> = {
  APPLICANT: "applicant",
  EMPLOYER: "employer",
  ADMIN: "admin",
};

const FILTER_OPTIONS: Array<{
  value: "all" | "applicant" | "employer" | "admin";
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "applicant", label: "Applicants" },
  { value: "employer", label: "Employers" },
  { value: "admin", label: "Admins" },
];

function flatten(sp: SearchParams, key: keyof SearchParams): string | undefined {
  const v = sp[key];
  if (Array.isArray(v)) return v[0];
  return typeof v === "string" ? v : undefined;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireAdmin();
  const sp = await searchParams;
  const q = flatten(sp, "q")?.trim();
  const filter = (flatten(sp, "role") ?? "all") as
    | "all"
    | "applicant"
    | "employer"
    | "admin";

  const where: Prisma.UserWhereInput = {};
  if (filter === "applicant") where.role = Role.APPLICANT;
  else if (filter === "employer") where.role = Role.EMPLOYER;
  else if (filter === "admin") where.role = Role.ADMIN;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
    ];
  }

  const [users, totals] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { applications: true, companies: true } },
      },
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
  ]);

  const roleCounts: Record<Role, number> = {
    APPLICANT: 0,
    EMPLOYER: 0,
    ADMIN: 0,
  };
  for (const t of totals) roleCounts[t.role] = t._count._all;
  const total =
    roleCounts.APPLICANT + roleCounts.EMPLOYER + roleCounts.ADMIN;

  function buildHref(next: { role?: string; q?: string }) {
    const p = new URLSearchParams();
    const r = next.role ?? filter;
    if (r && r !== "all") p.set("role", r);
    const query = next.q ?? q;
    if (query) p.set("q", query);
    const qs = p.toString();
    return qs ? `/admin/users?${qs}` : "/admin/users";
  }

  const pillCounts = {
    all: total,
    applicant: roleCounts.APPLICANT,
    employer: roleCounts.EMPLOYER,
    admin: roleCounts.ADMIN,
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16 space-y-8">
      <header className="space-y-3 border-b-2 border-foreground pb-8">
        <span className="text-caption text-brand-strong">Platform admin</span>
        <h1 className="jb-display !text-[clamp(36px,5vw,56px)]">Users.</h1>
        <p className="text-body-lg text-muted-foreground">
          Every account on the platform. Change roles, search, or remove
          accounts.
        </p>
      </header>

      <form
        action="/admin/users"
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
            placeholder="Search by name or email"
            className="pl-9"
            aria-label="Search users"
          />
        </div>
        {filter !== "all" ? (
          <input type="hidden" name="role" value={filter} />
        ) : null}
        <p className="text-small text-muted-foreground">
          {users.length} {users.length === 1 ? "user" : "users"}
          {q ? ` matching “${q}”` : ""}
        </p>
      </form>

      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {FILTER_OPTIONS.map((opt) => {
          const active = filter === opt.value;
          return (
            <Link
              key={opt.value}
              href={buildHref({ role: opt.value })}
              aria-current={active ? "true" : undefined}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-1.5 text-small transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              {opt.label} ({pillCounts[opt.value]})
            </Link>
          );
        })}
      </div>

      {users.length === 0 ? (
        <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
          <p className="text-h4 font-semibold text-foreground">
            No users match
          </p>
          <p className="mt-2 text-small">Try a different search or filter.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border-2 border-foreground bg-card shadow-[3px_3px_0_var(--foreground)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-caption text-muted-foreground">
                  User
                </TableHead>
                <TableHead className="text-caption text-muted-foreground">
                  Role
                </TableHead>
                <TableHead className="text-caption text-muted-foreground">
                  Applications
                </TableHead>
                <TableHead className="text-caption text-muted-foreground">
                  Companies
                </TableHead>
                <TableHead className="text-caption text-muted-foreground">
                  Joined
                </TableHead>
                <TableHead className="text-right text-caption text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isSelf = u.id === session.userId;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AvatarCircle
                          name={u.name}
                          seed={u.email}
                          size="sm"
                        />
                        <div>
                          <div className="font-medium">
                            {u.name}
                            {isSelf ? (
                              <span className="ml-2 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                you
                              </span>
                            ) : null}
                          </div>
                          <div className="text-caption text-muted-foreground">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <UserRoleSelect
                        userId={u.id}
                        value={ROLE_TO_API[u.role]}
                        disabled={isSelf}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u._count.applications}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u._count.companies}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dateFmt.format(u.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteUserButton
                        userId={u.id}
                        userName={u.name}
                        disabled={isSelf}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
