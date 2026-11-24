"use client";

import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  Bot,
  CalendarRange,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Layers,
  ShieldCheck,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type FeatureCategory = "all" | "learning" | "ai-sim" | "admin";

const CATEGORIES: { id: FeatureCategory; label: string }[] = [
  { id: "all", label: "All Capabilities" },
  { id: "learning", label: "Learning & Practice" },
  { id: "ai-sim", label: "AI & Simulations" },
  { id: "admin", label: "Educator & Admin" },
];

export function LandingFeaturesShowcase() {
  const [activeTab, setActiveTab] = useState<FeatureCategory>("all");

  return (
    <div className="features-showcase site-shell">
      {/* Section Header */}
      <div className="features-showcase-header" data-motion="fade-up">
        <div className="features-badge">
          <span className="features-badge-dot" aria-hidden="true" />
          <span>Platform Capabilities</span>
        </div>
        <h2 className="section-title">
          Engineered for first-attempt certification success.
        </h2>
        <p className="section-intro">
          From AI-driven conversation partners and official timed mock simulations to adaptive backward-scheduled study plans and enterprise admin telemetry — every feature is purpose-built to get you certified.
        </p>

        {/* Filter Navigation */}
        <div className="features-tab-strip" role="tablist" aria-label="Feature categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeTab === cat.id}
              className={`features-tab-btn${activeTab === cat.id ? " active" : ""}`}
              onClick={() => setActiveTab(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="features-grid">
        {/* 1. AI Language Tutor */}
        {(activeTab === "all" || activeTab === "ai-sim") && (
          <article
            className="feature-card feature-card-ai"
            data-motion="fade-up"
            data-delay="40"
            data-motion-spotlight
          >
            <div className="feature-card-header">
              <div className="feature-icon-box feature-icon-purple">
                <Sparkles size={20} />
              </div>
              <span className="feature-category-pill">AI &amp; Conversational Mastery</span>
            </div>

            <div className="feature-card-body">
              <h3>Real-Time Conversational AI Tutor</h3>
              <p>
                Engage in authentic speaking and writing role-plays calibrated to CEFR and JLPT descriptors. Get immediate grammatical corrections, natural nuances, and level-matched dialogue prompts.
              </p>

              {/* Micro visual: Interactive Chat Simulation */}
              <div className="feature-micro-widget chat-widget">
                <div className="chat-bubble chat-user">
                  <span className="chat-sender">Student</span>
                  <p>昨日は雨だったので、映画を見に行きませんでした。</p>
                </div>
                <div className="chat-bubble chat-ai">
                  <div className="chat-ai-head">
                    <span className="chat-sender">
                      <Bot size={13} /> AI Language Tutor
                    </span>
                    <span className="chat-pill">JLPT N3 Grammar</span>
                  </div>
                  <p>
                    Excellent structure using <strong>ので</strong> for causation. To sound even more formal: <em>雨が降っていたため…</em>
                  </p>
                  <div className="chat-critique">
                    <CheckCircle2 size={13} className="text-emerald" />
                    <span>Accuracy: 98% · Natural Collocation</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-card-footer">
              <Link href="/tutor" className="feature-action-link">
                <span>Practice with AI Tutor</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </article>
        )}

        {/* 2. Official Timed Mock Simulations */}
        {(activeTab === "all" || activeTab === "ai-sim") && (
          <article
            className="feature-card feature-card-mock"
            data-motion="fade-up"
            data-delay="90"
            data-motion-spotlight
          >
            <div className="feature-card-header">
              <div className="feature-icon-box feature-icon-cyan">
                <Timer size={20} />
              </div>
              <span className="feature-category-pill">Exam Pressure Simulation</span>
            </div>

            <div className="feature-card-body">
              <h3>Official-Spec Timed Mock Exams</h3>
              <p>
                Rehearse under authentic test-day conditions. Includes strict section countdown timers, audio listening tracks, auto-grading, and comprehensive performance diagnostics.
              </p>

              {/* Micro visual: Mock HUD */}
              <div className="feature-micro-widget mock-widget">
                <div className="mock-hud-top">
                  <span className="level-tag">DELE B2 · Prueba 1</span>
                  <div className="mock-timer-chip">
                    <Clock size={13} />
                    <span>42:15 remaining</span>
                  </div>
                </div>
                <div className="mock-progress-track">
                  <div className="mock-progress-fill" style={{ width: "65%" }} />
                </div>
                <div className="mock-stats-row">
                  <div>
                    <span className="mock-stat-val">26 / 36</span>
                    <span className="mock-stat-label">Questions answered</span>
                  </div>
                  <div>
                    <span className="mock-stat-val text-emerald">82%</span>
                    <span className="mock-stat-label">Projected score</span>
                  </div>
                  <div>
                    <span className="mock-stat-val text-cyan">Section 2</span>
                    <span className="mock-stat-label">Comprensión lectora</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-card-footer">
              <Link href="/#mock-exams" className="feature-action-link">
                <span>Explore Mock Simulations</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </article>
        )}

        {/* 3. Backward-Scheduled Study Plans */}
        {(activeTab === "all" || activeTab === "learning") && (
          <article
            className="feature-card feature-card-plan"
            data-motion="fade-up"
            data-delay="140"
            data-motion-spotlight
          >
            <div className="feature-card-header">
              <div className="feature-icon-box feature-icon-amber">
                <CalendarRange size={20} />
              </div>
              <span className="feature-category-pill">Adaptive Pacing</span>
            </div>

            <div className="feature-card-body">
              <h3>Backward-Scheduled Study Plans</h3>
              <p>
                Lock in your target exam date and daily study budget. The engine calculates an exact daily task queue that paces your preparation from foundations all the way to final review.
              </p>

              {/* Micro visual: Daily Schedule Timeline */}
              <div className="feature-micro-widget plan-widget">
                <div className="plan-queue-item active">
                  <div className="plan-queue-status">
                    <span className="plan-dot active" />
                    <strong>Today · 25 min</strong>
                  </div>
                  <span className="plan-task-name">JLPT N2 Grammar Review + 12 Kanji items</span>
                </div>
                <div className="plan-queue-item">
                  <div className="plan-queue-status">
                    <span className="plan-dot" />
                    <span>Tomorrow · 30 min</span>
                  </div>
                  <span className="plan-task-name">Reading Passage: Business Correspondence</span>
                </div>
                <div className="plan-readiness-bar">
                  <div className="plan-readiness-label">
                    <span>Preparation Readiness</span>
                    <strong>76% on track</strong>
                  </div>
                  <div className="plan-bar-track">
                    <div className="plan-bar-fill" style={{ width: "76%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-card-footer">
              <Link href="/#preview" className="feature-action-link">
                <span>Generate Your Custom Plan</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </article>
        )}

        {/* 4. Multi-Skill Adaptive Question Bank */}
        {(activeTab === "all" || activeTab === "learning") && (
          <article
            className="feature-card feature-card-bank"
            data-motion="fade-up"
            data-delay="190"
            data-motion-spotlight
          >
            <div className="feature-card-header">
              <div className="feature-icon-box feature-icon-emerald">
                <Layers size={20} />
              </div>
              <span className="feature-category-pill">13 Exam Levels</span>
            </div>

            <div className="feature-card-body">
              <h3>Curated Question Bank &amp; Explanations</h3>
              <p>
                Thousands of original, exam-matched questions across JLPT (N5–N1), DELE (A1–C2), and DALF (C1–C2). Every item includes verified rationale and distractor analysis.
              </p>

              {/* Micro visual: Question preview snippet */}
              <div className="feature-micro-widget question-widget">
                <div className="q-preview-header">
                  <span className="level-tag">DALF C1 · Syntaxe</span>
                  <span className="q-skill-badge">Grammaire Avancée</span>
                </div>
                <p className="q-preview-prompt">
                  « Quoiqu’il ___ tous ses efforts, il ne parvint pas à convaincre l’auditoire. »
                </p>
                <div className="q-preview-choices">
                  <span className="q-choice correct">✓ ait fait (Subjonctif)</span>
                  <span className="q-choice">a fait</span>
                  <span className="q-choice">ferait</span>
                </div>
                <div className="q-rationale-box">
                  <strong>Rationale:</strong> « Quoique » régit obligatoirement le subjonctif pour exprimer la concession.
                </div>
              </div>
            </div>

            <div className="feature-card-footer">
              <Link href="/#practice" className="feature-action-link">
                <span>Explore Question Bank</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </article>
        )}

        {/* 5. Comprehensive Curriculum Library */}
        {(activeTab === "all" || activeTab === "learning") && (
          <article
            className="feature-card feature-card-curriculum"
            data-motion="fade-up"
            data-delay="240"
            data-motion-spotlight
          >
            <div className="feature-card-header">
              <div className="feature-icon-box feature-icon-indigo">
                <BookOpenCheck size={20} />
              </div>
              <span className="feature-category-pill">Structured Syllabus</span>
            </div>

            <div className="feature-card-body">
              <h3>Curriculum Modules &amp; Skill Units</h3>
              <p>
                Systematic, self-paced learning units organized strictly by official certification blueprints. Deep-dive into kanji patterns, subjunctive modes, discourse connectors, and reading strategies.
              </p>

              {/* Micro visual: Curriculum Unit Progress */}
              <div className="feature-micro-widget curriculum-widget">
                <div className="curr-unit-card">
                  <div className="curr-unit-top">
                    <span className="curr-num">Module 03</span>
                    <span className="curr-badge text-emerald">4/5 Units Complete</span>
                  </div>
                  <strong className="curr-title">Subjunctive in Complex Relative Clauses</strong>
                  <div className="curr-checklist">
                    <div className="curr-check-item done">
                      <CheckCircle2 size={13} />
                      <span>Volition &amp; Emotion Triggers</span>
                    </div>
                    <div className="curr-check-item done">
                      <CheckCircle2 size={13} />
                      <span>Concessive Connectors in Writing</span>
                    </div>
                    <div className="curr-check-item next">
                      <Zap size={13} />
                      <span>Next: Synthesis &amp; Production Tasks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-card-footer">
              <Link href="/library" className="feature-action-link">
                <span>Browse Study Library</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </article>
        )}

        {/* 6. Institutional Admin & RBAC Suite */}
        {(activeTab === "all" || activeTab === "admin") && (
          <article
            className="feature-card feature-card-admin"
            data-motion="fade-up"
            data-delay="290"
            data-motion-spotlight
          >
            <div className="feature-card-header">
              <div className="feature-icon-box feature-icon-slate">
                <ShieldCheck size={20} />
              </div>
              <span className="feature-category-pill">Educator &amp; Admin Suite</span>
            </div>

            <div className="feature-card-body">
              <h3>Institution-Grade Admin Dashboard</h3>
              <p>
                Full platform administration with role-based access control (Admin, Instructor, Student), custom question authoring, candidate attempt logs, and real-time pass-readiness analytics.
              </p>

              {/* Micro visual: Admin HUD */}
              <div className="feature-micro-widget admin-widget">
                <div className="admin-hud-bar">
                  <div className="admin-status-indicator">
                    <span className="admin-beacon" />
                    <span>Live Telemetry Active</span>
                  </div>
                  <span className="admin-role-chip">ADMIN · Full Access</span>
                </div>
                <div className="admin-stats-mini-grid">
                  <div className="admin-stat-mini">
                    <strong>13 Levels</strong>
                    <span>JLPT · DELE · DALF</span>
                  </div>
                  <div className="admin-stat-mini">
                    <strong>Atomic RBAC</strong>
                    <span>Instant role elevation</span>
                  </div>
                </div>
                <div className="admin-log-snippet">
                  <Activity size={13} className="text-cyan" />
                  <span>Latest: Candidate #418 completed N2 Mock (86% accuracy)</span>
                </div>
              </div>
            </div>

            <div className="feature-card-footer">
              <Link href="/admin" className="feature-action-link">
                <span>Open Admin Portal</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </article>
        )}
      </div>

      {/* Bottom Key Pillars Banner */}
      <div className="features-footer-banner" data-motion="fade-up">
        <div className="features-stat-col">
          <strong>3 Programs</strong>
          <span>JLPT, DELE &amp; DALF</span>
        </div>
        <div className="features-stat-divider" aria-hidden="true" />
        <div className="features-stat-col">
          <strong>13 Levels</strong>
          <span>N5–N1 &amp; A1–C2 standard</span>
        </div>
        <div className="features-stat-divider" aria-hidden="true" />
        <div className="features-stat-col">
          <strong>Official Specs</strong>
          <span>Timed section clocks</span>
        </div>
        <div className="features-stat-divider" aria-hidden="true" />
        <div className="features-stat-col">
          <strong>Honest Tracking</strong>
          <span>Uncompromised readiness scores</span>
        </div>
      </div>
    </div>
  );
}
