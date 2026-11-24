import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
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
