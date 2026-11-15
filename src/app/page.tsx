import { LandingContent } from "@/components/landing-content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const exams = await prisma.exam.findMany({
    include: {
      levels: {
        orderBy: { sortOrder: "asc" },
        include: { sections: { orderBy: { sortOrder: "asc" } } },
      },
    },
    orderBy: { code: "asc" },
  });
  const sample = await prisma.question.findFirst({
    where: { examLevel: { exam: { code: "JLPT" }, code: "N5" }, isOfficial: false },
    orderBy: { slug: "asc" },
    include: {
      examLevel: { include: { exam: true } },
      options: { orderBy: { sortOrder: "asc" }, select: { id: true, content: true } },
    },
  });

  const featuredQuestion = sample
    ? {
        examName: sample.examLevel.exam.name,
        levelCode: sample.examLevel.code,
        prompt: typeof sample.prompt === "object" && sample.prompt !== null && "text" in sample.prompt
          ? String(sample.prompt.text)
          : "Choose the best answer.",
        options: sample.options.map((option) => ({
          id: option.id,
          text: typeof option.content === "object" && option.content !== null && "text" in option.content
            ? String(option.content.text)
            : "Practice option",
        })),
      }
    : null;

  return <LandingContent exams={exams} featuredQuestion={featuredQuestion} />;
}
