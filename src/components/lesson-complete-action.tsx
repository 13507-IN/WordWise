"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LessonCompleteAction({ lessonId, initialCompleted }: { lessonId: string; initialCompleted: boolean }) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function complete() {
    if (busy || completed) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/lessons/${lessonId}/complete`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not update lesson progress.");
      setCompleted(true);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update lesson progress.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lesson-complete-wrap">
      <button className="button" type="button" disabled={busy || completed} onClick={complete}>
        {completed ? <><Check aria-hidden="true" size={16} /> Lesson completed</> : busy ? "Saving…" : "Mark complete"}
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
