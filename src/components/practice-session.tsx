"use client";

import { Check, ChevronLeft, ChevronRight, CircleHelp, RotateCcw, X } from "lucide-react";
import { useRef, useState } from "react";

export type PracticeQuestionData = {
  id: string;
  skill: string;
  prompt: string;
  context: string;
  options: { id: string; label: string; text: string }[];
};

type Feedback = { isCorrect: boolean; explanation: string; correctAnswer: { id: string; label: string } | null };

export function PracticeSession({ questions, skillLabels }: {
  questions: PracticeQuestionData[];
  skillLabels: Record<string, string>;
}) {
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const questionStartedAt = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const question = questions[index];

  async function submit() {
    if (!question || !selectedId || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/practice/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          selectedOptionId: selectedId,
          elapsedSeconds: Math.max(0, Math.floor((Date.now() - (questionStartedAt.current ?? Date.now())) / 1000)),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Your answer could not be saved.");
      setFeedback(result as Feedback);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Your answer could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  function moveTo(nextIndex: number) {
    setIndex(nextIndex);
    setSelectedId("");
    setFeedback(null);
    questionStartedAt.current = null;
    setError("");
  }

  if (!question) {
    return (
      <section className="practice-card practice-empty">
        <CircleHelp aria-hidden="true" />
        <h2>No questions published for this selection yet</h2>
        <p>New original practice items will appear here as the question bank grows.</p>
      </section>
    );
  }

  return (
    <section className="practice-card" aria-label="Practice question">
      <div className="practice-card-top">
        <span className="skill-pill">{skillLabels[question.skill] ?? question.skill}</span>
        <span className="practice-counter">Question {index + 1} of {questions.length}</span>
      </div>
      {question.context && <div className="question-context">{question.context}</div>}
      <h2 className="practice-prompt">{question.prompt}</h2>
      <div className="practice-options">
        {question.options.map((option) => {
          const isSelected = selectedId === option.id;
          const isCorrect = feedback?.correctAnswer?.id === option.id;
          const isWrongSelection = feedback && isSelected && !feedback.isCorrect;
          return (
            <button
              className={`practice-option${isSelected ? " selected" : ""}${isCorrect ? " correct" : ""}${isWrongSelection ? " incorrect" : ""}`}
              key={option.id}
              type="button"
              disabled={Boolean(feedback) || busy}
              onClick={() => {
                questionStartedAt.current ??= Date.now();
                setSelectedId(option.id);
              }}
            >
              <span className="option-label">{option.label}</span>
              <span>{option.text}</span>
              {isCorrect && <Check aria-label="Correct answer" size={18} />}
              {isWrongSelection && <X aria-label="Your answer" size={18} />}
            </button>
          );
        })}
      </div>
      {feedback && (
        <div className={`answer-feedback${feedback.isCorrect ? " is-correct" : " is-incorrect"}`} role="status">
          <strong>{feedback.isCorrect ? "Correct" : "Review this one"}</strong>
          <p>{feedback.explanation}</p>
        </div>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="practice-actions">
        <button className="button button-secondary" type="button" disabled={index === 0} onClick={() => moveTo(index - 1)}>
          <ChevronLeft aria-hidden="true" size={17} /> Previous
        </button>
        {!feedback ? (
          <button className="button" type="button" disabled={!selectedId || busy} onClick={submit}>
            {busy ? "Checking…" : "Check answer"}
          </button>
        ) : index < questions.length - 1 ? (
          <button className="button" type="button" onClick={() => moveTo(index + 1)}>
            Next question <ChevronRight aria-hidden="true" size={17} />
          </button>
        ) : (
          <button className="button" type="button" onClick={() => moveTo(0)}>
            <RotateCcw aria-hidden="true" size={16} /> Review again
          </button>
        )}
      </div>
    </section>
  );
}
