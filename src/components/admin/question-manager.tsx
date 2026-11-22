"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Filter,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
const SKILL_TYPES = [
  "VOCABULARY",
  "GRAMMAR",
  "READING",
  "LISTENING",
  "WRITING",
  "SPEAKING",
  "INTEGRATED",
] as const;

type SkillType = (typeof SKILL_TYPES)[number];

type Option = {
  id: string;
  label: string;
  content: unknown;
  isCorrect: boolean;
  sortOrder: number;
};

type Question = {
  id: string;
  slug: string;
  skill: string;
  difficulty: number;
  explanation: string;
  isOfficial: boolean;
  prompt: unknown;
  examLevel: {
    id: string;
    code: string;
    name: string;
    exam: {
      code: string;
      name: string;
    };
  };
  options: Option[];
};

type LevelOption = {
  id: string;
  code: string;
  name: string;
  exam: {
    code: string;
    name: string;
  };
};

export function QuestionManager({
  initialQuestions,
  levels,
}: {
  initialQuestions: Question[];
  levels: LevelOption[];
}) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [search, setSearch] = useState("");
  const [selectedExam, setSelectedExam] = useState("ALL");
  const [selectedLevelId, setSelectedLevelId] = useState("ALL");
  const [selectedSkill, setSelectedSkill] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // New question form state
  const [newLevelId, setNewLevelId] = useState(levels[0]?.id ?? "");
  const [newSkill, setNewSkill] = useState<SkillType>("VOCABULARY");
  const [newDifficulty, setNewDifficulty] = useState(1);
  const [newPrompt, setNewPrompt] = useState("");
  const [newContext, setNewContext] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newAnswerIndex, setNewAnswerIndex] = useState(0);
  const [newExplanation, setNewExplanation] = useState("");
  const [newIsOfficial, setNewIsOfficial] = useState(false);

  // Filter questions
  const filtered = questions.filter((q) => {
    if (selectedExam !== "ALL" && q.examLevel.exam.code !== selectedExam) return false;
    if (selectedLevelId !== "ALL" && q.examLevel.id !== selectedLevelId) return false;
    if (selectedSkill !== "ALL" && q.skill !== selectedSkill) return false;

    if (search.trim()) {
      const qText =
        typeof q.prompt === "object" && q.prompt !== null && "text" in q.prompt
          ? String(q.prompt.text).toLowerCase()
          : "";
      const expl = q.explanation.toLowerCase();
      const term = search.toLowerCase();
      if (!qText.includes(term) && !expl.includes(term)) return false;
    }

    return true;
  });

  const availableExams = Array.from(new Set(levels.map((l) => l.exam.code)));
  const availableLevels =
    selectedExam === "ALL"
      ? levels
      : levels.filter((l) => l.exam.code === selectedExam);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete question");
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete question");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    const validOptions = newOptions.filter((opt) => opt.trim().length > 0);
    if (validOptions.length < 2) {
      setCreateError("Please provide at least 2 options.");
      setCreating(false);
      return;
    }

    if (newAnswerIndex >= validOptions.length) {
      setCreateError("Selected correct answer is out of range.");
      setCreating(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examLevelId: newLevelId,
          skill: newSkill,
          difficulty: Number(newDifficulty),
          prompt: newPrompt,
          context: newContext.trim() || undefined,
          options: validOptions,
          answerIndex: newAnswerIndex,
          explanation: newExplanation,
          isOfficial: newIsOfficial,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create question");
      }

      setQuestions((prev) => [data, ...prev]);
      setModalOpen(false);
      // Reset form
      setNewPrompt("");
      setNewContext("");
      setNewOptions(["", "", "", ""]);
      setNewAnswerIndex(0);
      setNewExplanation("");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create question");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="app-title-row">
        <div>
          <h1>Question Bank</h1>
          <p>
            Manage curated multiple-choice items, level mappings, and pedagogical explanations.
          </p>
        </div>
        <button
          type="button"
          className="button"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={16} />
          <span>New Question</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-filter-bar panel">
        <div className="admin-search-wrap">
          <Search size={16} className="admin-search-icon" />
          <input
            type="search"
            placeholder="Search prompt, passage, or explanation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="admin-filter-group">
          <select
            value={selectedExam}
            onChange={(e) => {
              setSelectedExam(e.target.value);
              setSelectedLevelId("ALL");
            }}
            className="admin-select"
          >
            <option value="ALL">All Exams</option>
            {availableExams.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>

          <select
            value={selectedLevelId}
            onChange={(e) => setSelectedLevelId(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">All Levels</option>
            {availableLevels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.exam.code} {lvl.code}
              </option>
            ))}
          </select>

          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">All Skills</option>
            {SKILL_TYPES.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-filter-count">
          Showing <strong>{filtered.length}</strong> of {questions.length}
        </div>
      </div>

      {/* Question List */}
      <div className="admin-question-list">
        {filtered.length > 0 ? (
          filtered.map((q) => {
            const promptText =
              typeof q.prompt === "object" && q.prompt !== null && "text" in q.prompt
                ? String(q.prompt.text)
                : "Untitled question prompt";
            const contextText =
              typeof q.prompt === "object" && q.prompt !== null && "context" in q.prompt
                ? String(q.prompt.context)
                : null;

            return (
              <article key={q.id} className="panel admin-q-card">
                <div className="admin-q-header">
                  <div className="admin-q-tags">
                    <span className="level-tag">
                      {q.examLevel.exam.code} {q.examLevel.code}
                    </span>
                    <span className="admin-skill-pill">{q.skill}</span>
                    <span className="admin-diff-pill">Diff {q.difficulty}</span>
                    {q.isOfficial ? (
                      <span className="admin-official-badge">Official</span>
                    ) : (
                      <span className="admin-original-badge">Original</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="admin-icon-btn danger"
                    title="Delete question"
                    onClick={() => handleDelete(q.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {contextText && (
                  <blockquote className="admin-q-context">{contextText}</blockquote>
                )}

                <h3 className="admin-q-prompt">{promptText}</h3>

                <div className="admin-q-options-grid">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`admin-q-option${opt.isCorrect ? " is-correct" : ""}`}
                    >
                      <span className="admin-opt-letter">{opt.label}</span>
                      <span className="admin-opt-text">
                        {typeof opt.content === "object" && opt.content !== null && "text" in opt.content
                          ? String(opt.content.text)
                          : ""}
                      </span>
                      {opt.isCorrect && (
                        <CheckCircle2 size={16} className="admin-correct-icon" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="admin-q-explanation">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              </article>
            );
          })
        ) : (
          <div className="panel empty-state" style={{ padding: "3rem", textAlign: "center" }}>
            <p>No questions match the selected filters.</p>
          </div>
        )}
      </div>

      {/* New Question Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>Add New Question</h2>
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
                <div className="field">
                  <label htmlFor="q-level">Target Level</label>
                  <select
                    id="q-level"
                    value={newLevelId}
                    onChange={(e) => setNewLevelId(e.target.value)}
                    required
                  >
                    {levels.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.exam.code} — {lvl.name} ({lvl.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="q-skill">Skill Type</label>
                  <select
                    id="q-skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value as SkillType)}
                    required
                  >
                    {SKILL_TYPES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="q-prompt">Question Prompt</label>
                  <textarea
                    id="q-prompt"
                    rows={2}
                    placeholder="Enter the question sentence, task instructions, or blank fill-in..."
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    required
                    className="admin-textarea"
                  />
                </div>

                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="q-context">Reading Context / Passage (Optional)</label>
                  <textarea
                    id="q-context"
                    rows={2}
                    placeholder="Optional reading snippet or dialogue context..."
                    value={newContext}
                    onChange={(e) => setNewContext(e.target.value)}
                    className="admin-textarea"
                  />
                </div>

                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label>Answer Options (Select the correct answer radio button)</label>
                  <div className="admin-options-builder">
                    {newOptions.map((opt, idx) => (
                      <div key={idx} className="admin-option-input-row">
                        <label className="admin-radio-label">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={newAnswerIndex === idx}
                            onChange={() => setNewAnswerIndex(idx)}
                          />
                          <span>Option {String.fromCharCode(65 + idx)}</span>
                        </label>
                        <input
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                          value={opt}
                          onChange={(e) => {
                            const copy = [...newOptions];
                            copy[idx] = e.target.value;
                            setNewOptions(copy);
                          }}
                          required={idx < 2}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="q-expl">Pedagogical Explanation</label>
                  <textarea
                    id="q-expl"
                    rows={2}
                    placeholder="Explain why this answer is correct and what grammatical/vocabulary rule applies..."
                    value={newExplanation}
                    onChange={(e) => setNewExplanation(e.target.value)}
                    required
                    className="admin-textarea"
                  />
                </div>

                <div className="field">
                  <label htmlFor="q-diff">Difficulty Level (1 = foundational, 5 = master)</label>
                  <select
                    id="q-diff"
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(Number(e.target.value))}
                  >
                    <option value={1}>1 - Foundational</option>
                    <option value={2}>2 - Easy</option>
                    <option value={3}>3 - Intermediate</option>
                    <option value={4}>4 - Advanced</option>
                    <option value={5}>5 - Mastery</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="q-official">Source Categorization</label>
                  <select
                    id="q-official"
                    value={newIsOfficial ? "true" : "false"}
                    onChange={(e) => setNewIsOfficial(e.target.value === "true")}
                  >
                    <option value="false">Original LinguaCamp Practice</option>
                    <option value="true">Official Syllabus Sample</option>
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
                  {creating ? "Saving Question..." : "Create Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
