import { prisma } from "@/lib/prisma";
import { QuestionManager } from "@/components/admin/question-manager";

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
  const [questions, levels] = await Promise.all([
    prisma.question.findMany({
      include: {
        examLevel: {
          include: { exam: { select: { code: true, name: true } } },
        },
        options: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.examLevel.findMany({
      include: {
        exam: { select: { code: true, name: true } },
      },
      orderBy: [{ examId: "asc" }, { sortOrder: "asc" }],
    }),
  ]);

  return (
    <QuestionManager
      initialQuestions={questions}
      levels={levels.map((lvl) => ({
        id: lvl.id,
        code: lvl.code,
        name: lvl.name,
        exam: {
          code: lvl.exam.code,
          name: lvl.exam.name,
        },
      }))}
    />
  );
}
