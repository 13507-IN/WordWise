import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ attemptId: string }> };
const schema = z.object({
  questionId: z.string().min(1).max(64),
  selectedOptionId: z.string().min(1).max(64).nullable(),
  markedForReview: z.boolean(),
});

export async function PUT(request: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to save your answers." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Check the answer and try again." }, { status: 400 });
  const { attemptId } = await params;

  const attempt = await prisma.mockAttempt.findFirst({
    where: { id: attemptId, userId: session.user.id, status: "IN_PROGRESS" },
    include: {
      mockExam: {
        select: {
          durationMinutes: true,
          questions: { where: { questionId: parsed.data.questionId }, select: { questionId: true } },
        },
      },
    },
  });
  if (!attempt) return NextResponse.json({ error: "Active mock exam not found." }, { status: 404 });
  const expiresAt = attempt.startedAt.getTime() + attempt.mockExam.durationMinutes * 60_000;
  if (Date.now() >= expiresAt) return NextResponse.json({ error: "Time is up. Submit your mock exam to see the result." }, { status: 410 });
  if (!attempt.mockExam.questions.length) {
    return NextResponse.json({ error: "That question is not part of this mock exam." }, { status: 400 });
  }
  if (parsed.data.selectedOptionId) {
    const option = await prisma.questionOption.findFirst({
      where: { id: parsed.data.selectedOptionId, questionId: parsed.data.questionId },
      select: { id: true },
    });
    if (!option) return NextResponse.json({ error: "That answer choice does not belong to this question." }, { status: 400 });
  }

  await prisma.mockAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId: parsed.data.questionId } },
    update: {
      selectedOptionId: parsed.data.selectedOptionId,
      markedForReview: parsed.data.markedForReview,
    },
    create: {
      attemptId,
      questionId: parsed.data.questionId,
      selectedOptionId: parsed.data.selectedOptionId,
      markedForReview: parsed.data.markedForReview,
    },
  });
  return NextResponse.json({ ok: true });
}
