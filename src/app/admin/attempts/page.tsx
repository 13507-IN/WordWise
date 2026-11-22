import {
  Activity,
  Award,
  CheckCircle2,
  Clock,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAttemptsPage() {
  const attempts = await prisma.mockAttempt.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
      mockExam: {
        include: {
          examLevel: {
            include: {
              exam: { select: { code: true, name: true } },
            },
          },
        },
      },
      answers: {
        select: {
          id: true,
          isCorrect: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totalAttempts = attempts.length;
  const submitted = attempts.filter((a) => a.status === "SUBMITTED");
  const avgScore =
    submitted.length > 0
      ? Math.round(
          submitted.reduce((acc, a) => acc + (a.score ?? 0), 0) / submitted.length
        )
      : 0;

  return (
    <div className="admin-page">
      <div className="app-title-row">
        <div>
          <h1>Exam Attempts &amp; Candidate Telemetry</h1>
          <p>
            Audit student mock checkpoint submissions, raw correctness, and exam completion metrics.
          </p>
        </div>
      </div>

      <section className="metric-strip admin-metric-strip" aria-label="Mock analytics summary">
        <div className="metric">
          <div className="admin-metric-label">
            <Activity size={16} />
            <span>Total Attempts</span>
          </div>
          <strong className="admin-metric-val">{totalAttempts}</strong>
          <span className="admin-metric-sub">Across all levels</span>
        </div>

        <div className="metric">
          <div className="admin-metric-label">
            <CheckCircle2 size={16} />
            <span>Submitted Tests</span>
          </div>
          <strong className="admin-metric-val">{submitted.length}</strong>
          <span className="admin-metric-sub">
            {totalAttempts > 0
              ? `${Math.round((submitted.length / totalAttempts) * 100)}% completion rate`
              : "0%"}
          </span>
        </div>

        <div className="metric">
          <div className="admin-metric-label">
            <TrendingUp size={16} />
            <span>Average Score</span>
          </div>
          <strong className="admin-metric-val">{avgScore}%</strong>
          <span className="admin-metric-sub">Across submitted checkpoints</span>
        </div>

        <div className="metric">
          <div className="admin-metric-label">
            <Award size={16} />
            <span>Scoring Model</span>
          </div>
          <strong className="admin-metric-val">Raw Accuracy</strong>
          <span className="admin-metric-sub">Objective question correctness</span>
        </div>
      </section>

      <div className="panel admin-table-panel" style={{ marginTop: "1.25rem" }}>
        <div className="panel-head">
          <div>
            <h2>Attempt History Log</h2>
            <p className="panel-sub">Recent mock checkpoint sessions in chronological order.</p>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Exam Level</th>
                <th>Status</th>
                <th>Correct / Total</th>
                <th>Score</th>
                <th>Started / Submitted</th>
              </tr>
            </thead>
            <tbody>
              {attempts.length > 0 ? (
                attempts.map((att) => {
                  const correctCount = att.answers.filter((ans) => ans.isCorrect).length;
                  const totalAnswered = att.answers.length;

                  return (
                    <tr key={att.id}>
                      <td>
                        <div className="admin-user-cell">
                          <strong>{att.user.name || "Student"}</strong>
                          <span className="admin-cell-sub">{att.user.email}</span>
                        </div>
                      </td>

                      <td>
                        <span className="level-tag">
                          {att.mockExam.examLevel.exam.code} {att.mockExam.examLevel.code}
                        </span>
                      </td>

                      <td>
                        <span className={`admin-status-badge ${att.status.toLowerCase()}`}>
                          {att.status}
                        </span>
                      </td>

                      <td>
                        <strong>{correctCount}</strong>
                        <span className="admin-muted"> / {totalAnswered} answered</span>
                      </td>

                      <td>
                        {att.score !== null ? (
                          <strong className="admin-score-text">{Math.round(att.score)}%</strong>
                        ) : (
                          <span className="admin-muted">—</span>
                        )}
                      </td>

                      <td>
                        <div className="admin-time-cell">
                          <span>
                            {new Date(att.startedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {att.submittedAt && (
                            <span className="admin-cell-sub">
                              Submitted {new Date(att.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="empty-state" style={{ padding: "2.5rem", textAlign: "center" }}>
                    No mock attempts recorded in the database yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
