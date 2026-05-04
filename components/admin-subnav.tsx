"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  FileText,
  LayoutGrid,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Overview", Icon: LayoutGrid, exact: true },
  { href: "/admin/users", label: "Users", Icon: Users },
  { href: "/admin/companies", label: "Companies", Icon: Building2 },
  { href: "/admin/jobs", label: "Jobs", Icon: Briefcase },
  { href: "/admin/applications", label: "Applications", Icon: FileText },
];

export function AdminSubnav() {
  const pathname = usePathname() ?? "";
  return (
    <div className="border-b-2 border-foreground bg-background">
      <nav
        aria-label="Admin sections"
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
                "inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-small transition-colors -mb-[2px]",
                active
                  ? "border-foreground font-semibold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <t.Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
