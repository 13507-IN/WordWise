import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";

const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.nativeEnum(UserRole),
});

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            preferredLanguage: true,
            onboardingComplete: true,
            targetLevel: {
              select: {
                code: true,
                exam: { select: { code: true, name: true } },
              },
            },
          },
        },
        studyPlans: {
          select: {
            id: true,
            status: true,
            examDate: true,
            dailyMinutes: true,
          },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            questionAttempts: true,
            mockAttempts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid role data" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id: parsed.data.userId },
      data: { role: parsed.data.role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update user role:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
