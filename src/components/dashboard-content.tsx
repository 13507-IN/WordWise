"use client";

import { ArrowRight, Check, Circle, Clock3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type DashboardData = {
  name: string;
  examName: string;
  examCode: string;
  levelCode: string;
  examDate: string;
  daysRemaining: number;
  readiness: number;
  studyStreak: number;
  completedLessons: number;
  completedTasks: number;
  totalTasks: number;
  mockCount: number;
  averageMockScore: number | null;
  sections: { name: string; score: number | null }[];
  todayTasks: { id: string; title: string; description: string; skill: string; estimatedMinutes: number; completed: boolean }[];
  nextTasks: { id: string; title: string; description: string; skill: string; estimatedMinutes: number; date: string; completed: boolean }[];
  weakTopics: { skill: string; correct: number; total: number }[];
  recentMocks: { id: string; title: string; score: number | null; date: string }[];
};

const skillLabels: Record<string, string> = {
  VOCABULARY: "Vocabulary",
  GRAMMAR: "Grammar",
  READING: "Reading",
  LISTENING: "Listening",
  WRITING: "Writing",
  SPEAKING: "Speaking",
  INTEGRATED: "Integrated",
};

function TaskRows({ tasks, emptyText, onComplete }: {
  tasks: DashboardData["todayTasks"];
  emptyText: string;
  onComplete: (taskId: string) => Promise<void>;
}) {
  const [busyId, setBusyId] = useState("");
  async function complete(taskId: string) {
    setBusyId(taskId);
    try {
      await onComplete(taskId);
    } finally {
      setBusyId("");
    }
  }

  if (!tasks.length) return <p className="empty-state">{emptyText}</p>;
  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li className="task-row" key={task.id}>
          <button
            className={`task-check-button${task.completed ? " done" : ""}`}
            type="button"
            disabled={task.completed || busyId === task.id}
            aria-label={task.completed ? `${task.title} completed` : `Mark ${task.title} complete`}
            onClick={() => complete(task.id)}
          >
            {task.completed ? <Check aria-hidden="true" size={15} /> : <Circle aria-hidden="true" size={18} />}
          </button>
          <div>
            <p>{task.title}</p>
            <span>{task.description}</span>
          </div>
          <span className="task-time"><Clock3 aria-hidden="true" size={13} /> {task.estimatedMinutes} min</span>
        </li>
      ))}
    </ul>
  );
}

export function DashboardContent({ data }: { data: DashboardData }) {
  const router = useRouter();

  async function completeTask(taskId: string) {
    const response = await fetch(`/api/tasks/${taskId}`, { method: "PATCH" });
    if (!response.ok) throw new Error("Could not update this study task.");
    router.refresh();
  }

  const progress = data.totalTasks ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;
  const taskList = data.todayTasks.length ? data.todayTasks : data.nextTasks;
  const taskHeading = data.todayTasks.length ? "Today’s study plan" : "Next study day";

  return (
    <>
      <div className="app-title-row">
        <div>
          <h1>Preparation overview</h1>
          <p>{data.examName} · {data.levelCode} · {data.daysRemaining} days until your target date</p>
        </div>
        <Link className="button app-primary-button" href="/practice">Start practice <ArrowRight size={16} /></Link>
      </div>

      <div className="app-grid">
        <div className="app-column">
          <section className="readiness panel" aria-labelledby="readiness-title">
            <div>
              <h2 id="readiness-title">Exam readiness estimate</h2>
              <p className="form-hint">Based on completed plan tasks and recorded practice answers. Not an official exam score.</p>
              <div className="progress-track" aria-label={`${data.readiness}% readiness estimate`}>
                <div className="progress-fill" style={{ width: `${data.readiness}%` }} />
              </div>
            </div>
            <span className="readiness-value">{data.readiness}%</span>
          </section>

          <div className="metric-strip" aria-label="Preparation metrics">
            <div className="metric"><span className="metric-label">Study streak</span><strong className="metric-value">{data.studyStreak}</strong><span className="metric-note">consecutive days</span></div>
            <div className="metric"><span className="metric-label">Lessons completed</span><strong className="metric-value">{data.completedLessons}</strong><span className="metric-note">from your plan</span></div>
            <div className="metric"><span className="metric-label">Mock checkpoints</span><strong className="metric-value">{data.mockCount}</strong><span className="metric-note">submitted</span></div>
            <div className="metric"><span className="metric-label">Average mock score</span><strong className="metric-value">{data.averageMockScore === null ? "—" : `${data.averageMockScore}%`}</strong><span className="metric-note">estimate, not official</span></div>
          </div>

          <section className="panel" aria-labelledby="tasks-title">
            <div className="panel-head">
              <div><h2 id="tasks-title">{taskHeading}</h2><p className="form-hint">{progress}% of planned tasks completed</p></div>
              <Link className="text-link" href="/practice">Practice <ArrowRight size={15} /></Link>
            </div>
            <TaskRows
              tasks={taskList}
              emptyText="No study session is scheduled today. Your next available study day will appear here."
              onComplete={completeTask}
            />
          </section>

          <section className="panel" aria-labelledby="mocks-title">
            <div className="panel-head">
              <h2 id="mocks-title">Recent mock checkpoints</h2>
              <Link className="text-link" href="/mocks">All mocks <ArrowRight size={15} /></Link>
            </div>
            {data.recentMocks.length ? (
              <ul className="plain-list mock-result-list">
                {data.recentMocks.map((mock) => (
                  <li className="mock-result-row" key={mock.id}>
                    <span><strong>{mock.title}</strong><small>{mock.date}</small></span>
                    <strong className="num">{mock.score === null ? "—" : `${mock.score}%`}</strong>
                  </li>
                ))}
              </ul>
            ) : <p className="empty-state">Your first checkpoint will be listed here after you submit a mock exam.</p>}
          </section>
        </div>

        <aside className="app-rail">
          <section className="panel" aria-labelledby="skills-title">
            <div className="panel-head"><h2 id="skills-title">Accuracy by exam section</h2></div>
            {data.sections.map((section) => (
              <div className="skill-row" key={section.name}>
                <span>{section.name}</span>
                <div className="progress-track" aria-label={section.score === null ? `${section.name}: not measured` : `${section.name}: ${section.score}%`}>
                  {section.score !== null && <div className="progress-fill" style={{ width: `${section.score}%` }} />}
                </div>
                <span className="skill-score">{section.score === null ? "—" : `${section.score}%`}</span>
              </div>
            ))}
            <p className="form-hint">A dash means there are no submitted answers for that section yet.</p>
          </section>

          <section className="panel" aria-labelledby="weak-title">
            <div className="panel-head"><h2 id="weak-title">Topics to revisit</h2></div>
            {data.weakTopics.length ? (
              <ul className="plain-list weak-topic-list">
                {data.weakTopics.map((item) => (
                  <li key={item.skill}>
                    <span>{skillLabels[item.skill] ?? item.skill}</span>
                    <strong className="num">{item.correct}/{item.total}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">Complete a few practice questions to identify topics for revision.</p>
            )}
          </section>

          <section className="panel" aria-labelledby="bootcamp-title">
            <div className="panel-head"><h2 id="bootcamp-title">Live classes</h2></div>
            <p className="empty-state">No live sessions are attached to your account yet.</p>
            <p className="small-copy">Scheduled cohorts can be added when instructor programs are enabled.</p>
          </section>
        </aside>
      </div>
    </>
  );
}
