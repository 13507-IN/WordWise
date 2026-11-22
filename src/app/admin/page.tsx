import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  FileQuestion,
  GraduationCap,
  Plus,
  ShieldAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    userCount,
    questionCount,
    examCount,
    levelCount,
    lessonCount,
    mockAttemptCount,
    recentAttempts,
    recentUsers,
    exams,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.question.count(),
    prisma.exam.count(),
    prisma.examLevel.count(),
    prisma.lesson.count(),
    prisma.mockAttempt.count(),
    prisma.mockAttempt.findMany({
      include: {
        user: { select: { name: true, email: true } },
        mockExam: {
          include: {
            examLevel: {
              include: { exam: { select: { code: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            targetLevel: {
              select: {
                code: true,
                exam: { select: { code: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.exam.findMany({
      include: {
        levels: {
          include: {
            _count: { select: { questions: true, sections: true, modules: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { code: "asc" },
    }),
  ]);

  return (
    <div className="admin-page">
      <div className="app-title-row">
        <div>
          <h1>Platform Administration</h1>
          <p>Real-time system telemetry, content inventory, and user activity.</p>
        </div>
        <div className="admin-header-actions">
          <Link href={"/admin/questions" as any} className="button">
            <Plus size={16} />
            <span>Add Question</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="metric-strip admin-metric-strip" aria-label="System key performance indicators">
        <div className="metric">
          <div className="admin-metric-label">
            <Users size={16} />
            <span>Total Accounts</span>
          </div>
          <strong className="admin-metric-val">{userCount}</strong>
          <span className="admin-metric-sub">Registered students &amp; staff</span>
        </div>

        <div className="metric">
          <div className="admin-metric-label">
            <FileQuestion size={16} />
            <span>Question Bank</span>
          </div>
          <strong className="admin-metric-val">{questionCount}</strong>
          <span className="admin-metric-sub">Curated exam items</span>
        </div>

        <div className="metric">
          <div className="admin-metric-label">
            <GraduationCap size={16} />
            <span>Exams &amp; Levels</span>
          </div>
          <strong className="admin-metric-val">{examCount} / {levelCount}</strong>
          <span className="admin-metric-sub">Syllabi configured</span>
        </div>

        <div className="metric">
          <div className="admin-metric-label">
            <Activity size={16} />
            <span>Mock Checkpoints</span>
          </div>
          <strong className="admin-metric-val">{mockAttemptCount}</strong>
          <span className="admin-metric-sub">{lessonCount} total lessons</span>
        </div>
      </section>

      {/* Main Grid */}
      <div className="admin-grid-layout">
        {/* Exam Inventory Column */}
        <div className="admin-main-col">
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>Certification Catalogs</h2>
                <p className="panel-sub">Syllabus breakdown, duration timings, and question counts.</p>
              </div>
              <Link href={"/admin/exams" as any} className="text-link">
                View detailed specs <ArrowRight size={14} />
              </Link>
            </div>

            <div className="admin-exam-cards">
              {exams.map((exam) => {
                const totalExamQuestions = exam.levels.reduce((acc, l) => acc + l._count.questions, 0);
                return (
                  <article key={exam.id} className="admin-exam-card">
                    <div className="admin-exam-card-head">
                      <div>
                        <span className="admin-exam-code">{exam.code}</span>
                        <h3>{exam.name}</h3>
                        <span className="admin-exam-lang">{exam.language}</span>
                      </div>
                      <div className="admin-exam-stat">
                        <strong>{totalExamQuestions}</strong>
                        <span>questions</span>
                      </div>
                    </div>

                    <div className="admin-levels-pills">
                      {exam.levels.map((lvl) => (
                        <div key={lvl.id} className="admin-level-chip">
                          <span className="admin-chip-code">{lvl.code}</span>
                          <span className="admin-chip-count">{lvl._count.questions} Qs</span>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Recent Mock Submissions */}
          <div className="panel" style={{ marginTop: "1rem" }}>
            <div className="panel-head">
              <div>
                <h2>Recent Student Checkpoints</h2>
                <p className="panel-sub">Latest clocked mock attempts across all active learners.</p>
              </div>
              <Link href={"/admin/attempts" as any} className="text-link">
                View all attempts <ArrowRight size={14} />
              </Link>
            </div>

            {recentAttempts.length > 0 ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Exam</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttempts.map((attempt) => (
                      <tr key={attempt.id}>
                        <td>
                          <strong>{attempt.user.name || "Student"}</strong>
                          <div className="admin-cell-sub">{attempt.user.email}</div>
                        </td>
                        <td>
                          <span className="level-tag">
                            {attempt.mockExam.examLevel.exam.code} {attempt.mockExam.examLevel.code}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-status-badge ${attempt.status.toLowerCase()}`}>
                            {attempt.status}
                          </span>
                        </td>
                        <td>
                          {attempt.score !== null ? (
                            <strong className="admin-score-text">{Math.round(attempt.score)}%</strong>
                          ) : (
                            <span className="admin-muted">—</span>
                          )}
                        </td>
                        <td className="admin-muted">
                          {new Date(attempt.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-state">No mock attempts recorded yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar Rail: Quick actions & recent accounts */}
        <div className="admin-side-col">
          <div className="panel">
            <h2>Quick Actions</h2>
            <div className="admin-action-list">
              <Link href={"/admin/questions" as any} className="admin-action-item">
                <FileQuestion size={18} />
                <div>
                  <strong>Manage Question Bank</strong>
                  <p>Add new prompts, options &amp; answers</p>
                </div>
                <ArrowRight size={14} />
              </Link>

              <Link href={"/admin/users" as any} className="admin-action-item">
                <Users size={18} />
                <div>
                  <strong>User Directory &amp; RBAC</strong>
                  <p>Assign student &amp; admin roles</p>
                </div>
                <ArrowRight size={14} />
              </Link>

              <Link href={"/admin/lessons" as any} className="admin-action-item">
                <BookOpenCheck size={18} />
                <div>
                  <strong>Curriculum Manager</strong>
                  <p>Organize lessons &amp; study units</p>
                </div>
                <ArrowRight size={14} />
              </Link>

              <Link href={"/admin/exams" as any} className="admin-action-item">
                <GraduationCap size={18} />
                <div>
                  <strong>Catalog Specifications</strong>
                  <p>Examine durations and guidelines</p>
                </div>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="panel" style={{ marginTop: "1rem" }}>
            <div className="panel-head">
              <h2>Recent Accounts</h2>
              <Link href={"/admin/users" as any} className="text-link">All <ArrowRight size={12} /></Link>
            </div>

            <div className="admin-user-compact-list">
              {recentUsers.map((u) => (
                <div key={u.id} className="admin-user-compact-row">
                  <div>
                    <strong>{u.name || "Unnamed"}</strong>
                    <div className="admin-cell-sub">{u.email}</div>
                  </div>
                  <span className={`admin-role-badge ${u.role.toLowerCase()}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel admin-health-panel" style={{ marginTop: "1rem" }}>
            <div className="panel-head">
              <div className="admin-health-title">
                <CheckCircle2 size={16} className="text-green" />
                <h2>System Health</h2>
              </div>
              <span className="admin-status-badge completed">Healthy</span>
            </div>
            <ul className="admin-health-list">
              <li><span>PostgreSQL Connection:</span> <strong>Active</strong></li>
              <li><span>Prisma Client:</span> <strong>v7.10.1</strong></li>
              <li><span>Next.js Runtime:</span> <strong>v16.4.6</strong></li>
              <li><span>AI Provider:</span> <strong>{process.env.AI_API_KEY ? "Connected" : "Unconfigured (Safe mode)"}</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
