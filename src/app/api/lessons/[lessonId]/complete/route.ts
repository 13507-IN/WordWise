import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ lessonId: string }> };

export async function POST(_request: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to record lesson progress." }, { status: 401 });
  const { lessonId } = await params;
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { targetLevelId: true },
  });
  if (!profile?.targetLevelId) return NextResponse.json({ error: "Finish onboarding first." }, { status: 409 });

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, published: true, module: { examLevelId: profile.targetLevelId } },
    select: { id: true },
  });
  if (!lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId: lesson.id } },
    update: { completedAt: new Date() },
    create: { userId: session.user.id, lessonId: lesson.id },
  });
  return NextResponse.json({ ok: true });
}
