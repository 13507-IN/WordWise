import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ attemptId: string }> };

export async function POST(_request: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to submit your mock exam." }, { status: 401 });
  const { attemptId } = await params;
  const attempt = await prisma.mockAttempt.findFirst({
    where: { id: attemptId, userId: session.user.id },
    include: {
      mockExam: {
        include: {
          questions: {
            orderBy: { sortOrder: "asc" },
            include: { question: { include: { options: { select: { id: true, isCorrect: true } } } } },
          },
        },
      },
      answers: true,
    },
  });
  if (!attempt) return NextResponse.json({ error: "Mock exam attempt not found." }, { status: 404 });
  if (attempt.status === "SUBMITTED") return NextResponse.json({ ok: true, score: attempt.score });
  if (attempt.status !== "IN_PROGRESS") return NextResponse.json({ error: "This mock exam cannot be submitted." }, { status: 409 });

  const answerByQuestion = new Map(attempt.answers.map((answer) => [answer.questionId, answer]));
  let correctCount = 0;
  const evaluatedAnswers = attempt.mockExam.questions.map(({ question }) => {
    const answer = answerByQuestion.get(question.id);
    const correctOption = question.options.find((option) => option.isCorrect);
    const isCorrect = Boolean(answer?.selectedOptionId && answer.selectedOptionId === correctOption?.id);
    if (isCorrect) correctCount += 1;
    return { questionId: question.id, answerId: answer?.id, isCorrect };
  });
  const score = attempt.mockExam.questions.length
    ? Math.round((correctCount / attempt.mockExam.questions.length) * 100)
    : 0;

  await prisma.$transaction(async (tx) => {
    for (const result of evaluatedAnswers) {
      if (result.answerId) {
        await tx.mockAnswer.update({ where: { id: result.answerId }, data: { isCorrect: result.isCorrect } });
      }
    }
    await tx.mockAttempt.update({
      where: { id: attempt.id },
      data: { status: "SUBMITTED", submittedAt: new Date(), score },
    });
  });
  return NextResponse.json({ ok: true, score });
}
