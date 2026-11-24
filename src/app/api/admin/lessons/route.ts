import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createLessonSchema = z.object({
  moduleId: z.string().min(1),
  title: z.string().trim().min(3).max(120),
  summary: z.string().trim().min(5).max(400),
  content: z.string().trim().min(10).max(10000),
  difficulty: z.number().int().min(1).max(5).default(1),
  estimatedMinutes: z.number().int().min(5).max(120).default(20),
  learningObjectives: z.array(z.string().trim().min(2)).min(1).max(6),
  published: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  try {
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

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Failed to fetch lessons:", error);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createLessonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid lesson data" },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const learningModule = await prisma.learningModule.findUnique({
      where: { id: data.moduleId },
      include: { exam: true, examLevel: true },
    });

    if (!learningModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const baseSlug = `${learningModule.exam.code.toLowerCase()}-${learningModule.examLevel.code.toLowerCase()}-${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const lesson = await prisma.lesson.create({
      data: {
        moduleId: data.moduleId,
        slug,
        title: data.title,
        summary: data.summary,
        body: { markdown: data.content },
        difficulty: data.difficulty,
        estimatedMinutes: data.estimatedMinutes,
        learningObjectives: data.learningObjectives,
        published: data.published,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Failed to create lesson:", error);
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}
