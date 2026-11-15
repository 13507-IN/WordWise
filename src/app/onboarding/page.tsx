import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Brand } from "@/components/brand";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function OnboardingPage({ searchParams }: Props) {
  const [session, query] = await Promise.all([auth(), searchParams]);
  if (!session?.user?.id) redirect("/login");
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      targetLevelId: true,
      examDate: true,
      dailyStudyMinutes: true,
      currentProficiency: true,
      preferredDays: true,
      schedulePreference: true,
    },
  });
  const preferredDays = Array.isArray(profile?.preferredDays)
    ? profile.preferredDays.filter((day): day is number => typeof day === "number" && Number.isInteger(day) && day >= 0 && day <= 6)
    : undefined;

  return (
    <main className="onboarding-page">
      <div className="site-shell onboarding-header"><Brand /></div>
      <OnboardingWizard
        initialValues={{
          examLevelId: typeof query.examLevelId === "string" ? query.examLevelId : profile?.targetLevelId ?? undefined,
          examDate: typeof query.examDate === "string"
            ? query.examDate
            : profile?.examDate?.toISOString().slice(0, 10),
          dailyMinutes: typeof query.dailyMinutes === "string"
            ? query.dailyMinutes
            : profile?.dailyStudyMinutes?.toString(),
          proficiency: profile?.currentProficiency ?? undefined,
          preferredDays,
          schedulePreference: profile?.schedulePreference ?? undefined,
        }}
      />
    </main>
  );
}
