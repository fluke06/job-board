"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Briefcase, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/employer", label: "Overview", Icon: LayoutGrid, exact: true },
  { href: "/employer/jobs", label: "Jobs", Icon: Briefcase },
  { href: "/employer/candidates", label: "Talent Pool", Icon: Users },
  { href: "/employer/company", label: "Settings", Icon: Settings },
];

export function EmployerSubnav() {
  const pathname = usePathname() ?? "";
  return (
    <div className="border-b border-border bg-background">
      <nav
        aria-label="Employer sections"
        className="mx-auto flex w-full max-w-7xl items-center gap-1 overflow-x-auto px-4 md:px-8"
      >
        {TABS.map((t) => {
          const active = t.exact
            ? pathname === t.href
            : pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-small transition-colors",
                active
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <t.Icon
                className="size-4"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
