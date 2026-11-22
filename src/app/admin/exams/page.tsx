import {
  Clock,
  ExternalLink,
  FileQuestion,
  GraduationCap,
  Layers,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminExamsPage() {
  const exams = await prisma.exam.findMany({
    include: {
      levels: {
        include: {
          sections: { orderBy: { sortOrder: "asc" } },
          _count: {
            select: {
              questions: true,
              modules: true,
              profiles: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { code: "asc" },
  });

  return (
    <div className="admin-page">
      <div className="app-title-row">
        <div>
          <h1>Certification Catalogs &amp; Level Specifications</h1>
          <p>
            Data-driven examination structures, timed paper durations, and official authority references.
          </p>
        </div>
      </div>

      <div className="admin-exams-stack">
        {exams.map((exam) => {
          const totalQuestions = exam.levels.reduce((acc, l) => acc + l._count.questions, 0);
          const totalCandidates = exam.levels.reduce((acc, l) => acc + l._count.profiles, 0);

          return (
            <section key={exam.id} className="panel admin-exam-detail-panel">
              <div className="admin-exam-detail-header">
                <div>
                  <div className="admin-exam-meta-top">
                    <span className="admin-exam-code">{exam.code}</span>
                    <span className="admin-exam-lang">{exam.language}</span>
                  </div>
                  <h2>{exam.name}</h2>
                  <p className="admin-exam-desc">{exam.description}</p>
                </div>

                <div className="admin-exam-stats-group">
                  <div className="admin-exam-stat-box">
                    <strong>{exam.levels.length}</strong>
                    <span>Levels</span>
                  </div>
                  <div className="admin-exam-stat-box">
                    <strong>{totalQuestions}</strong>
                    <span>Questions</span>
                  </div>
                  <div className="admin-exam-stat-box">
                    <strong>{totalCandidates}</strong>
                    <span>Students</span>
                  </div>
                  <a
                    href={exam.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button button-secondary"
                  >
                    <span>Authority Guideline</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Levels accordion/list */}
              <div className="admin-level-specs-list">
                {exam.levels.map((level) => (
                  <article key={level.id} className="admin-level-spec-card">
                    <div className="admin-level-spec-head">
                      <div>
                        <div className="admin-level-title-row">
                          <span className="level-tag">{level.code}</span>
                          <h3>{level.name}</h3>
                        </div>
                        <p className="admin-level-overview">{level.overview}</p>
                      </div>

                      <div className="admin-level-meta-pill">
                        <span>{level._count.questions} Practice Items</span>
                        <span>·</span>
                        <span>{level._count.modules} Modules</span>
                      </div>
                    </div>

                    {/* Sections Table */}
                    <div className="admin-sections-grid">
                      <h4>Configured Test Sections &amp; Clocks:</h4>
                      <div className="admin-sections-table-wrap">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Section Name</th>
                              <th>Tested Skill</th>
                              <th>Paper Duration</th>
                              <th>Preparation Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {level.sections.map((sec) => (
                              <tr key={sec.id}>
                                <td>
                                  <strong>{sec.name}</strong>
                                  <div className="admin-cell-sub">Code: {sec.code}</div>
                                </td>
                                <td>
                                  <span className="admin-skill-pill">{sec.skill}</span>
                                </td>
                                <td>
                                  <span className="admin-clock-text">
                                    <Clock size={14} />
                                    <span>{sec.durationMinutes ? `${sec.durationMinutes} min` : "Untimed / Dynamic"}</span>
                                  </span>
                                </td>
                                <td>
                                  {sec.preparationMinutes ? (
                                    <span className="admin-muted">{sec.preparationMinutes} min</span>
                                  ) : (
                                    <span className="admin-muted">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="admin-level-footer">
                      <span className="admin-muted">
                        Format version: {level.formatVersion || "Official benchmark"}
                      </span>
                      <a
                        href={level.officialSourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-link"
                      >
                        Verify Level against Source <ExternalLink size={12} />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
