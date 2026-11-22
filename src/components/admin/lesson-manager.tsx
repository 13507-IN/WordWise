"use client";

import {
  AlertCircle,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  Layers,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";

type Lesson = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  difficulty: number;
  estimatedMinutes: number;
  published: boolean;
  _count: {
    questions: number;
    progress: number;
  };
};

type ModuleItem = {
  id: string;
  title: string;
  skill: string;
  sortOrder: number;
  exam: {
    code: string;
    name: string;
  };
  examLevel: {
    id: string;
    code: string;
    name: string;
  };
  lessons: Lesson[];
};

export function LessonManager({ initialModules }: { initialModules: ModuleItem[] }) {
  const [modules, setModules] = useState<ModuleItem[]>(initialModules);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // New lesson form
  const [targetModuleId, setTargetModuleId] = useState(modules[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [objectives, setObjectives] = useState("");
  const [minutes, setMinutes] = useState(25);
  const [published, setPublished] = useState(true);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    const objList = objectives
      .split("\n")
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    if (objList.length === 0) {
      setCreateError("Please provide at least one learning objective.");
      setCreating(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: targetModuleId,
          title,
          summary,
          content,
          difficulty: 1,
          estimatedMinutes: Number(minutes),
          learningObjectives: objList,
          published,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create lesson");

      // Update state
      setModules((prev) =>
        prev.map((mod) =>
          mod.id === targetModuleId
            ? {
                ...mod,
                lessons: [
                  ...mod.lessons,
                  {
                    id: data.id,
                    slug: data.slug,
                    title: data.title,
                    summary: data.summary,
                    difficulty: data.difficulty,
                    estimatedMinutes: data.estimatedMinutes,
                    published: data.published,
                    _count: { questions: 0, progress: 0 },
                  },
                ],
              }
            : mod
        )
      );

      setModalOpen(false);
      setTitle("");
      setSummary("");
      setContent("");
      setObjectives("");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create lesson");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="app-title-row">
        <div>
          <h1>Curriculum Modules &amp; Study Lessons</h1>
          <p>
            Structure lessons across exam certification levels, study objectives, and attached practice items.
          </p>
        </div>
        <button
          type="button"
          className="button"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={16} />
          <span>New Lesson</span>
        </button>
      </div>

      <div className="admin-modules-stack">
        {modules.map((mod) => (
          <section key={mod.id} className="panel admin-module-card">
            <div className="panel-head">
              <div>
                <div className="admin-level-title-row">
                  <span className="level-tag">
                    {mod.exam.code} {mod.examLevel.code}
                  </span>
                  <span className="admin-skill-pill">{mod.skill}</span>
                  <h2>{mod.title}</h2>
                </div>
                <p className="panel-sub">
                  {mod.exam.name} · Level {mod.examLevel.name}
                </p>
              </div>

              <div className="admin-module-meta">
                <span>{mod.lessons.length} Lessons</span>
              </div>
            </div>

            <div className="admin-lessons-list">
              {mod.lessons.length > 0 ? (
                mod.lessons.map((lesson) => (
                  <article key={lesson.id} className="admin-lesson-row">
                    <div className="admin-lesson-info">
                      <div className="admin-lesson-head">
                        <h3>{lesson.title}</h3>
                        <span className="admin-clock-text">
                          <Clock size={13} />
                          <span>{lesson.estimatedMinutes} min</span>
                        </span>
                        {lesson.published ? (
                          <span className="admin-status-badge completed">Published</span>
                        ) : (
                          <span className="admin-status-badge in_progress">Draft</span>
                        )}
                      </div>
                      <p className="admin-lesson-summary">{lesson.summary}</p>
                      <div className="admin-cell-sub">Slug: {lesson.slug}</div>
                    </div>

                    <div className="admin-lesson-stats">
                      <div>
                        <strong>{lesson._count.questions}</strong>
                        <span>Attached Qs</span>
                      </div>
                      <div>
                        <strong>{lesson._count.progress}</strong>
                        <span>Completions</span>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <p className="empty-state">No lessons in this module yet.</p>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* New Lesson Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>Add New Lesson</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="admin-form">
              {createError && (
                <div className="form-error" role="alert">
                  <AlertCircle size={16} />
                  <span>{createError}</span>
                </div>
              )}

              <div className="preview-form" style={{ marginTop: 0 }}>
                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="l-mod">Target Learning Module</label>
                  <select
                    id="l-mod"
                    value={targetModuleId}
                    onChange={(e) => setTargetModuleId(e.target.value)}
                    required
                  >
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        [{m.exam.code} {m.examLevel.code}] {m.title} ({m.skill})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="l-title">Lesson Title</label>
                  <input
                    id="l-title"
                    type="text"
                    placeholder="e.g. Essential Japanese Direction Words & Locations"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="l-summary">Summary / Lede</label>
                  <textarea
                    id="l-summary"
                    rows={2}
                    placeholder="Brief 1-2 sentence overview of what students will master..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    required
                    className="admin-textarea"
                  />
                </div>

                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="l-obj">Learning Objectives (One per line)</label>
                  <textarea
                    id="l-obj"
                    rows={3}
                    placeholder="Identify common locational particles&#10;Recognize cardinal directions&#10;Answer spatial orientation questions"
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    required
                    className="admin-textarea"
                  />
                </div>

                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="l-content">Lesson Body (Markdown)</label>
                  <textarea
                    id="l-content"
                    rows={5}
                    placeholder="Write lesson instructional content, examples, and study advice in Markdown..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="admin-textarea"
                  />
                </div>

                <div className="field">
                  <label htmlFor="l-mins">Estimated Minutes</label>
                  <select
                    id="l-mins"
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                  >
                    <option value={15}>15 minutes</option>
                    <option value={20}>20 minutes</option>
                    <option value={25}>25 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="l-pub">Status</label>
                  <select
                    id="l-pub"
                    value={published ? "true" : "false"}
                    onChange={(e) => setPublished(e.target.value === "true")}
                  >
                    <option value="true">Published (Live for students)</option>
                    <option value="false">Draft</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button" disabled={creating}>
                  {creating ? "Publishing Lesson..." : "Create Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
