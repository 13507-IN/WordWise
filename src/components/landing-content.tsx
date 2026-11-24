import { ArrowDownRight, ArrowRight, BookOpenCheck, ChartNoAxesColumnIncreasing, ClipboardCheck, Languages } from "lucide-react";
import Link from "next/link";
import { HeroMotionStage } from "@/components/hero-motion-stage";
import { LandingMotionDirector } from "@/components/landing-motion-director";
import {
  CtaAmbientMotion,
  MethodTimelineGraphic,
  SimulationClockBadge,
  SkillRadarGraphic,
  StoriesWaveGraphic,
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

export function LandingContent({ exams, featuredQuestion }: {
  exams: ExamCard[];
  featuredQuestion: { examName: string; levelCode: string; prompt: string; options: { id: string; text: string }[] } | null;
}) {
  return (
    <div data-landing-motion>
      <LandingMotionDirector />
      <SiteHeader />
      <main>
        <section className="hero-band">
          <div className="hero site-shell">
            <div className="hero-top">
              <h1 className="hero-headline">
                <span className="hero-line">Pass your next</span>{" "}
                <span className="hero-accent-word">
                  exam.
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
                <Link className="button" href="/register">Start preparing <ArrowRight aria-hidden="true" size={17} /></Link>
                <Link className="text-link" href="#programs">Explore exam programs <ArrowDownRight aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="programs section" id="programs">
          <div className="site-shell">
            <div className="section-heading-row" data-motion="fade-up">
              <div>
                <h2 className="section-title">Choose the exam you’re preparing for</h2>
                <p className="section-intro">Each program follows its own certification levels and tested skills.</p>
              </div>
            </div>
            <div className="program-list">
              {exams.map((exam, index) => (
                <article
                  className="program-row"
                  key={exam.code}
                  data-motion="fade-up"
                  data-delay={String(index * 90)}
                >
                  <div className="program-name">
                    <span className="program-symbol" aria-hidden="true">
                      <span className="program-symbol-ring" />
                      {exam.code}
                    </span>
                    <div>
                      <h3>{exam.language}</h3>
                      <p>{exam.name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="program-description">{exam.description}</p>
                    <div className="program-levels" aria-label={`${exam.code} levels`}>
                      {exam.levels.map((level) => <span className="level-tag" key={level.id}>{level.code}</span>)}
                    </div>
                  </div>
                  <Link className="text-link program-link" href={`/exams/${exam.code.toLowerCase()}`}>
                    Explore {exam.code} <ArrowRight aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="features-showcase-section section" id="features">
          <LandingFeaturesShowcase />
        </section>

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

        <section className="section" id="preview">
          <PlanPreview exams={exams.map((exam) => ({
            id: exam.id,
            code: exam.code,
            name: exam.name,
            levels: exam.levels.map((level) => ({
              id: level.id,
              code: level.code,
              sections: level.sections.map((section) => ({ code: section.code, name: section.name, skill: section.skill })),
            })),
          }))} />
        </section>

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
              <li data-motion="fade-up" data-delay="40"><h3><Languages aria-hidden="true" size={iconSize} /> Vocabulary and grammar</h3><p>Build recall with level-matched questions and explanations for each answer.</p></li>
              <li data-motion="fade-up" data-delay="120"><h3><BookOpenCheck aria-hidden="true" size={iconSize} /> Reading and listening</h3><p>Work through short original tasks and keep accuracy separate by skill.</p></li>
              <li data-motion="fade-up" data-delay="200"><h3><ClipboardCheck aria-hidden="true" size={iconSize} /> Exam-shaped practice</h3><p>JLPT, DELE and DALF use different section maps, stored by level.</p></li>
              <li data-motion="fade-up" data-delay="280"><h3><ChartNoAxesColumnIncreasing aria-hidden="true" size={iconSize} /> Readiness from attempts</h3><p>Your dashboard shows completed work and observed accuracy, including honest zeros.</p></li>
            </ul>
          </div>
        </section>

        <section className="exam-simulation section" id="mock-exams">
          <div className="simulation-layout site-shell">
            <div data-motion="fade-up">
              <h2 className="section-title">Rehearse with a clock</h2>
              <p className="section-intro">
                Start a section checkpoint, save answers as you go and review explanations after submission.
                These are original sample questions, not official exam items.
              </p>
              <Link className="text-link" href="/register">Try a practice set <ArrowRight aria-hidden="true" /></Link>
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
                  <h3>{featuredQuestion ? `${featuredQuestion.examName} · ${featuredQuestion.levelCode}` : "Practice preview"}</h3>
                  <p>Sample question · Original LinguaCamp practice</p>
                </div>
                <SimulationClockBadge />
              </div>
              <div className="simulation-question">
                <p>{featuredQuestion?.prompt ?? "Your sample question will appear after the exam catalog is seeded."}</p>
                {featuredQuestion?.options.map((option) => (
                  <label className="simulation-option" key={option.id}>
                    <input type="radio" name="sample-answer" value={option.id} />
                    <span>{option.text}</span>
                  </label>
                ))}
              </div>
              <p className="small-copy">Sign in to save attempts and see your section accuracy.</p>
            </div>
          </div>
        </section>

        <section className="stories-section section" id="stories">
          <StoriesWaveGraphic />
          <div className="site-shell feature-layout stories-inner">
            <div data-motion="fade-up">
              <h2 className="section-title">Student stories</h2>
              <p className="section-intro">Learning outcomes will be shared only when they are verified and students have agreed to publish them.</p>
            </div>
            <blockquote className="story-placeholder" data-motion="fade-up" data-delay="120">
              Stories and pass-rate information are not published yet. No results or testimonials have been invented for this page.
            </blockquote>
          </div>
        </section>

        <section className="pricing-section section" id="pricing">
          <div className="site-shell">
            <div data-motion="fade-up">
              <h2 className="section-title">Start free. Add support when it’s ready.</h2>
              <p className="section-intro">The MVP includes a preparation plan and original practice. Paid plan prices are not configured yet.</p>
            </div>
            <div className="pricing-table" role="table" aria-label="Plan comparison">
              <div className="pricing-row" role="row" data-motion="fade-up" data-delay="40"><strong role="columnheader">Included</strong><strong role="columnheader">Free</strong><strong role="columnheader">Premium</strong></div>
              <div className="pricing-row" role="row" data-motion="fade-up" data-delay="90"><span role="rowheader">Personalized study plan</span><span>Included</span><span>Included</span></div>
              <div className="pricing-row" role="row" data-motion="fade-up" data-delay="140"><span role="rowheader">Original practice library</span><span>Starter access</span><span>Full library</span></div>
              <div className="pricing-row" role="row" data-motion="fade-up" data-delay="190"><span role="rowheader">Mock checkpoints</span><span>Sample sets</span><span>Full-length sets</span></div>
              <div className="pricing-row" role="row" data-motion="fade-up" data-delay="240"><span role="rowheader">AI feedback</span><span>Limited, when configured</span><span>Expanded, when configured</span></div>
            </div>
            <p className="small-copy" data-motion="fade-up" data-delay="260">Premium access and payment processing are not enabled in this MVP.</p>
          </div>
        </section>

        <section className="section site-shell faq-section" id="faq">
          <h2 className="section-title" data-motion="fade-up">Frequently asked questions</h2>
          <div className="faq-list" data-motion="fade-up" data-delay="110">
            <p><strong>Which exams can I prepare for?</strong> The current catalog supports JLPT N5–N1, DELE A1–C2 and DALF C1–C2.</p>
            <p><strong>Are these official examination questions?</strong> No. Practice items are original LinguaCamp samples and are clearly labeled.</p>
            <p><strong>Does the plan guarantee a pass?</strong> No. It organizes study and records practice; it cannot guarantee an examination result.</p>
            <p><strong>How is readiness calculated?</strong> The dashboard uses completed planned work and recorded practice accuracy. It is an estimate, not an official score.</p>
            <p><strong>Can I change my target?</strong> Your target exam and study preferences can be edited from your account.</p>
            <p><strong>Are AI evaluations official scores?</strong> No. Any configured AI feedback is an estimate and is not issued by an exam authority.</p>
          </div>
        </section>

        <section className="cta-section" aria-label="Start preparing" data-motion="fade-up" data-motion-spotlight>
          <CtaAmbientMotion />
          <Link href="/register">
            <div className="cta-content site-shell">
              <div>
                <p>Create an account to save your target and build a study plan.</p>
                <p className="cta-word">Prepare</p>
              </div>
              <ArrowDownRight className="cta-arrow" aria-hidden="true" />
            </div>
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
