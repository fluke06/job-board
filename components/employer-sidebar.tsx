"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  LayoutGrid,
  LogOut,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type NavItem = {
  href: string;
  label: string;
  Icon: typeof LayoutGrid;
  exact?: boolean;
};

const ITEMS: NavItem[] = [
  { href: "/employer", label: "Overview", Icon: LayoutGrid, exact: true },
  { href: "/employer/jobs", label: "Job Listings", Icon: Briefcase },
  { href: "/employer/candidates", label: "Talent Pool", Icon: Users },
  { href: "/employer/company", label: "Settings", Icon: Settings },
];

export function EmployerSidebar({
  companyName,
  userName,
}: {
  companyName: string;
  userName: string;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function isActive(item: NavItem) {
    return item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    startTransition(() => {
      router.push("/");
      router.refresh();
    });
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
        <Link href="/employer" className="flex items-center gap-2">
          <Briefcase className="size-5" strokeWidth={1.75} aria-hidden="true" />
          <span className="text-body-lg font-bold tracking-tight">JobBoard</span>
        </Link>
        <button
          type="button"
          aria-label="Toggle sidebar"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 hover:bg-muted"
        >
          <div className="flex flex-col gap-1">
            <span className="block h-0.5 w-5 bg-foreground" />
            <span className="block h-0.5 w-5 bg-foreground" />
            <span className="block h-0.5 w-5 bg-foreground" />
          </div>
        </button>
      </header>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-border bg-muted/30 transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        aria-label="Employer navigation"
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          <Link href="/employer" className="flex items-center gap-2">
            <Briefcase
              className="size-5"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <div className="leading-tight">
              <div className="text-small font-bold">JobBoard</div>
              <div className="text-caption text-muted-foreground">
                {companyName}
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col gap-1">
            {ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-small transition-colors",
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.Icon
                      className="size-4"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-3 space-y-2">
          <Link
            href="/employer/jobs/new"
            onClick={() => setOpen(false)}
            className={cn(buttonVariants(), "w-full")}
          >
            <Plus className="size-4" strokeWidth={1.75} aria-hidden="true" />
            Post a job
          </Link>
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="min-w-0 flex-1">
              <p className="truncate text-small font-medium">{userName}</p>
              <p className="text-caption text-muted-foreground">
                {companyName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={pending}
              aria-label="Log out"
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut
                className="size-4"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

export function EmployerCompanyChip({ name }: { name: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1">
      <Building2
        className="size-4 text-muted-foreground"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <span className="text-small font-medium">{name}</span>
    </div>
  );
}
