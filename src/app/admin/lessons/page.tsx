import { prisma } from "@/lib/prisma";
import { LessonManager } from "@/components/admin/lesson-manager";

export const dynamic = "force-dynamic";

export default async function AdminLessonsPage() {
  const modules = await prisma.learningModule.findMany({
    include: {
      exam: { select: { code: true, name: true } },
      examLevel: { select: { id: true, code: true, name: true } },
      lessons: {
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          difficulty: true,
          estimatedMinutes: true,
          published: true,
          _count: { select: { questions: true, progress: true } },
        },
        orderBy: { slug: "asc" },
      },
    },
    orderBy: [{ examId: "asc" }, { sortOrder: "asc" }],
  });

  return <LessonManager initialModules={modules} />;
}
