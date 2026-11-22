import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminAccessGuard } from "@/components/admin/admin-access-guard";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    return (
      <AdminAccessGuard
        email={session.user.email ?? "unknown@user"}
        currentRole={session.user.role || "STUDENT"}
      />
    );
  }

  return (
    <AdminShell
      name={session.user.name?.trim() || "Administrator"}
      email={session.user.email ?? ""}
    >
      {children}
    </AdminShell>
  );
}
