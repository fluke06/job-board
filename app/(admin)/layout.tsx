import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/logger";
import { EmployerSidebar } from "@/components/employer-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, role: true },
  });
  if (!user || user.role !== Role.ADMIN) {
    logEvent("rbac.denied", { scope: "admin-layout", userId: session.userId });
    redirect("/");
  }

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <EmployerSidebar
        companyName="Platform admin"
        userName={user.name}
        role="admin"
      />
      <div className="flex-1 md:ml-60">
        <main id="main" className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
