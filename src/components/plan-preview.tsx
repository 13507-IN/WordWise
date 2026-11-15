"use client";

import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

type PreviewLevel = {
  id: string;
  code: string;
  sections: { code: string; name: string; skill: string }[];
};

type PreviewExam = {
  id: string;
  code: string;
  name: string;
  levels: PreviewLevel[];
};

type PreviewTask = {
  day: string;
  title: string;
  detail: string;
};

function phaseFor(daysRemaining: number) {
  if (daysRemaining > 70) return "Foundation and diagnostic";
  if (daysRemaining > 35) return "Section-wise intensive practice";
  if (daysRemaining > 14) return "Timed examination practice";
  return "Final revision";
}

export function PlanPreview({ exams }: { exams: PreviewExam[] }) {
  const [examId, setExamId] = useState(exams[0]?.id ?? "");
  const activeExam = useMemo(() => exams.find((exam) => exam.id === examId), [examId, exams]);
  const [levelId, setLevelId] = useState(activeExam?.levels[0]?.id ?? "");
  const [examDate, setExamDate] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState("30");
  const [tasks, setTasks] = useState<PreviewTask[]>([]);
  const [error, setError] = useState("");
  const activeLevel = activeExam?.levels.find((level) => level.id === levelId);

  function changeExam(nextExamId: string) {
    const nextExam = exams.find((exam) => exam.id === nextExamId);
    setExamId(nextExamId);
    setLevelId(nextExam?.levels[0]?.id ?? "");
    setTasks([]);
  }

  function makePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!activeLevel || !examDate) {
      setError("Choose a target level and date to preview your first study week.");
      return;
    }

    const target = new Date(`${examDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
    if (daysRemaining < 1 || daysRemaining > 730) {
      setError("Choose an exam date within the next two years.");
      return;
    }

    const phase = phaseFor(daysRemaining);
    const sections = activeLevel.sections;
    const availableDays = [1, 2, 3, 4, 5];
    const previewTasks = availableDays.map((weekday, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + ((weekday - today.getDay() + 7) % 7 || 7));
      const section = sections[index % sections.length];
      const dayLabel = new Intl.DateTimeFormat("en", { weekday: "long", month: "short", day: "numeric" }).format(date);
      return {
        day: dayLabel,
        title: section?.name ?? "Review your target exam",
        detail: `${phase} · ${Math.max(10, Number(dailyMinutes) - 10)} min focused practice`,
      };
    });
    setTasks(previewTasks);
  }

  const registerQuery = new URLSearchParams({
    ...(levelId ? { examLevelId: levelId } : {}),
    ...(examDate ? { examDate } : {}),
    dailyMinutes,
  }).toString();

  return (
    <div className="preview-section site-shell">
      <div>
        <h2 className="section-title">A calendar built around your date</h2>
        <p className="section-intro">
          Choose a certification, a target level and the day you plan to sit it. Preview the shape of your first study week.
        </p>
        <form className="preview-form" onSubmit={makePreview}>
          <div className="field">
            <label htmlFor="preview-exam">Examination</label>
            <select id="preview-exam" value={examId} onChange={(event) => changeExam(event.target.value)}>
              {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="preview-level">Target level</label>
            <select id="preview-level" value={levelId} onChange={(event) => { setLevelId(event.target.value); setTasks([]); }}>
              {activeExam?.levels.map((level) => <option key={level.id} value={level.id}>{level.code}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="preview-date">Target exam date</label>
            <input id="preview-date" type="date" value={examDate} onChange={(event) => { setExamDate(event.target.value); setTasks([]); }} required />
          </div>
          <div className="field">
            <label htmlFor="preview-minutes">Study time each day</label>
            <select id="preview-minutes" value={dailyMinutes} onChange={(event) => setDailyMinutes(event.target.value)}>
              <option value="20">20 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>
          <button className="button" type="submit">
            Preview my week <ArrowRight aria-hidden="true" size={17} />
          </button>
        </form>
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
      <div className="plan-preview" aria-live="polite">
        <div className="panel-head">
          <div>
            <h3>{tasks.length ? `Your ${activeLevel?.code} study week` : "Your first week takes shape here"}</h3>
            <p className="preview-meta">
              <span><CalendarDays aria-hidden="true" size={15} /> {tasks.length ? new Date(examDate).toLocaleDateString() : "Target date"}</span>
              <span><Clock3 aria-hidden="true" size={15} /> {dailyMinutes} min per study day</span>
            </p>
          </div>
        </div>
        {tasks.length ? (
          <>
            {tasks.map((task) => (
              <div className="preview-day" key={task.day}>
                <strong>{task.day}</strong>
                <p>{task.title}<span>{task.detail}</span></p>
              </div>
            ))}
            <Link className="text-link" href={`/register?${registerQuery}`}>
              Save this plan <ArrowRight aria-hidden="true" />
            </Link>
          </>
        ) : (
          <p className="empty-state">
            Your exam sections determine the practice mix. Pick a date to see the first five study sessions.
          </p>
        )}
      </div>
    </div>
  );
}
