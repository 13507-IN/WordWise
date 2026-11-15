"use client";

import { ArrowRight, Clock3, FileQuestion } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type MockExamCardData = {
  id: string;
  title: string;
  mode: string;
  durationMinutes: number;
  questionCount: number;
  isSample: boolean;
};

export function MockExamList({ mocks }: { mocks: MockExamCardData[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function start(mockExamId: string) {
    setBusyId(mockExamId);
    setError("");
    try {
      const response = await fetch("/api/mocks/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mockExamId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not start this mock exam.");
      router.push(`/mocks/${result.attemptId}`);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Could not start this mock exam.");
      setBusyId("");
    }
  }

  if (!mocks.length) {
    return <div className="practice-card practice-empty"><FileQuestion aria-hidden="true" /><h2>No mock exams available yet</h2><p>Published mock exams for your selected level will appear here.</p></div>;
  }

  return (
    <>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="mock-list">
        {mocks.map((mock) => (
          <article className="mock-card" key={mock.id}>
            <div className="mock-card-icon"><FileQuestion aria-hidden="true" /></div>
            <div className="mock-card-copy">
              <span className="skill-pill">{mock.isSample ? "Original sample" : "Practice exam"}</span>
              <h2>{mock.title}</h2>
              <p>{mock.mode === "FULL" ? "Full examination" : "Section checkpoint"} · {mock.questionCount} questions</p>
              <span className="mock-duration"><Clock3 aria-hidden="true" size={15} /> {mock.durationMinutes} minutes</span>
            </div>
            <button className="button" type="button" disabled={busyId === mock.id} onClick={() => start(mock.id)}>
              {busyId === mock.id ? "Starting…" : "Start exam"} <ArrowRight aria-hidden="true" size={16} />
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
