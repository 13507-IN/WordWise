import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ mockExamId: z.string().min(1).max(64) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to start a mock exam." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Select a mock exam to begin." }, { status: 400 });

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { targetLevelId: true },
  });
  if (!profile?.targetLevelId) {
    return NextResponse.json({ error: "Finish onboarding before starting a mock exam." }, { status: 409 });
  }

  const mockExam = await prisma.mockExam.findFirst({
    where: { id: parsed.data.mockExamId, examLevelId: profile.targetLevelId },
    select: { id: true, questions: { select: { questionId: true } } },
  });
  if (!mockExam || mockExam.questions.length === 0) {
    return NextResponse.json({ error: "This mock exam is not available for your target level." }, { status: 404 });
  }

  const attempt = await prisma.mockAttempt.create({
    data: { userId: session.user.id, mockExamId: mockExam.id },
    select: { id: true },
  });
  return NextResponse.json({ attemptId: attempt.id }, { status: 201 });
}
