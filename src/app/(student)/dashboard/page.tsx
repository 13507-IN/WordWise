import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardContent, type DashboardData } from "@/components/dashboard-content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function dateOnly(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(date);
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: {
      targetLevel: {
        include: {
          exam: true,
          sections: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });
  if (!profile?.targetLevel || !profile.examDate) redirect("/onboarding");
  const examLevelId = profile.targetLevel.id;

  const plan = await prisma.studyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: {
      tasks: {
        orderBy: [{ date: "asc" }, { sortOrder: "asc" }],
        select: { id: true, title: true, description: true, skill: true, estimatedMinutes: true, date: true, status: true, lessonId: true, completedAt: true },
      },
    },
  });

  const [attempts, mockAttempts, completedLessons] = await Promise.all([
    prisma.questionAttempt.findMany({
      where: { userId, question: { examLevelId } },
      orderBy: { attemptedAt: "desc" },
      take: 1000,
      select: { isCorrect: true, attemptedAt: true, question: { select: { skill: true } } },
    }),
    prisma.mockAttempt.findMany({
      where: { userId, status: "SUBMITTED" },
      orderBy: { submittedAt: "desc" },
      take: 5,
      select: { id: true, score: true, submittedAt: true, mockExam: { select: { title: true } } },
    }),
    prisma.lessonProgress.count({
      where: { userId, lesson: { module: { examLevelId } } },
    }),
  ]);

  const today = dateOnly(new Date());
  const todayKey = today.toISOString().slice(0, 10);
  const todayTasks = plan?.tasks.filter((task) => task.date.toISOString().slice(0, 10) === todayKey) ?? [];
  const futureTasks = plan?.tasks.filter((task) => task.date > today && task.status !== "COMPLETED").slice(0, 4) ?? [];
  const completedTasks = plan?.tasks.filter((task) => task.status === "COMPLETED").length ?? 0;
  const totalTasks = plan?.tasks.length ?? 0;
  const answered = attempts.filter((attempt) => attempt.isCorrect !== null);
  const correct = answered.filter((attempt) => attempt.isCorrect).length;
  const accuracy = answered.length ? correct / answered.length : null;
  const taskRatio = totalTasks ? completedTasks / totalTasks : 0;
  const readiness = Math.round((taskRatio * (accuracy === null ? 1 : 0.6)) * 100 + (accuracy === null ? 0 : accuracy * 40));
  const averageMockScore = mockAttempts.length
    ? Math.round(mockAttempts.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0) / mockAttempts.length)
    : null;

  const completedDates = new Set(
    plan?.tasks
      .filter((task) => task.status === "COMPLETED" && task.completedAt)
      .map((task) => dateOnly(task.completedAt!).toISOString().slice(0, 10)) ?? [],
  );
  let studyStreak = 0;
  const streakCursor = new Date(today);
  if (!completedDates.has(streakCursor.toISOString().slice(0, 10))) {
    streakCursor.setUTCDate(streakCursor.getUTCDate() - 1);
  }
  while (completedDates.has(streakCursor.toISOString().slice(0, 10))) {
    studyStreak += 1;
    streakCursor.setUTCDate(streakCursor.getUTCDate() - 1);
  }

  const skills = new Map<string, { total: number; correct: number }>();
  for (const attempt of answered) {
    const stats = skills.get(attempt.question.skill) ?? { total: 0, correct: 0 };
    stats.total += 1;
    if (attempt.isCorrect) stats.correct += 1;
    skills.set(attempt.question.skill, stats);
  }
  const sections = profile.targetLevel.sections.map((section) => {
    const stats = skills.get(section.skill);
    return {
      name: section.name,
      score: stats?.total ? Math.round((stats.correct / stats.total) * 100) : null,
    };
  });
  const weakTopics = [...skills.entries()]
    .map(([skill, result]) => ({ skill, correct: result.correct, total: result.total }))
    .sort((a, b) => a.correct / a.total - b.correct / b.total)
    .slice(0, 3);

  const data: DashboardData = {
    name: session.user.name?.trim() || "Student",
    examName: profile.targetLevel.exam.name,
    examCode: profile.targetLevel.exam.code,
    levelCode: profile.targetLevel.code,
    examDate: formatDate(profile.examDate),
    daysRemaining: Math.max(0, Math.ceil((dateOnly(profile.examDate).getTime() - today.getTime()) / 86_400_000)),
    readiness: Math.max(0, Math.min(100, readiness)),
    studyStreak,
    completedLessons,
    completedTasks,
    totalTasks,
    mockCount: mockAttempts.length,
    averageMockScore,
    sections,
    todayTasks: todayTasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      skill: task.skill,
      estimatedMinutes: task.estimatedMinutes,
      completed: task.status === "COMPLETED",
    })),
    nextTasks: futureTasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: `${formatDate(task.date)} · ${task.description}`,
      skill: task.skill,
      estimatedMinutes: task.estimatedMinutes,
      date: task.date.toISOString(),
      completed: task.status === "COMPLETED",
    })),
    weakTopics,
    recentMocks: mockAttempts.map((attempt) => ({
      id: attempt.id,
      title: attempt.mockExam.title,
      score: attempt.score === null ? null : Math.round(attempt.score),
      date: attempt.submittedAt ? formatDate(attempt.submittedAt) : "Submitted",
    })),
  };

  return <DashboardContent data={data} />;
}
