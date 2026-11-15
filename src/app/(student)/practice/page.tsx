import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PracticeSession, type PracticeQuestionData } from "@/components/practice-session";
import { jsonText } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ skill?: string }> };

const skillLabels: Record<string, string> = {
  VOCABULARY: "Vocabulary",
  GRAMMAR: "Grammar",
  READING: "Reading",
  LISTENING: "Listening",
  WRITING: "Writing",
  SPEAKING: "Speaking",
  INTEGRATED: "Integrated",
};

export default async function PracticePage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const params = await searchParams;
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    include: { targetLevel: { include: { exam: true, sections: { orderBy: { sortOrder: "asc" } } } } },
  });
  if (!profile?.targetLevel) redirect("/onboarding");

  const allowedSkills = new Set(profile.targetLevel.sections.map((section) => section.skill));
  const skill = params.skill && allowedSkills.has(params.skill as (typeof profile.targetLevel.sections)[number]["skill"])
    ? params.skill
    : undefined;

  const questions = await prisma.question.findMany({
    where: {
      examLevelId: profile.targetLevel.id,
      ...(skill ? { skill: skill as (typeof profile.targetLevel.sections)[number]["skill"] } : {}),
    },
    orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
    include: { options: { orderBy: { sortOrder: "asc" } } },
  });

  const data: PracticeQuestionData[] = questions.map((question) => {
    const prompt = jsonText(question.prompt);
    const context = jsonText(question.prompt, "context");
    return {
      id: question.id,
      skill: question.skill,
      prompt,
      context,
      options: question.options.map((option) => ({
        id: option.id,
        label: option.label,
        text: jsonText(option.content),
      })),
    };
  });

  return (
    <div className="student-page">
      <div className="app-title-row">
        <div>
          <p className="eyebrow">{profile.targetLevel.exam.name} · {profile.targetLevel.code}</p>
          <h1>Practice with purpose</h1>
          <p className="page-intro">Short, exam-aligned questions. Your answers update your performance history.</p>
        </div>
        <Link className="button button-secondary" href="/mocks">Try a mock exam</Link>
      </div>

      <div className="practice-filter-row" aria-label="Practice skill filters">
        <Link className={`practice-filter${!skill ? " active" : ""}`} href="/practice">All skills</Link>
        {profile.targetLevel.sections.map((section) => (
          <Link
            className={`practice-filter${skill === section.skill ? " active" : ""}`}
            href={`/practice?skill=${section.skill}`}
            key={section.id}
          >
            {section.name}
          </Link>
        ))}
      </div>

      <PracticeSession questions={data} skillLabels={skillLabels} />
    </div>
  );
}
