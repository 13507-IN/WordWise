import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TutorChat } from "@/components/tutor-chat";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TutorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    include: { targetLevel: { include: { exam: true } } },
  });
  if (!profile?.targetLevel) redirect("/onboarding");

  return (
    <div className="student-page">
      <div className="app-title-row">
        <div>
          <p className="eyebrow">{profile.targetLevel.exam.name} · {profile.targetLevel.code}</p>
          <h1>AI language tutor</h1>
          <p className="page-intro">Ask for explanations or original practice tailored to your target exam. AI guidance is not official exam advice.</p>
        </div>
      </div>
      <TutorChat
        examName={profile.targetLevel.exam.name}
        examCode={profile.targetLevel.exam.code}
        level={profile.targetLevel.code}
      />
    </div>
  );
}
