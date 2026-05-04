import Link from "next/link";
import { Briefcase } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { LogoutButton } from "@/components/logout-button";
import { buttonVariants } from "@/components/ui/button";

type NavLink = { href: string; label: string };

const GUEST_LINKS: NavLink[] = [
  { href: "/jobs", label: "Browse jobs" },
  { href: "/companies", label: "Companies" },
  { href: "/for-employers", label: "For employers" },
];

const APPLICANT_LINKS: NavLink[] = [
  { href: "/jobs", label: "Browse jobs" },
  { href: "/companies", label: "Companies" },
  { href: "/dashboard", label: "Dashboard" },
];

const EMPLOYER_LINKS: NavLink[] = [
  { href: "/employer", label: "Dashboard" },
  { href: "/jobs", label: "Browse jobs" },
  { href: "/companies", label: "Companies" },
];

const ADMIN_LINKS: NavLink[] = [
  { href: "/employer", label: "Dashboard" },
  { href: "/jobs", label: "Browse jobs" },
  { href: "/companies", label: "Companies" },
];

export async function Navbar() {
  const session = await getSession();
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, role: true },
      })
    : null;

  const links: NavLink[] = !user
    ? GUEST_LINKS
    : user.role === Role.ADMIN
      ? ADMIN_LINKS
      : user.role === Role.EMPLOYER
        ? EMPLOYER_LINKS
        : APPLICANT_LINKS;

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-foreground bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 md:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 transition-opacity hover:opacity-90"
        >
          <span className="flex size-8 items-center justify-center rounded-md border-2 border-foreground bg-gradient-to-br from-brand to-brand-strong text-brand-foreground shadow-[2px_2px_0_var(--foreground)] transition-transform group-hover:scale-105">
            <Briefcase className="size-4" aria-hidden="true" strokeWidth={2.5} />
          </span>
          <span className="text-body-lg font-bold tracking-tight">
            JobBoard
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative rounded-md px-3 py-2 text-small font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-small font-medium text-muted-foreground sm:inline">
                {user.name.split(" ")[0]}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "default" })}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className={`${buttonVariants({ size: "default" })} border-2 border-foreground shadow-[2px_2px_0_var(--foreground)] transition-transform hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_var(--foreground)]`}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
