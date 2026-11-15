import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { buildPlanTasks } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

const onboardingSchema = z.object({
  examLevelId: z.string().min(1).max(64),
  currentProficiency: z.enum(["beginner", "elementary", "intermediate", "advanced"]),
  examDate: z.iso.date(),
  dailyStudyMinutes: z.number().int().min(20).max(180),
  preferredDays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  schedulePreference: z.enum(["morning", "afternoon", "evening", "flexible"]),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to save your study plan." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your onboarding choices." }, { status: 400 });
  }

  const today = new Date();
  const examDate = new Date(`${parsed.data.examDate}T00:00:00.000Z`);
  const daysUntilExam = Math.floor((examDate.getTime() - Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())) / 86_400_000);
  if (daysUntilExam < 1 || daysUntilExam > 730) {
    return NextResponse.json({ error: "Choose an exam date within the next two years." }, { status: 400 });
  }

  const level = await prisma.examLevel.findUnique({
    where: { id: parsed.data.examLevelId },
    include: {
      exam: true,
      sections: { orderBy: { sortOrder: "asc" } },
      modules: { include: { lessons: { where: { published: true }, orderBy: { createdAt: "asc" } } } },
    },
  });
  if (!level) return NextResponse.json({ error: "That exam level is no longer available." }, { status: 404 });

  const lessons = level.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, skill: module.skill })),
  );
  const tasks = buildPlanTasks({
    startDate: today,
    examDate,
    dailyMinutes: parsed.data.dailyStudyMinutes,
    preferredDays: [...new Set(parsed.data.preferredDays)],
    sections: level.sections,
    lessons,
  });
  if (!tasks.length) return NextResponse.json({ error: "No study sessions fit those availability settings." }, { status: 400 });

  const plan = await prisma.$transaction(async (tx) => {
    await tx.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        preferredLanguage: level.exam.language,
        targetLevelId: level.id,
        currentProficiency: parsed.data.currentProficiency,
        examDate,
        dailyStudyMinutes: parsed.data.dailyStudyMinutes,
        preferredDays: [...new Set(parsed.data.preferredDays)],
        schedulePreference: parsed.data.schedulePreference,
        onboardingComplete: true,
      },
      create: {
        userId: session.user.id,
        preferredLanguage: level.exam.language,
        targetLevelId: level.id,
        currentProficiency: parsed.data.currentProficiency,
        examDate,
        dailyStudyMinutes: parsed.data.dailyStudyMinutes,
        preferredDays: [...new Set(parsed.data.preferredDays)],
        schedulePreference: parsed.data.schedulePreference,
        onboardingComplete: true,
      },
    });
    await tx.studyPlan.updateMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      data: { status: "ARCHIVED" },
    });
    return tx.studyPlan.create({
      data: {
        userId: session.user.id,
        examLevelId: level.id,
        startsAt: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())),
        examDate,
        dailyMinutes: parsed.data.dailyStudyMinutes,
        generationInputs: {
          currentProficiency: parsed.data.currentProficiency,
          preferredDays: [...new Set(parsed.data.preferredDays)],
          schedulePreference: parsed.data.schedulePreference,
          sectionCodes: level.sections.map((section) => section.code),
          planVersion: "1",
        },
        tasks: {
          create: tasks.map((task) => ({
            date: task.date,
            lessonId: task.lessonId,
            title: task.title,
            description: task.description,
            skill: task.skill,
            estimatedMinutes: task.estimatedMinutes,
            sortOrder: task.sortOrder,
          })),
        },
      },
      select: { id: true, examDate: true, _count: { select: { tasks: true } } },
    });
  });

  return NextResponse.json({
    ok: true,
    plan: {
      id: plan.id,
      examDate: plan.examDate.toISOString(),
      taskCount: plan._count.tasks,
    },
  }, { status: 201 });
}
