import { prisma } from "@/lib/prisma";

export const examCodes = ["JLPT", "DELE", "DALF"] as const;

export async function getExams() {
  return prisma.exam.findMany({
    include: {
      levels: {
        orderBy: { sortOrder: "asc" },
        include: { sections: { orderBy: { sortOrder: "asc" } } },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getExam(code: string) {
  const normalizedCode = code.toUpperCase();
  if (!examCodes.includes(normalizedCode as (typeof examCodes)[number])) {
    return null;
  }

  return prisma.exam.findUnique({
    where: { code: normalizedCode },
    include: {
      levels: {
        orderBy: { sortOrder: "asc" },
        include: { sections: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
}
