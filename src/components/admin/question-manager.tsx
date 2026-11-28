"use client";

import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileCode,
  Filter,
  Layers,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { AudioSpeakerButton } from "@/components/audio-speaker-button";

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

const SAMPLE_IMPORT_JSON = [
  {
    examCode: "JLPT",
    levelCode: "N3",
    skill: "GRAMMAR",
    prompt: "来週の発表の準備は、ほとんど終わった＿＿だ。",
    context: "研究室での会話：発表準備の進捗状況を確認しています。",
    options: ["ばかり", "ところ", "わけ", "はず"],
    answerIndex: 1,
    explanation: "「～たところだ」indicates that an action has just been finished. ほとんど終わったところだ = We are just about finished with preparations.",
    difficulty: 3,
    isOfficial: true,
  },
  {
    examCode: "DELE",
    levelCode: "B2",
    skill: "GRAMMAR",
    prompt: "Es imprescindible que los candidatos ______ a tiempo para la entrevista.",
    context: "Instrucciones formales emitidas por el comité de selección.",
    options: ["llegan", "lleguen", "llegarán", "habrán llegado"],
    answerIndex: 1,
    explanation: "The impersonal formula of necessity 'Es imprescindible que...' requires the present subjunctive (lleguen).",
    difficulty: 3,
    isOfficial: true,
  },
  {
    examCode: "DALF",
    levelCode: "C1",
    skill: "READING",
    prompt: "Dans ce contexte, quelle est la fonction discursive du connecteur « néanmoins » ?",
    context: "Le modèle économique actuel a incontestablement stimulé la production industrielle ; néanmoins, son coût écologique s'avère désormais insoutenable à long terme.",
    options: [
      "Introduire une relation de cause à effet",
      "Marquer une concession restrictive",
      "Exemplifier un fait historique",
      "Conclure une démonstration formelle",
    ],
    answerIndex: 1,
    explanation: "« Néanmoins » is an adversative / concessive coordinator that introduces a restriction while acknowledging the premise.",
    difficulty: 4,
    isOfficial: true,
  },
];

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

  // New Question Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newLevelId, setNewLevelId] = useState(levels[0]?.id ?? "");
  const [newSkill, setNewSkill] = useState<SkillType>("VOCABULARY");
  const [newDifficulty, setNewDifficulty] = useState(1);
  const [newPrompt, setNewPrompt] = useState("");
  const [newContext, setNewContext] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newAnswerIndex, setNewAnswerIndex] = useState(0);
  const [newExplanation, setNewExplanation] = useState("");
  const [newIsOfficial, setNewIsOfficial] = useState(false);

  // Edit Question Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingSaving, setEditingSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editLevelId, setEditLevelId] = useState("");
  const [editSkill, setEditSkill] = useState<SkillType>("VOCABULARY");
  const [editDifficulty, setEditDifficulty] = useState(1);
  const [editPrompt, setEditPrompt] = useState("");
  const [editContext, setEditContext] = useState("");
  const [editOptions, setEditOptions] = useState<string[]>(["", "", "", ""]);
  const [editAnswerIndex, setEditAnswerIndex] = useState(0);
  const [editExplanation, setEditExplanation] = useState("");
  const [editIsOfficial, setEditIsOfficial] = useState(false);

  // Bulk Import Modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    errors?: string[];
  } | null>(null);

  // Live Interactive Preview Modal state
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [previewSelectedOption, setPreviewSelectedOption] = useState<number | null>(null);
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

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
      const ctxText =
        typeof q.prompt === "object" && q.prompt !== null && "context" in q.prompt
          ? String(q.prompt.context).toLowerCase()
          : "";
      const expl = q.explanation.toLowerCase();
      const term = search.toLowerCase();
      if (!qText.includes(term) && !ctxText.includes(term) && !expl.includes(term)) {
        return false;
      }
    }

    return true;
  });

  const availableExams = Array.from(new Set(levels.map((l) => l.exam.code)));
  const availableLevels =
    selectedExam === "ALL"
      ? levels
      : levels.filter((l) => l.exam.code === selectedExam);

  // Breakdown statistics
  const examCounts = availableExams.reduce((acc, code) => {
    acc[code] = questions.filter((q) => q.examLevel.exam.code === code).length;
    return acc;
  }, {} as Record<string, number>);

  const officialCount = questions.filter((q) => q.isOfficial).length;

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently delete this question?")) return;
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete question");
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete question");
    }
  }

  function handleOpenCreate(prefill?: {
    levelId?: string;
    skill?: SkillType;
    difficulty?: number;
    prompt?: string;
    context?: string;
    options?: string[];
    answerIndex?: number;
    explanation?: string;
    isOfficial?: boolean;
  }) {
    setNewLevelId(prefill?.levelId ?? levels[0]?.id ?? "");
    setNewSkill(prefill?.skill ?? "VOCABULARY");
    setNewDifficulty(prefill?.difficulty ?? 1);
    setNewPrompt(prefill?.prompt ?? "");
    setNewContext(prefill?.context ?? "");
    setNewOptions(prefill?.options ?? ["", "", "", ""]);
    setNewAnswerIndex(prefill?.answerIndex ?? 0);
    setNewExplanation(prefill?.explanation ?? "");
    setNewIsOfficial(prefill?.isOfficial ?? false);
    setCreateError("");
    setModalOpen(true);
  }

  function handleDuplicate(q: Question) {
    const promptText =
      typeof q.prompt === "object" && q.prompt !== null && "text" in q.prompt
        ? String(q.prompt.text)
        : "";
    const contextText =
      typeof q.prompt === "object" && q.prompt !== null && "context" in q.prompt
        ? String(q.prompt.context)
        : "";

    const opts = q.options.map((opt) =>
      typeof opt.content === "object" && opt.content !== null && "text" in opt.content
        ? String(opt.content.text)
        : ""
    );
    const correctIdx = q.options.findIndex((opt) => opt.isCorrect);

    handleOpenCreate({
      levelId: q.examLevel.id,
      skill: q.skill as SkillType,
      difficulty: q.difficulty,
      prompt: `${promptText} (Variant)`,
      context: contextText,
      options: opts.length >= 2 ? opts : ["", "", "", ""],
      answerIndex: correctIdx >= 0 ? correctIdx : 0,
      explanation: q.explanation,
      isOfficial: q.isOfficial,
    });
  }

  function handleOpenEdit(q: Question) {
    setEditingQuestion(q);
    setEditLevelId(q.examLevel.id);
    setEditSkill(q.skill as SkillType);
    setEditDifficulty(q.difficulty);

    const promptText =
      typeof q.prompt === "object" && q.prompt !== null && "text" in q.prompt
        ? String(q.prompt.text)
        : "";
    const contextText =
      typeof q.prompt === "object" && q.prompt !== null && "context" in q.prompt
        ? String(q.prompt.context)
        : "";

    setEditPrompt(promptText);
    setEditContext(contextText);

    const opts = q.options.map((opt) =>
      typeof opt.content === "object" && opt.content !== null && "text" in opt.content
        ? String(opt.content.text)
        : ""
    );
    setEditOptions(opts.length >= 2 ? opts : ["", "", "", ""]);

    const correctIdx = q.options.findIndex((opt) => opt.isCorrect);
    setEditAnswerIndex(correctIdx >= 0 ? correctIdx : 0);
    setEditExplanation(q.explanation);
    setEditIsOfficial(q.isOfficial);
    setEditError("");
    setEditModalOpen(true);
  }

  function handleOpenPreview(q: Question) {
    setPreviewQuestion(q);
    setPreviewSelectedOption(null);
    setPreviewSubmitted(false);
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
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create question");
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingQuestion) return;

    setEditingSaving(true);
    setEditError("");

    const validOptions = editOptions.filter((opt) => opt.trim().length > 0);
    if (validOptions.length < 2) {
      setEditError("Please provide at least 2 options.");
      setEditingSaving(false);
      return;
    }

    if (editAnswerIndex >= validOptions.length) {
      setEditError("Selected correct answer is out of range.");
      setEditingSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingQuestion.id,
          examLevelId: editLevelId,
          skill: editSkill,
          difficulty: Number(editDifficulty),
          prompt: editPrompt,
          context: editContext.trim() || null,
          options: validOptions,
          answerIndex: editAnswerIndex,
          explanation: editExplanation,
          isOfficial: editIsOfficial,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update question");
      }

      setQuestions((prev) => prev.map((q) => (q.id === data.id ? data : q)));
      setEditModalOpen(false);
      setEditingQuestion(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update question");
    } finally {
      setEditingSaving(false);
    }
  }

  async function handleBulkImport(e: React.FormEvent) {
    e.preventDefault();
    setImporting(true);
    setImportResult(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(importJsonText);
    } catch {
      setImportResult({
        success: false,
        message: "Invalid JSON format. Please ensure valid JSON array or object.",
      });
      setImporting(false);
      return;
    }

    const payload = Array.isArray(parsed) ? { questions: parsed } : parsed;

    try {
      const res = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Bulk import failed");
      }

      setImportResult({
        success: true,
        message: `Import complete! Successfully added ${data.createdCount} question${
          data.createdCount === 1 ? "" : "s"
        }.`,
        errors: data.errors && data.errors.length > 0 ? data.errors : undefined,
      });

      // Refresh question list from server
      const refreshRes = await fetch("/api/admin/questions");
      if (refreshRes.ok) {
        const refreshedList = await refreshRes.json();
        setQuestions(refreshedList);
      }
    } catch (err) {
      setImportResult({
        success: false,
        message: err instanceof Error ? err.message : "Failed to import questions",
      });
    } finally {
      setImporting(false);
    }
  }

  return (
    <div>
      {/* Title & Action Row */}
      <div className="app-title-row" style={{ alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span>Question Bank</span>
            <span className="admin-portal-badge" style={{ verticalAlign: "middle" }}>
              Operational Portal
            </span>
          </h1>
          <p>
            Curate syllabus-mapped test items, simulate student test views, update options, and bulk import question datasets.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => {
              setImportJsonText("");
              setImportResult(null);
              setImportModalOpen(true);
            }}
            title="Bulk import questions from JSON"
          >
            <Upload size={16} />
            <span>Bulk Import JSON</span>
          </button>

          <button
            type="button"
            className="button"
            onClick={() => handleOpenCreate()}
          >
            <Plus size={16} />
            <span>New Question</span>
          </button>
        </div>
      </div>

      {/* Operational Stats Strip */}
      <div className="admin-metric-strip panel" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
        <div>
          <span className="admin-metric-label">Total Questions</span>
          <strong className="admin-metric-val" style={{ fontSize: "1.6rem" }}>{questions.length}</strong>
          <span className="admin-metric-sub">{officialCount} official syllabus</span>
        </div>
        {availableExams.map((exam) => (
          <div key={exam}>
            <span className="admin-metric-label">{exam} Exam</span>
            <strong className="admin-metric-val" style={{ fontSize: "1.6rem" }}>{examCounts[exam] ?? 0}</strong>
            <span className="admin-metric-sub">items in bank</span>
          </div>
        ))}
      </div>

      {/* Quick Exam Filter Bar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
        <button
          type="button"
          className={`admin-mode-pill ${selectedExam === "ALL" ? "active" : ""}`}
          style={{
            background: selectedExam === "ALL" ? "var(--indigo)" : "white",
            color: selectedExam === "ALL" ? "white" : "var(--ink)",
            border: "1px solid var(--line)",
            cursor: "pointer",
            fontWeight: 650,
          }}
          onClick={() => {
            setSelectedExam("ALL");
            setSelectedLevelId("ALL");
          }}
        >
          All Exams ({questions.length})
        </button>
        {availableExams.map((exam) => (
          <button
            key={exam}
            type="button"
            className={`admin-mode-pill ${selectedExam === exam ? "active" : ""}`}
            style={{
              background: selectedExam === exam ? "var(--indigo)" : "white",
              color: selectedExam === exam ? "white" : "var(--ink)",
              border: "1px solid var(--line)",
              cursor: "pointer",
              fontWeight: 650,
            }}
            onClick={() => {
              setSelectedExam(exam);
              setSelectedLevelId("ALL");
            }}
          >
            {exam} ({examCounts[exam] ?? 0})
          </button>
        ))}
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
            value={selectedLevelId}
            onChange={(e) => setSelectedLevelId(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">All Levels ({selectedExam})</option>
            {availableLevels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.exam.code} {lvl.code} — {lvl.name}
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

                  {/* Operational Action Buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <button
                      type="button"
                      className="admin-icon-btn"
                      title="Preview question simulation"
                      onClick={() => handleOpenPreview(q)}
                    >
                      <Eye size={15} />
                    </button>

                    <button
                      type="button"
                      className="admin-icon-btn"
                      title="Duplicate question variant"
                      onClick={() => handleDuplicate(q)}
                    >
                      <Copy size={15} />
                    </button>

                    <button
                      type="button"
                      className="admin-icon-btn"
                      title="Edit question & options"
                      onClick={() => handleOpenEdit(q)}
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      className="admin-icon-btn danger"
                      title="Delete question"
                      onClick={() => handleDelete(q.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
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
                        {typeof opt.content === "object" &&
                        opt.content !== null &&
                        "text" in opt.content
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
                    placeholder="Optional reading snippet, dialogue, or background context..."
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

      {/* Edit Question Modal */}
      {editModalOpen && editingQuestion && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <div>
                <h2>Edit Question</h2>
                <span className="admin-cell-sub">
                  ID: {editingQuestion.id} • Slug: {editingQuestion.slug}
                </span>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingQuestion(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="admin-form">
              {editError && (
                <div className="form-error" role="alert">
                  <AlertCircle size={16} />
                  <span>{editError}</span>
                </div>
              )}

              <div className="preview-form" style={{ marginTop: 0 }}>
                <div className="field">
                  <label htmlFor="edit-q-level">Target Level</label>
                  <select
                    id="edit-q-level"
                    value={editLevelId}
                    onChange={(e) => setEditLevelId(e.target.value)}
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
                  <label htmlFor="edit-q-skill">Skill Type</label>
                  <select
                    id="edit-q-skill"
                    value={editSkill}
                    onChange={(e) => setEditSkill(e.target.value as SkillType)}
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
                  <label htmlFor="edit-q-prompt">Question Prompt</label>
                  <textarea
                    id="edit-q-prompt"
                    rows={2}
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    required
                    className="admin-textarea"
                  />
                </div>

                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="edit-q-context">Reading Context / Passage (Optional)</label>
                  <textarea
                    id="edit-q-context"
                    rows={2}
                    placeholder="Optional reading snippet or passage context..."
                    value={editContext}
                    onChange={(e) => setEditContext(e.target.value)}
                    className="admin-textarea"
                  />
                </div>

                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label>Answer Options (Select the correct answer radio button)</label>
                  <div className="admin-options-builder">
                    {editOptions.map((opt, idx) => (
                      <div key={idx} className="admin-option-input-row">
                        <label className="admin-radio-label">
                          <input
                            type="radio"
                            name="editCorrectAnswer"
                            checked={editAnswerIndex === idx}
                            onChange={() => setEditAnswerIndex(idx)}
                          />
                          <span>Option {String.fromCharCode(65 + idx)}</span>
                        </label>
                        <input
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                          value={opt}
                          onChange={(e) => {
                            const copy = [...editOptions];
                            copy[idx] = e.target.value;
                            setEditOptions(copy);
                          }}
                          required={idx < 2}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="edit-q-expl">Pedagogical Explanation</label>
                  <textarea
                    id="edit-q-expl"
                    rows={2}
                    value={editExplanation}
                    onChange={(e) => setEditExplanation(e.target.value)}
                    required
                    className="admin-textarea"
                  />
                </div>

                <div className="field">
                  <label htmlFor="edit-q-diff">Difficulty Level</label>
                  <select
                    id="edit-q-diff"
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(Number(e.target.value))}
                  >
                    <option value={1}>1 - Foundational</option>
                    <option value={2}>2 - Easy</option>
                    <option value={3}>3 - Intermediate</option>
                    <option value={4}>4 - Advanced</option>
                    <option value={5}>5 - Mastery</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="edit-q-official">Source Categorization</label>
                  <select
                    id="edit-q-official"
                    value={editIsOfficial ? "true" : "false"}
                    onChange={(e) => setEditIsOfficial(e.target.value === "true")}
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
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingQuestion(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="button" disabled={editingSaving}>
                  {editingSaving ? "Updating Question..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import JSON Modal */}
      {importModalOpen && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card" style={{ maxWidth: "800px" }}>
            <div className="admin-modal-header">
              <div>
                <h2>Bulk Import Questions</h2>
                <span className="admin-cell-sub">
                  Batch inject verified questions with level mapping, option sorting, and explanations.
                </span>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setImportModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBulkImport} className="admin-form">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label htmlFor="import-json" style={{ fontWeight: 650, fontSize: "0.88rem" }}>
                  Questions JSON Payload (Array of Question Objects)
                </label>
                <button
                  type="button"
                  className="button button-secondary"
                  style={{ minHeight: "32px", padding: "0.25rem 0.65rem", fontSize: "0.78rem" }}
                  onClick={() => {
                    setImportJsonText(JSON.stringify(SAMPLE_IMPORT_JSON, null, 2));
                  }}
                >
                  <FileCode size={14} />
                  <span>Load Sample Questions</span>
                </button>
              </div>

              <textarea
                id="import-json"
                rows={12}
                placeholder="[\n  {\n    &quot;examCode&quot;: &quot;JLPT&quot;,\n    &quot;levelCode&quot;: &quot;N5&quot;,\n    &quot;skill&quot;: &quot;VOCABULARY&quot;,\n    &quot;prompt&quot;: &quot;...&quot;,\n    &quot;options&quot;: [&quot;opt1&quot;, &quot;opt2&quot;],\n    &quot;answerIndex&quot;: 0,\n    &quot;explanation&quot;: &quot;...&quot;\n  }\n]"
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                required
                className="admin-textarea"
                style={{ fontFamily: "monospace", fontSize: "0.82rem" }}
              />

              {importResult && (
                <div
                  style={{
                    marginTop: "0.85rem",
                    padding: "0.85rem 1rem",
                    borderRadius: "8px",
                    background: importResult.success ? "#eefaf3" : "#fdeaea",
                    color: importResult.success ? "#166534" : "#991b1b",
                    border: `1px solid ${importResult.success ? "#bbf7d0" : "#fecaca"}`,
                    fontSize: "0.86rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontWeight: 700 }}>
                    {importResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
                    <span>{importResult.message}</span>
                  </div>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <ul style={{ margin: "0.45rem 0 0 1.25rem", padding: 0, fontSize: "0.8rem" }}>
                      {importResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setImportModalOpen(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="button"
                  disabled={importing || !importJsonText.trim()}
                >
                  {importing ? "Importing Questions..." : "Execute Bulk Import"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Question Interactive Preview Modal */}
      {previewQuestion && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card" style={{ maxWidth: "680px" }}>
            <div className="admin-modal-header">
              <div>
                <h2>Question Student Simulation</h2>
                <div style={{ display: "flex", gap: "0.45rem", marginTop: "0.25rem" }}>
                  <span className="level-tag">
                    {previewQuestion.examLevel.exam.code} {previewQuestion.examLevel.code}
                  </span>
                  <span className="admin-skill-pill">{previewQuestion.skill}</span>
                  <span className="admin-diff-pill">Difficulty {previewQuestion.difficulty}</span>
                </div>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setPreviewQuestion(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "0.5rem 0" }}>
              {typeof previewQuestion.prompt === "object" &&
                previewQuestion.prompt !== null &&
                "context" in previewQuestion.prompt && (
                  <div style={{ marginBottom: "1rem" }}>
                    <blockquote
                      style={{
                        margin: "0 0 0.45rem",
                        padding: "0.85rem 1rem",
                        borderRadius: "8px",
                        background: "var(--paper)",
                        borderLeft: "4px solid var(--indigo)",
                        fontSize: "0.92rem",
                        lineHeight: 1.5,
                        color: "var(--ink)",
                      }}
                    >
                      {String(previewQuestion.prompt.context)}
                    </blockquote>
                    <AudioSpeakerButton
                      text={String(previewQuestion.prompt.context)}
                      lang={previewQuestion.examLevel.exam.code}
                      size="xs"
                      variant="subtle"
                      label="Listen to context"
                    />
                  </div>
                )}

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, lineHeight: 1.4 }}>
                  {typeof previewQuestion.prompt === "object" &&
                  previewQuestion.prompt !== null &&
                  "text" in previewQuestion.prompt
                    ? String(previewQuestion.prompt.text)
                    : "Prompt"}
                </h3>
                <AudioSpeakerButton
                  text={
                    typeof previewQuestion.prompt === "object" &&
                    previewQuestion.prompt !== null &&
                    "text" in previewQuestion.prompt
                      ? String(previewQuestion.prompt.text)
                      : ""
                  }
                  lang={previewQuestion.examLevel.exam.code}
                  size="sm"
                  variant="pill"
                  label="Listen"
                />
              </div>

              <div style={{ display: "grid", gap: "0.65rem", marginBottom: "1.25rem" }}>
                {previewQuestion.options.map((opt, idx) => {
                  const isSelected = previewSelectedOption === idx;
                  const optText =
                    typeof opt.content === "object" &&
                    opt.content !== null &&
                    "text" in opt.content
                      ? String(opt.content.text)
                      : "";
                  let styleBorder = "1px solid var(--line)";
                  let styleBg = "white";
                  let styleColor = "var(--ink)";

                  if (previewSubmitted) {
                    if (opt.isCorrect) {
                      styleBorder = "2px solid #16a34a";
                      styleBg = "#f0fdf4";
                      styleColor = "#166534";
                    } else if (isSelected && !opt.isCorrect) {
                      styleBorder = "2px solid #dc2626";
                      styleBg = "#fef2f2";
                      styleColor = "#991b1b";
                    }
                  } else if (isSelected) {
                    styleBorder = "2px solid var(--indigo)";
                    styleBg = "rgba(14, 56, 53, 0.05)";
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={previewSubmitted}
                      onClick={() => setPreviewSelectedOption(idx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.85rem",
                        padding: "0.8rem 1rem",
                        borderRadius: "8px",
                        border: styleBorder,
                        background: styleBg,
                        color: styleColor,
                        textAlign: "left",
                        cursor: previewSubmitted ? "default" : "pointer",
                        transition: "all 140ms ease",
                      }}
                    >
                      <span
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 750,
                          fontSize: "0.82rem",
                          background: isSelected ? "var(--indigo)" : "#f1f3f5",
                          color: isSelected ? "white" : "var(--muted)",
                          flex: "none",
                        }}
                      >
                        {opt.label}
                      </span>
                      <span style={{ flex: 1, fontSize: "0.95rem" }}>
                        {optText}
                      </span>
                      <AudioSpeakerButton
                        text={optText}
                        lang={previewQuestion.examLevel.exam.code}
                        size="xs"
                        variant="subtle"
                        title={`Pronounce "${optText}"`}
                      />
                      {previewSubmitted && opt.isCorrect && (
                        <CheckCircle2 size={18} color="#16a34a" />
                      )}
                      {previewSubmitted && isSelected && !opt.isCorrect && (
                        <XCircle size={18} color="#dc2626" />
                      )}
                    </button>
                  );
                })}
              </div>

              {previewSubmitted && (
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "8px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    marginBottom: "1rem",
                  }}
                >
                  <strong style={{ display: "block", marginBottom: "0.35rem", color: "var(--ink)" }}>
                    {previewQuestion.options[previewSelectedOption ?? -1]?.isCorrect
                      ? "✅ Correct Answer!"
                      : "❌ Incorrect Selection"}
                  </strong>
                  <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.5 }}>
                    <strong>Pedagogical Rationale:</strong> {previewQuestion.explanation}
                  </p>
                </div>
              )}

              <div className="admin-modal-actions" style={{ marginTop: "1rem" }}>
                {!previewSubmitted ? (
                  <button
                    type="button"
                    className="button"
                    disabled={previewSelectedOption === null}
                    onClick={() => setPreviewSubmitted(true)}
                  >
                    Submit Simulated Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      setPreviewSelectedOption(null);
                      setPreviewSubmitted(false);
                    }}
                  >
                    <RotateCcw size={15} />
                    <span>Test Again</span>
                  </button>
                )}
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setPreviewQuestion(null)}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
