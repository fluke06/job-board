import Link from "next/link";
import { Briefcase } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { LogoutButton } from "@/components/logout-button";
import { buttonVariants } from "@/components/ui/button";

export async function Navbar() {
  const session = await getSession();
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, role: true },
      })
    : null;

  const navLinks: Array<{ href: string; label: string }> = [
    { href: "/jobs", label: "Browse jobs" },
    { href: "/companies", label: "Companies" },
    { href: "/for-employers", label: "For employers" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Briefcase className="size-5" aria-hidden="true" strokeWidth={1.75} />
          <span className="text-body-lg font-bold tracking-tight">JobBoard</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-small text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === Role.ADMIN ? (
                <Link
                  href="/admin"
                  className="hidden text-small text-muted-foreground hover:text-foreground sm:inline-flex"
                >
                  Admin
                </Link>
              ) : user.role === Role.EMPLOYER ? (
                <Link
                  href="/employer"
                  className="hidden text-small text-muted-foreground hover:text-foreground sm:inline-flex"
                >
                  Employer
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="hidden text-small text-muted-foreground hover:text-foreground sm:inline-flex"
                >
                  Dashboard
                </Link>
              )}
              <span className="hidden text-small text-muted-foreground sm:inline">
                {user.name}
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
                className={buttonVariants({ size: "default" })}
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
