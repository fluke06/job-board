import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/site-shell";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  if (!user) redirect("/login");
  if (user.role === Role.ADMIN) redirect("/admin");
  if (user.role === Role.EMPLOYER) redirect("/employer");

  return <SiteShell>{children}</SiteShell>;
}
