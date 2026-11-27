import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SkillType } from "@/generated/prisma/client";

const questionItemSchema = z.object({
  examCode: z.string().trim().min(2),
  levelCode: z.string().trim().min(2),
  skill: z.enum(SkillType),
  prompt: z.string().trim().min(3).max(2000),
  context: z.string().trim().max(4000).optional(),
  options: z.array(z.string().trim().min(1).max(500)).min(2).max(6),
  answerIndex: z.number().int().min(0),
  explanation: z.string().trim().min(3).max(3000),
  difficulty: z.number().int().min(1).max(5).default(1),
  isOfficial: z.boolean().default(true),
});

const bulkImportSchema = z.object({
  questions: z.array(questionItemSchema).min(1).max(200),
});

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

  const parsed = bulkImportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid bulk import payload" },
      { status: 400 }
    );
  }

  const items = parsed.data.questions;

  try {
    // Pre-fetch all exam levels
    const levels = await prisma.examLevel.findMany({
      include: { exam: true },
    });

    const levelMap = new Map<string, string>();
    for (const lvl of levels) {
      const key = `${lvl.exam.code.toUpperCase()}-${lvl.code.toUpperCase()}`;
      levelMap.set(key, lvl.id);
    }

    let createdCount = 0;
    const errors: string[] = [];

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const key = `${item.examCode.toUpperCase()}-${item.levelCode.toUpperCase()}`;
        const examLevelId = levelMap.get(key);

        if (!examLevelId) {
          errors.push(`Item ${i + 1}: Unknown level ${key}`);
          continue;
        }

        if (item.answerIndex >= item.options.length) {
          errors.push(`Item ${i + 1}: Correct answer index out of bounds`);
          continue;
        }

        const slug = `${item.examCode.toLowerCase()}-${item.levelCode.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

        await tx.question.create({
          data: {
            slug,
            examLevelId,
            skill: item.skill,
            type: "SINGLE_CHOICE",
            prompt: {
              text: item.prompt,
              ...(item.context ? { context: item.context } : {}),
            },
            explanation: item.explanation,
            difficulty: item.difficulty,
            sourceLabel: item.isOfficial ? "Official syllabus specification" : "Original LinguaCamp practice",
            isOfficial: item.isOfficial,
            options: {
              create: item.options.map((opt, idx) => ({
                label: String.fromCharCode(65 + idx),
                content: { text: opt },
                sortOrder: idx + 1,
                isCorrect: idx === item.answerIndex,
              })),
            },
          },
        });

        createdCount++;
      }
    });

    return NextResponse.json({
      success: true,
      createdCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Bulk import failed:", error);
    return NextResponse.json({ error: "Failed to process bulk import" }, { status: 500 });
  }
}
