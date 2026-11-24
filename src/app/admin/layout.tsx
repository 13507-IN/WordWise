import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // If not authenticated or not flagged as ADMIN in the database, return 404 (hidden)
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    notFound();
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
