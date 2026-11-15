import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const exams = await prisma.exam.findMany({
    include: {
      levels: {
        orderBy: { sortOrder: "asc" },
        include: { sections: { orderBy: { sortOrder: "asc" } } },
      },
    },
    orderBy: { code: "asc" },
  });
  return NextResponse.json(exams);
}
