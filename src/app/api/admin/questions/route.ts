import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SkillType } from "@/generated/prisma/client";

const createQuestionSchema = z.object({
  examLevelId: z.string().min(1),
  skill: z.enum(SkillType),
  prompt: z.string().trim().min(3).max(2000),
  context: z.string().trim().max(3000).optional(),
  options: z.array(z.string().trim().min(1).max(500)).min(2).max(6),
  answerIndex: z.number().int().min(0),
  explanation: z.string().trim().min(3).max(3000),
  difficulty: z.number().int().min(1).max(5).default(1),
  isOfficial: z.boolean().default(false),
});

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const examCode = searchParams.get("exam");
  const levelId = searchParams.get("levelId");
  const skill = searchParams.get("skill");
  const search = searchParams.get("search")?.trim().toLowerCase();

  const whereClause: Record<string, unknown> = {};

  if (levelId) {
    whereClause.examLevelId = levelId;
  } else if (examCode) {
    whereClause.examLevel = { exam: { code: examCode } };
  }

  if (skill && Object.values(SkillType).includes(skill as SkillType)) {
    whereClause.skill = skill as SkillType;
  }

  try {
    const questions = await prisma.question.findMany({
      where: whereClause,
      include: {
        examLevel: {
          include: { exam: { select: { code: true, name: true } } },
        },
        options: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const filtered = search
      ? questions.filter((q) => {
          const promptText =
            typeof q.prompt === "object" && q.prompt !== null && "text" in q.prompt
              ? String(q.prompt.text).toLowerCase()
              : "";
          const explText = q.explanation.toLowerCase();
          return promptText.includes(search) || explText.includes(search);
        })
      : questions;

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
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

  const parsed = createQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid question data" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  if (data.answerIndex >= data.options.length) {
    return NextResponse.json(
      { error: "Correct answer index must be within options range" },
      { status: 400 }
    );
  }

  try {
    const level = await prisma.examLevel.findUnique({
      where: { id: data.examLevelId },
      include: { exam: true },
    });

    if (!level) {
      return NextResponse.json({ error: "Selected exam level does not exist" }, { status: 404 });
    }

    const slug = `${level.exam.code.toLowerCase()}-${level.code.toLowerCase()}-${Date.now().toString(36)}`;

    const question = await prisma.question.create({
      data: {
        slug,
        examLevelId: data.examLevelId,
        skill: data.skill,
        type: "SINGLE_CHOICE",
        prompt: {
          text: data.prompt,
          ...(data.context ? { context: data.context } : {}),
        },
        explanation: data.explanation,
        difficulty: data.difficulty,
        sourceLabel: data.isOfficial ? "Official syllabus reference" : "Original LinguaCamp practice",
        isOfficial: data.isOfficial,
        options: {
          create: data.options.map((opt, idx) => ({
            label: String.fromCharCode(65 + idx),
            content: { text: opt },
            sortOrder: idx + 1,
            isCorrect: idx === data.answerIndex,
          })),
        },
      },
      include: {
        examLevel: { include: { exam: true } },
        options: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Failed to create question:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}

const updateQuestionSchema = z.object({
  id: z.string().min(1),
  examLevelId: z.string().min(1).optional(),
  skill: z.enum(SkillType).optional(),
  prompt: z.string().trim().min(3).max(2000),
  context: z.string().trim().max(3000).optional().nullable(),
  options: z.array(z.string().trim().min(1).max(500)).min(2).max(6),
  answerIndex: z.number().int().min(0),
  explanation: z.string().trim().min(3).max(3000),
  difficulty: z.number().int().min(1).max(5).default(1),
  isOfficial: z.boolean().default(false),
});

export async function PUT(request: Request) {
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

  const parsed = updateQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid question data" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  if (data.answerIndex >= data.options.length) {
    return NextResponse.json(
      { error: "Correct answer index must be within options range" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.question.findUnique({
      where: { id: data.id },
      include: { options: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Atomic update of question and its options
    const updated = await prisma.$transaction(async (tx) => {
      // Delete old options
      await tx.questionOption.deleteMany({
        where: { questionId: data.id },
      });

      // Update question and create new options
      return tx.question.update({
        where: { id: data.id },
        data: {
          ...(data.examLevelId ? { examLevelId: data.examLevelId } : {}),
          ...(data.skill ? { skill: data.skill } : {}),
          prompt: {
            text: data.prompt,
            ...(data.context ? { context: data.context } : {}),
          },
          explanation: data.explanation,
          difficulty: data.difficulty,
          isOfficial: data.isOfficial,
          options: {
            create: data.options.map((opt, idx) => ({
              label: String.fromCharCode(65 + idx),
              content: { text: opt },
              sortOrder: idx + 1,
              isCorrect: idx === data.answerIndex,
            })),
          },
        },
        include: {
          examLevel: { include: { exam: true } },
          options: { orderBy: { sortOrder: "asc" } },
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update question:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
  }

  try {
    await prisma.question.delete({
      where: { id },
    });
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("Failed to delete question:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
