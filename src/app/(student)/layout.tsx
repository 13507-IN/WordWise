import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { onboardingComplete: true },
  });
  if (!profile?.onboardingComplete) redirect("/onboarding");

  return (
    <AppShell
      name={session.user.name?.trim() || "Student"}
      email={session.user.email ?? ""}
      role={session.user.role}
    >
      {children}
    </AppShell>
  );
}
