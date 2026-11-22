import { prisma } from "@/lib/prisma";
import { UserManager } from "@/components/admin/user-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      profile: {
        select: {
          preferredLanguage: true,
          onboardingComplete: true,
          targetLevel: {
            select: {
              code: true,
              exam: { select: { code: true, name: true } },
            },
          },
        },
      },
      studyPlans: {
        select: {
          id: true,
          status: true,
          examDate: true,
          dailyMinutes: true,
        },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          questionAttempts: true,
          mockAttempts: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <UserManager
      initialUsers={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
        profile: u.profile,
        studyPlans: u.studyPlans.map((p) => ({
          id: p.id,
          status: p.status,
          examDate: p.examDate.toISOString(),
          dailyMinutes: p.dailyMinutes,
        })),
        _count: u._count,
      }))}
    />
  );
}
