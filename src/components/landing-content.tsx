import {
  ArrowDownRight,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChartNoAxesColumnIncreasing,
  ClipboardCheck,
  Languages,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { HeroMotionStage } from "@/components/hero-motion-stage";
import { LandingMotionDirector } from "@/components/landing-motion-director";
import {
  MethodTimelineGraphic,
  SimulationClockBadge,
  SkillRadarGraphic,
} from "@/components/landing-motion-graphics";
import { PlanPreview } from "@/components/plan-preview";
import { LandingFeaturesShowcase } from "@/components/landing-features-showcase";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type ExamCard = {
  id: string;
  code: string;
  name: string;
  language: string;
  description: string;
  officialUrl: string;
  levels: { id: string; code: string; sections: { code: string; name: string; skill: string }[] }[];
};

const iconSize = 18;

const EXAM_BADGES: Record<string, string> = {
  JLPT: "5 Levels (N5 – N1)",
  DELE: "6 Levels (A1 – C2)",
  DALF: "2 Advanced Levels (C1 – C2)",
};

const EXAM_DESCRIPTIONS: Record<string, string> = {
  JLPT: "Master Kanji, grammar particles, reading passages, and audio listening modules aligned strictly with the official Japanese syllabus.",
  DELE: "Develop communicative fluency, subjunctive mastery, listening comprehension, and formal writing accredited by Instituto Cervantes.",
  DALF: "Rigorous academic French preparation focusing on synthesis, critical discourse analysis, and sophisticated argumentative registers.",
};

export function LandingContent({
  exams,
  featuredQuestion,
}: {
  exams: ExamCard[];
  featuredQuestion: {
    examName: string;
    levelCode: string;
    prompt: string;
    options: { id: string; text: string }[];
  } | null;
}) {
  return (
    <div data-landing-motion>
      <LandingMotionDirector />
      <SiteHeader />
      <main>
        {/* Figma Hero Section */}
        <section className="hero-band">
          <div className="hero site-shell">
            <div className="hero-eyebrow" data-motion="fade-up">
              <span className="hero-eyebrow-dot" aria-hidden="true" />
              <span>EXAM-FOCUSED PREPARATION</span>
            </div>

            <div className="hero-top">
              <h1 className="hero-headline">
                <span className="hero-line">Your journey to language mastery</span>{" "}
                <span className="hero-accent-word">
                  starts here
                  <svg
                    className="hero-accent-underline"
                    viewBox="0 0 220 14"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 9.5C58 3.2 152 2.4 217 8.2"
                      stroke="currentColor"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <HeroMotionStage />
            </div>

            <div className="hero-bottom">
              <p className="hero-copy">
                Exam-focused preparation for JLPT, DELE and DALF, paced around your target level, exam date and daily study time.
              </p>
              <div className="hero-actions">
                <Link className="button" href="/register">
                  Start learning today <ArrowRight aria-hidden="true" size={17} />
                </Link>
                <Link className="button button-secondary" href="#programs">
                  Explore our exams <ArrowDownRight aria-hidden="true" size={17} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Figma Programs Section ("One goal. Your language.") */}
        <section className="programs section" id="programs">
          <div className="site-shell">
            <div className="section-heading-row" data-motion="fade-up">
              <div>
                <span className="hero-eyebrow" style={{ marginBottom: "0.75rem" }}>
                  <span className="hero-eyebrow-dot" aria-hidden="true" />
                  <span>TARGETED CERTIFICATIONS</span>
                </span>
                <h2 className="section-title">One goal. Your language.</h2>
                <p className="section-intro">
                  Three world-recognized language certifications. Comprehensive, level-specific prep calibrated to the official exam format.
                </p>
              </div>
            </div>

            <div className="program-cards-grid">
              {exams.map((exam, index) => (
                <article
                  className="program-card"
                  key={exam.code}
                  data-motion="fade-up"
                  data-delay={String(index * 90)}
                >
                  <div>
                    <span className="program-card-badge">
                      {EXAM_BADGES[exam.code] ?? `${exam.levels.length} Levels`}
                    </span>
                    <h3 className="program-card-title">
                      {exam.language} ({exam.code})
                    </h3>
                    <p className="program-card-desc">
                      {EXAM_DESCRIPTIONS[exam.code] ?? exam.description}
                    </p>

                    <div className="program-levels" aria-label={`${exam.code} levels`}>
                      {exam.levels.map((level) => (
                        <span className="level-tag" key={level.id}>
                          {level.code}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="program-card-footer">
                    <span style={{ fontSize: "0.86rem", color: "var(--muted)", fontWeight: 550 }}>
                      Official syllabus mapped
                    </span>
                    <Link
                      className="text-link"
                      href={`/exams/${exam.code.toLowerCase()}`}
                      style={{ fontWeight: 700, color: "var(--indigo)" }}
                    >
                      Explore {exam.code} <ArrowRight aria-hidden="true" size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Figma Value Proof Section ("Less guesswork. More getting there.") */}
        <section className="pillars-section" id="methodology">
          <div className="site-shell">
            <div className="section-heading-row" data-motion="fade-up">
              <div>
                <span className="hero-eyebrow" style={{ marginBottom: "0.75rem" }}>
                  <span className="hero-eyebrow-dot" aria-hidden="true" />
                  <span>PROVEN METHODOLOGY</span>
                </span>
                <h2 className="section-title">Less guesswork. More getting there.</h2>
                <p className="section-intro">
                  Everything you need to turn preparation into a predictable path to passing.
                </p>
              </div>
            </div>

            <div className="pillars-grid">
              <article className="pillar-card" data-motion="fade-up" data-delay="60">
                <span className="pillar-stat">13</span>
                <h3 className="pillar-title">Certification Levels</h3>
                <p className="pillar-desc">
                  Complete coverage from foundational JLPT N5 and DELE A1 up to native-level DALF C2 mastery.
                </p>
              </article>

              <article className="pillar-card" data-motion="fade-up" data-delay="160">
                <span className="pillar-stat">100%</span>
                <h3 className="pillar-title">Original Prep Questions</h3>
                <p className="pillar-desc">
                  Curated, syllabus-calibrated questions with comprehensive pedagogical rationales for every single answer choice.
                </p>
              </article>

              <article className="pillar-card" data-motion="fade-up" data-delay="260">
                <span className="pillar-stat">360°</span>
                <h3 className="pillar-title">Honest Readiness Tracking</h3>
                <p className="pillar-desc">
                  Continuous diagnostics that tell you precisely when your target pass percentile is secured, with no inflated metrics.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Interactive Features Showcase */}
        <section className="features-showcase-section section" id="features">
          <LandingFeaturesShowcase />
        </section>

        {/* Interactive Method Timeline */}
        <section className="how-section section" id="method">
          <div className="site-shell how-inner">
            <div data-motion="fade-up">
              <h2 className="section-title">Preparation that follows the exam</h2>
              <p className="section-intro">
                LinguaCamp turns the date on your calendar into focused work you can complete each day.
              </p>
            </div>
            <MethodTimelineGraphic />
            <div className="how-grid">
              <article className="how-item" data-motion="fade-up" data-delay="60">
                <span className="how-step-num" aria-hidden="true">01</span>
                <h3>Set your target</h3>
                <p>Choose your certification, level, current proficiency, exam date and available study time.</p>
              </article>
              <article className="how-item" data-motion="fade-up" data-delay="160">
                <span className="how-step-num" aria-hidden="true">02</span>
                <h3>Follow a paced plan</h3>
                <p>Build from foundations into section practice, timed sets, checkpoints and final revision.</p>
              </article>
              <article className="how-item" data-motion="fade-up" data-delay="260">
                <span className="how-step-num" aria-hidden="true">03</span>
                <h3>Adjust from evidence</h3>
                <p>Question attempts and missed tasks show which skills need another focused session.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Plan Preview Component */}
        <section className="section" id="preview">
          <PlanPreview
            exams={exams.map((exam) => ({
              id: exam.id,
              code: exam.code,
              name: exam.name,
              levels: exam.levels.map((level) => ({
                id: level.id,
                code: level.code,
                sections: level.sections.map((section) => ({
                  code: section.code,
                  name: section.name,
                  skill: section.skill,
                })),
              })),
            }))}
          />
        </section>

        {/* Skill Structure & Practice */}
        <section className="feature-section section" id="practice">
          <div className="feature-layout site-shell">
            <div className="feature-lead">
              <div data-motion="fade-up">
                <h2 className="section-title">Practice the parts that count</h2>
                <p className="section-intro">
                  Study tasks, practice sets and progress are organized around your selected exam’s actual skill structure.
                </p>
              </div>
              <SkillRadarGraphic />
            </div>
            <ul className="feature-list">
              <li data-motion="fade-up" data-delay="40">
                <h3><Languages aria-hidden="true" size={iconSize} /> Vocabulary and grammar</h3>
                <p>Build recall with level-matched questions and explanations for each answer.</p>
              </li>
              <li data-motion="fade-up" data-delay="120">
                <h3><BookOpenCheck aria-hidden="true" size={iconSize} /> Reading and listening</h3>
                <p>Work through short original tasks and keep accuracy separate by skill.</p>
              </li>
              <li data-motion="fade-up" data-delay="200">
                <h3><ClipboardCheck aria-hidden="true" size={iconSize} /> Exam-shaped practice</h3>
                <p>JLPT, DELE and DALF use different section maps, stored by level.</p>
              </li>
              <li data-motion="fade-up" data-delay="280">
                <h3><ChartNoAxesColumnIncreasing aria-hidden="true" size={iconSize} /> Readiness from attempts</h3>
                <p>Your dashboard shows completed work and observed accuracy, including honest zeros.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* Exam Simulation Clock Rehearsal */}
        <section className="exam-simulation section" id="mock-exams">
          <div className="simulation-layout site-shell">
            <div data-motion="fade-up">
              <h2 className="section-title">Rehearse with a clock</h2>
              <p className="section-intro">
                Start a section checkpoint, save answers as you go and review explanations after submission.
                These are verified practice items with pedagogical rationales.
              </p>
              <Link className="text-link" href="/register">
                Try a practice set <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div
              className="simulation-panel"
              data-ui="practice-preview"
              data-motion="fade-up"
              data-delay="120"
              data-motion-spotlight
            >
              <div className="simulation-panel-head">
                <div>
                  <h3>
                    {featuredQuestion
                      ? `${featuredQuestion.examName} · ${featuredQuestion.levelCode}`
                      : "Practice preview"}
                  </h3>
                  <p>Sample question · Original LinguaCamp practice</p>
                </div>
                <SimulationClockBadge />
              </div>
              <div className="simulation-question">
                <p>
                  {featuredQuestion?.prompt ??
                    "Your sample question will appear after the exam catalog is seeded."}
                </p>
                {featuredQuestion?.options.map((option) => (
                  <label className="simulation-option" key={option.id}>
                    <input type="radio" name="sample-answer" value={option.id} />
                    <span>{option.text}</span>
                  </label>
                ))}
              </div>
              <p className="small-copy">Sign in to save attempts and track your section accuracy.</p>
            </div>
          </div>
        </section>

        {/* Figma Student Testimonial Quote */}
        <section className="testimonial-section" id="stories">
          <div className="site-shell">
            <article className="testimonial-card" data-motion="fade-up">
              <div className="testimonial-stars" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#0d9488" color="#0d9488" />
                ))}
              </div>
              <blockquote className="testimonial-quote">
                “It’s the first time exam prep has felt like a plan I can actually keep.”
              </blockquote>
              <div className="testimonial-meta">
                <span className="testimonial-author">Maya Chen</span>
                <span className="testimonial-detail">
                  JLPT N2 Candidate • Scored 154/180
                </span>
              </div>
            </article>
          </div>
        </section>

        {/* Pricing Comparison Table */}
        <section className="pricing-section section" id="pricing">
          <div className="site-shell">
            <div data-motion="fade-up">
              <h2 className="section-title">Start free. Add support when it’s ready.</h2>
              <p className="section-intro">
                The platform includes personalized study plans and syllabus-calibrated practice.
              </p>
            </div>
            <div className="pricing-table" role="table" aria-label="Plan comparison">
              <div className="pricing-row" role="row" data-motion="fade-up" data-delay="40">
                <strong role="columnheader">Included</strong>
                <strong role="columnheader">Free</strong>
                <strong role="columnheader">Premium</strong>
              </div>
              <div className="pricing-row" role="row" data-motion="fade-up" data-delay="90">
                <span role="rowheader">Personalized study plan</span>
                <span>Included</span>
                <span>Included</span>
              </div>
              <div className="pricing-row" role="row" data-motion="fade-up" data-delay="140">
                <span role="rowheader">Original practice library</span>
                <span>Starter access</span>
                <span>Full library</span>
              </div>
              <div className="pricing-row" role="row" data-motion="fade-up" data-delay="190">
                <span role="rowheader">Mock checkpoints</span>
                <span>Sample sets</span>
                <span>Full-length sets</span>
              </div>
              <div className="pricing-row" role="row" data-motion="fade-up" data-delay="240">
                <span role="rowheader">AI tutor &amp; feedback</span>
                <span>Essential feedback</span>
                <span>Unlimited conversational simulation</span>
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="section site-shell faq-section" id="faq">
          <h2 className="section-title" data-motion="fade-up">Frequently asked questions</h2>
          <div className="faq-list" data-motion="fade-up" data-delay="110">
            <p>
              <strong>Which exams can I prepare for?</strong> The catalog supports JLPT N5–N1, DELE A1–C2, and DALF C1–C2.
            </p>
            <p>
              <strong>Are these official examination questions?</strong> Questions are original, syllabus-aligned items crafted by certified examiners with complete rationales.
            </p>
            <p>
              <strong>Does the plan guarantee a pass?</strong> While no prep tool can guarantee an exam outcome, our diagnostic model calibrates readiness directly against official scoring rubrics.
            </p>
            <p>
              <strong>How is readiness calculated?</strong> Your readiness score weights time management, section-specific accuracy, and historical retention curves without inflating numbers.
            </p>
            <p>
              <strong>Can I change my target?</strong> Yes, you can update your target certification, date, and weekly study cadence at any time.
            </p>
            <p>
              <strong>How does the AI tutor work?</strong> It conducts conversational role-plays and provides real-time syntactic corrections matched to CEFR and JLPT competencies.
            </p>
          </div>
        </section>

        {/* Figma Dark Teal CTA Banner */}
        <section className="dark-cta-banner" aria-label="Start preparing">
          <div className="site-shell">
            <div className="dark-cta-inner" data-motion="fade-up">
              <h2 className="dark-cta-title">Ready to make progress?</h2>
              <p className="dark-cta-sub">
                Build a plan for the exam ahead in less than two minutes.
              </p>
              <Link className="dark-cta-btn" href="/register">
                Start learning today <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
