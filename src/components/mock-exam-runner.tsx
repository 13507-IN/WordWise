"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Flag, Send } from "lucide-react";

export type MockQuestionData = {
  id: string;
  skill: string;
  prompt: string;
  context: string;
  options: { id: string; label: string; text: string }[];
};

type AnswerState = { selectedOptionId: string | null; markedForReview: boolean };

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function MockExamRunner({ attemptId, title, examLabel, durationSeconds, startedAt, questions, initialAnswers }: {
  attemptId: string;
  title: string;
  examLabel: string;
  durationSeconds: number;
  startedAt: string;
  questions: MockQuestionData[];
  initialAnswers: Record<string, AnswerState>;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(initialAnswers);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil((new Date(startedAt).getTime() + durationSeconds * 1000 - Date.now()) / 1000)),
  );
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submitStarted = useRef(false);
  const submitExamRef = useRef<() => Promise<void>>(async () => {});
  const question = questions[index];
  const answeredCount = useMemo(
    () => Object.values(answers).filter((answer) => answer.selectedOptionId).length,
    [answers],
  );

  const submitExam = useCallback(async () => {
    if (submitStarted.current) return;
    submitStarted.current = true;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/mocks/${attemptId}/submit`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not submit your mock exam.");
      router.replace(`/mocks/${attemptId}/results`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit your mock exam.");
      submitStarted.current = false;
      setSubmitting(false);
    }
  }, [attemptId, router]);

  useEffect(() => {
    submitExamRef.current = submitExam;
  }, [submitExam]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((new Date(startedAt).getTime() + durationSeconds * 1000 - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        window.clearInterval(timer);
        void submitExamRef.current();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [durationSeconds, startedAt]);

  async function saveAnswer(questionId: string, next: AnswerState) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/mocks/${attemptId}/answers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, ...next }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save this answer.");
      setAnswers((current) => ({ ...current, [questionId]: next }));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this answer.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleReview() {
    if (!question) return;
    const current = answers[question.id] ?? { selectedOptionId: null, markedForReview: false };
    await saveAnswer(question.id, { ...current, markedForReview: !current.markedForReview });
  }

  if (!question) {
    return <div className="practice-card practice-empty"><h1>This mock exam has no questions.</h1><p>Return to mock exams and choose another checkpoint.</p></div>;
  }

  const answer = answers[question.id] ?? { selectedOptionId: null, markedForReview: false };
  return (
    <div className="mock-runner">
      <header className="mock-runner-header">
        <div><p className="eyebrow">{examLabel}</p><h1>{title}</h1></div>
        <div className={`mock-timer${secondsLeft < 60 ? " urgent" : ""}`} aria-live="polite">
          <span>Time remaining</span><strong>{formatTime(secondsLeft)}</strong>
        </div>
      </header>
      <div className="mock-runner-meta">
        <span>{answeredCount} of {questions.length} answered</span>
        <span>{saving ? "Saving…" : "Answers save automatically"}</span>
      </div>
      <div className="mock-runner-layout">
        <section className="practice-card mock-question-card">
          <div className="practice-card-top">
            <span className="skill-pill">{question.skill.toLowerCase()}</span>
            <span className="practice-counter">Question {index + 1} of {questions.length}</span>
          </div>
          {question.context && <div className="question-context">{question.context}</div>}
          <h2 className="practice-prompt">{question.prompt}</h2>
          <div className="practice-options">
            {question.options.map((option) => (
              <button
                className={`practice-option${answer.selectedOptionId === option.id ? " selected" : ""}`}
                key={option.id}
                type="button"
                disabled={saving || submitting || secondsLeft === 0}
                onClick={() => void saveAnswer(question.id, { ...answer, selectedOptionId: option.id })}
              >
                <span className="option-label">{option.label}</span><span>{option.text}</span>
              </button>
            ))}
          </div>
          <button className={`review-toggle${answer.markedForReview ? " marked" : ""}`} type="button" disabled={saving || submitting} onClick={() => void toggleReview()}>
            <Flag aria-hidden="true" size={16} /> {answer.markedForReview ? "Marked for review" : "Mark for review"}
          </button>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="practice-actions">
            <button className="button button-secondary" type="button" disabled={index === 0} onClick={() => setIndex((current) => current - 1)}>
              <ChevronLeft aria-hidden="true" size={17} /> Previous
            </button>
            {index < questions.length - 1 ? (
              <button className="button" type="button" onClick={() => setIndex((current) => current + 1)}>
                Next question <ChevronRight aria-hidden="true" size={17} />
              </button>
            ) : (
              <button className="button" type="button" disabled={submitting} onClick={() => void submitExam()}>
                <Send aria-hidden="true" size={16} /> {submitting ? "Submitting…" : "Submit exam"}
              </button>
            )}
          </div>
        </section>
        <aside className="mock-question-nav" aria-label="Question navigation">
          <h2>Questions</h2>
          <div className="mock-question-grid">
            {questions.map((item, itemIndex) => {
              const itemAnswer = answers[item.id];
              return (
                <button
                  className={`mock-question-number${index === itemIndex ? " current" : ""}${itemAnswer?.selectedOptionId ? " answered" : ""}${itemAnswer?.markedForReview ? " needs-review" : ""}`}
                  key={item.id}
                  type="button"
                  aria-label={`Question ${itemIndex + 1}${itemAnswer?.selectedOptionId ? ", answered" : ", unanswered"}${itemAnswer?.markedForReview ? ", marked for review" : ""}`}
                  onClick={() => setIndex(itemIndex)}
                >
                  {itemAnswer?.selectedOptionId ? <Check aria-hidden="true" size={15} /> : itemIndex + 1}
                </button>
              );
            })}
          </div>
          <p>{questions.length - answeredCount} unanswered</p>
          <button className="button button-secondary mock-submit-secondary" type="button" disabled={submitting} onClick={() => void submitExam()}>
            {submitting ? "Submitting…" : "Submit exam"}
          </button>
        </aside>
      </div>
    </div>
  );
}
