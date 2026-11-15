import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    include: { targetLevel: { include: { exam: true } } },
  });
  if (!profile?.targetLevel) redirect("/onboarding");

  const lessons = await prisma.lesson.findMany({
    where: { published: true, module: { examLevelId: profile.targetLevel.id } },
    orderBy: [{ module: { sortOrder: "asc" } }, { createdAt: "asc" }],
    include: {
      module: { select: { title: true, skill: true } },
      progress: { where: { userId: session.user.id }, select: { completedAt: true } },
    },
  });

  return (
    <div className="student-page">
      <div className="app-title-row">
        <div>
          <p className="eyebrow">{profile.targetLevel.exam.name} · {profile.targetLevel.code}</p>
          <h1>Content library</h1>
          <p className="page-intro">Published lessons for your selected exam. Each item uses original LinguaCamp sample material.</p>
        </div>
      </div>
      {lessons.length ? (
        <div className="library-grid">
          {lessons.map((lesson) => (
            <article className="library-card" key={lesson.id}>
              <span className="skill-pill">{lesson.module.skill.toLowerCase()}</span>
              <h2>{lesson.title}</h2>
              <p>{lesson.summary}</p>
              <div className="library-card-foot">
                <span>{lesson.estimatedMinutes} min · {lesson.progress.length ? "Completed" : "Not started"}</span>
                <Link className="text-link" href={`/library/${lesson.slug}`}>Open lesson <ArrowRight aria-hidden="true" size={15} /></Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="practice-card practice-empty">
          <BookOpen aria-hidden="true" />
          <h2>No lessons published for this level yet</h2>
          <p>New content will appear here when it is added to the question and lesson bank.</p>
        </section>
      )}
    </div>
  );
}
