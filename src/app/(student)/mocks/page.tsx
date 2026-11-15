import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MockExamList, type MockExamCardData } from "@/components/mock-exam-list";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MocksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    include: { targetLevel: { include: { exam: true } } },
  });
  if (!profile?.targetLevel) redirect("/onboarding");

  const mocks = await prisma.mockExam.findMany({
    where: { examLevelId: profile.targetLevel.id },
    orderBy: [{ mode: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { questions: true } } },
  });
  const data: MockExamCardData[] = mocks.map((mock) => ({
    id: mock.id,
    title: mock.title,
    mode: mock.mode,
    durationMinutes: mock.durationMinutes,
    questionCount: mock._count.questions,
    isSample: mock.isSample,
  }));

  return (
    <div className="student-page">
      <div className="app-title-row">
        <div>
          <p className="eyebrow">{profile.targetLevel.exam.name} · {profile.targetLevel.code}</p>
          <h1>Mock examinations</h1>
          <p className="page-intro">Practise under a timer, save answers as you go, then review your score and explanations.</p>
        </div>
      </div>
      <MockExamList mocks={data} />
    </div>
  );
}
