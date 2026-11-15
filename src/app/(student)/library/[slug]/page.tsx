import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { LessonCompleteAction } from "@/components/lesson-complete-action";
import { jsonText } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

type BodySection = { heading?: string; text?: string };

export default async function LessonPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { slug } = await params;
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { targetLevelId: true },
  });
  if (!profile?.targetLevelId) redirect("/onboarding");

  const lesson = await prisma.lesson.findFirst({
    where: { slug, published: true, module: { examLevelId: profile.targetLevelId } },
    include: {
      module: { include: { examLevel: { include: { exam: true } } } },
      progress: { where: { userId: session.user.id }, select: { completedAt: true } },
    },
  });
  if (!lesson) notFound();

  const body = lesson.body;
  const sections: BodySection[] =
    typeof body === "object" && body !== null && !Array.isArray(body) && Array.isArray(body.sections)
      ? body.sections.filter((section): section is BodySection =>
          typeof section === "object" && section !== null && !Array.isArray(section),
        )
      : [];
  const completed = lesson.progress.length > 0;

  return (
    <div className="student-page">
      <Link className="text-link" href="/library"><ArrowLeft aria-hidden="true" size={15} /> Back to library</Link>
      <article className="lesson-sheet">
        <p className="eyebrow">{lesson.module.examLevel.exam.name} · {lesson.module.examLevel.code} · {lesson.module.skill.toLowerCase()}</p>
        <h1>{lesson.title}</h1>
        <p className="page-intro">{lesson.summary}</p>
        <div className="lesson-meta">{lesson.estimatedMinutes} minutes · Original LinguaCamp lesson</div>
        {lesson.learningObjectives.length > 0 && (
          <section className="lesson-objectives">
            <h2>Learning objectives</h2>
            <ul>{lesson.learningObjectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
          </section>
        )}
        <div className="lesson-body">
          {sections.length ? sections.map((section, index) => (
            <section key={`${section.heading ?? "section"}-${index}`}>
              {section.heading && <h2>{section.heading}</h2>}
              {section.text && <p>{section.text}</p>}
            </section>
          )) : <p>{jsonText(body)}</p>}
        </div>
        <div className="lesson-actions">
          <LessonCompleteAction lessonId={lesson.id} initialCompleted={completed} />
          <Link className="button button-secondary" href="/practice">Continue to practice <ArrowRight aria-hidden="true" size={16} /></Link>
        </div>
      </article>
    </div>
  );
}
