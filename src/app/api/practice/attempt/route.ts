import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const answerSchema = z.object({
  questionId: z.string().min(1).max(64),
  selectedOptionId: z.string().min(1).max(64),
  elapsedSeconds: z.number().int().min(0).max(3600).default(0),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to submit practice answers." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = answerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose an answer before submitting." }, { status: 400 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { targetLevelId: true },
  });
  if (!profile?.targetLevelId) {
    return NextResponse.json({ error: "Finish onboarding before starting practice." }, { status: 409 });
  }

  const question = await prisma.question.findFirst({
    where: { id: parsed.data.questionId, examLevelId: profile.targetLevelId },
    select: {
      id: true,
      explanation: true,
      options: { select: { id: true, label: true, isCorrect: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!question) {
    return NextResponse.json({ error: "That question is not available for your target exam." }, { status: 404 });
  }

  const selected = question.options.find((option) => option.id === parsed.data.selectedOptionId);
  if (!selected) {
    return NextResponse.json({ error: "That answer choice does not belong to this question." }, { status: 400 });
  }

  const correctOption = question.options.find((option) => option.isCorrect);
  const isCorrect = selected.isCorrect;
  await prisma.questionAttempt.create({
    data: {
      userId: session.user.id,
      questionId: question.id,
      selectedOptionId: selected.id,
      isCorrect,
      elapsedSeconds: parsed.data.elapsedSeconds,
    },
  });

  return NextResponse.json({
    isCorrect,
    explanation: question.explanation,
    correctAnswer: correctOption ? { id: correctOption.id, label: correctOption.label } : null,
  });
}
