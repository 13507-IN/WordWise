import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";
import { auth } from "@/auth";
import { jsonText } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ attemptId: string }> };

export default async function MockResultsPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { attemptId } = await params;
  const attempt = await prisma.mockAttempt.findFirst({
    where: { id: attemptId, userId: session.user.id },
    include: {
      mockExam: {
        include: {
          examLevel: { include: { exam: true } },
          questions: {
            orderBy: { sortOrder: "asc" },
            include: { question: { include: { options: { orderBy: { sortOrder: "asc" } } } } },
          },
        },
      },
      answers: true,
    },
  });
  if (!attempt) notFound();
  if (attempt.status !== "SUBMITTED") redirect(`/mocks/${attempt.id}`);

  const answerMap = new Map(attempt.answers.map((answer) => [answer.questionId, answer]));
  const correctCount = attempt.mockExam.questions.filter(({ question }) => {
    const answer = answerMap.get(question.id);
    return Boolean(answer?.isCorrect);
  }).length;
  const total = attempt.mockExam.questions.length;

  return (
    <div className="student-page">
      <div className="app-title-row">
        <div>
          <p className="eyebrow">{attempt.mockExam.examLevel.exam.name} · {attempt.mockExam.examLevel.code}</p>
          <h1>Mock exam results</h1>
          <p className="page-intro">{attempt.mockExam.title} · submitted {attempt.submittedAt?.toLocaleString()}</p>
        </div>
        <Link className="button button-secondary" href="/mocks"><ArrowLeft aria-hidden="true" size={16} /> All mock exams</Link>
      </div>

      <section className="mock-score-summary">
        <div><span>Estimated score</span><strong>{Math.round(attempt.score ?? 0)}%</strong></div>
        <div><span>Correct answers</span><strong>{correctCount} / {total}</strong></div>
        <p>Practice estimate only. It is not an official examination score or a prediction of certification results.</p>
      </section>

      <section className="mock-review-list">
        <h2>Answer review</h2>
        {attempt.mockExam.questions.map(({ question }, index) => {
          const answer = answerMap.get(question.id);
          const correctOption = question.options.find((option) => option.isCorrect);
          const selectedOption = question.options.find((option) => option.id === answer?.selectedOptionId);
          const correct = Boolean(answer?.isCorrect);
          return (
            <article className={`mock-review-item${correct ? " correct" : " incorrect"}`} key={question.id}>
              <div className="mock-review-heading">
                <span className={`mock-review-mark${correct ? " correct" : " incorrect"}`}>
                  {correct ? <Check aria-label="Correct" size={16} /> : <X aria-label="Incorrect" size={16} />}
                </span>
                <strong>Question {index + 1}</strong>
                <span className="skill-pill">{question.skill.toLowerCase()}</span>
              </div>
              {jsonText(question.prompt, "context") && <div className="question-context">{jsonText(question.prompt, "context")}</div>}
              <p className="mock-review-prompt">{jsonText(question.prompt)}</p>
              <p className={correct ? "review-answer is-correct" : "review-answer is-incorrect"}>
                Your answer: {selectedOption ? `${selectedOption.label}. ${jsonText(selectedOption.content)}` : "Not answered"}
              </p>
              {!correct && correctOption && (
                <p className="review-answer is-correct">Correct answer: {correctOption.label}. {jsonText(correctOption.content)}</p>
              )}
              <p className="review-explanation">{question.explanation}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
