import type { ExamSection, SkillType } from "@/generated/prisma/client";

type PlanTask = {
  date: Date;
  lessonId?: string;
  title: string;
  description: string;
  skill: SkillType;
  estimatedMinutes: number;
  sortOrder: number;
};

const phaseNames = [
  "Foundation and diagnostic",
  "Core language knowledge",
  "Section-wise intensive practice",
  "Timed examination practice",
  "Full-length mock examinations",
  "Final revision",
];

function phaseFor(dayIndex: number, totalDays: number) {
  const progress = dayIndex / Math.max(totalDays, 1);
  if (progress < 0.1) return 0;
  if (progress < 0.35) return 1;
  if (progress < 0.65) return 2;
  if (progress < 0.82) return 3;
  if (progress < 0.92) return 4;
  return 5;
}

function utcDate(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function buildPlanTasks({
  startDate,
  examDate,
  dailyMinutes,
  preferredDays,
  sections,
  lessons,
}: {
  startDate: Date;
  examDate: Date;
  dailyMinutes: number;
  preferredDays: number[];
  sections: Pick<ExamSection, "skill" | "name">[];
  lessons: { id: string; title: string; skill: SkillType }[];
}): PlanTask[] {
  const start = utcDate(startDate);
  const end = utcDate(examDate);
  const totalDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1);
  const studyDays = new Set(preferredDays.length ? preferredDays : [1, 2, 3, 4, 5, 6]);
  const skills = [...new Set(sections.map((section) => section.skill))];
  const availableSkills = skills.length ? skills : (["VOCABULARY", "GRAMMAR", "READING", "LISTENING"] as SkillType[]);
  const tasks: PlanTask[] = [];
  let order = 0;

  for (let offset = 0; offset < totalDays; offset += 1) {
    const date = new Date(start.getTime() + offset * 86_400_000);
    if (!studyDays.has(date.getUTCDay())) continue;

    const phaseIndex = phaseFor(offset, totalDays);
    const phase = phaseNames[phaseIndex];
    const daySkill = availableSkills[(offset + phaseIndex) % availableSkills.length];
    const matchingLesson = lessons.find((lesson) => lesson.skill === daySkill) ?? lessons[offset % Math.max(lessons.length, 1)];
    const lessonMinutes = Math.max(8, Math.floor(dailyMinutes * 0.55));
    const practiceMinutes = Math.max(8, dailyMinutes - lessonMinutes);

    tasks.push({
      date,
      lessonId: matchingLesson?.id,
      title: matchingLesson?.title ?? `${daySkill[0]}${daySkill.slice(1).toLowerCase()} practice`,
      description: `${phase}: review one concept, then check your understanding.`,
      skill: daySkill,
      estimatedMinutes: lessonMinutes,
      sortOrder: order++,
    });
    tasks.push({
      date,
      title: phaseIndex >= 3 ? "Timed section practice" : "Recall and review",
      description: `${phase}: complete a short ${daySkill.toLowerCase()} exercise and review each mistake.`,
      skill: daySkill,
      estimatedMinutes: practiceMinutes,
      sortOrder: order++,
    });
  }

  return tasks;
}

export function phaseLabels() {
  return phaseNames;
}
