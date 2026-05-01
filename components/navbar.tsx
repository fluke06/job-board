import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { LogoutButton } from "@/components/logout-button";

export async function Navbar() {
  const session = await getSession();
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, role: true },
      })
    : null;

  return (
    <nav className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="font-semibold text-lg">
          JobBoard
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/jobs" className="hover:underline">
            Jobs
          </Link>
          {user ? (
            <>
              {user.role === Role.ADMIN ? (
                <Link href="/admin" className="hover:underline">
                  Admin
                </Link>
              ) : (
                <Link href="/dashboard" className="hover:underline">
                  Dashboard
                </Link>
              )}
              <span className="text-muted-foreground">{user.name}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-foreground text-background px-3 py-1.5 hover:opacity-90"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
