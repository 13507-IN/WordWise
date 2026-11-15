import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ taskId: string }> };

export async function PATCH(_request: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to update your study plan." }, { status: 401 });
  const { taskId } = await params;

  const task = await prisma.dailyTask.findFirst({
    where: { id: taskId, plan: { userId: session.user.id, status: "ACTIVE" } },
    select: { id: true, lessonId: true, status: true },
  });
  if (!task) return NextResponse.json({ error: "Study task not found." }, { status: 404 });
  if (task.status === "COMPLETED") return NextResponse.json({ ok: true });

  await prisma.$transaction(async (tx) => {
    await tx.dailyTask.update({
      where: { id: task.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    if (task.lessonId) {
      await tx.lessonProgress.upsert({
        where: { userId_lessonId: { userId: session.user.id, lessonId: task.lessonId } },
        update: { completedAt: new Date() },
        create: { userId: session.user.id, lessonId: task.lessonId },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
