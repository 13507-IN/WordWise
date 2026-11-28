import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { MockExamRunner, type MockQuestionData } from "@/components/mock-exam-runner";
import { jsonText } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ attemptId: string }> };

export default async function MockAttemptPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { attemptId } = await params;
  const attempt = await prisma.mockAttempt.findFirst({
    where: { id: attemptId, userId: session.user.id },
    include: {
      mockExam: {
        include: {
          examLevel: { include: { exam: true } },
          questions: {
            orderBy: { sortOrder: "asc" },
            include: { question: { include: { options: { orderBy: { sortOrder: "asc" } } } } },
          },
        },
      },
      answers: true,
    },
  });
  if (!attempt) notFound();
  if (attempt.status === "SUBMITTED") redirect(`/mocks/${attempt.id}/results`);
  if (attempt.status !== "IN_PROGRESS") redirect("/mocks");

  const questions: MockQuestionData[] = attempt.mockExam.questions.map(({ question }) => ({
    id: question.id,
    skill: question.skill,
    prompt: jsonText(question.prompt),
    context: jsonText(question.prompt, "context"),
    options: question.options.map((option) => ({
      id: option.id,
      label: option.label,
      text: jsonText(option.content),
    })),
  }));
  const answers = Object.fromEntries(attempt.answers.map((answer) => [
    answer.questionId,
    { selectedOptionId: answer.selectedOptionId, markedForReview: answer.markedForReview },
  ]));

  return (
    <MockExamRunner
      attemptId={attempt.id}
      title={attempt.mockExam.title}
      examLabel={`${attempt.mockExam.examLevel.exam.name} · ${attempt.mockExam.examLevel.code}`}
      examCode={attempt.mockExam.examLevel.exam.code}
      durationSeconds={attempt.mockExam.durationMinutes * 60}
      startedAt={attempt.startedAt.toISOString()}
      questions={questions}
      initialAnswers={answers}
    />
  );
}
