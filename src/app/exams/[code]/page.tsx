import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getExam } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const exam = await getExam(code);
  return { title: exam ? `${exam.code} preparation` : "Examination" };
}

export default async function ExamPage({ params }: Props) {
  const { code } = await params;
  const exam = await getExam(code);
  if (!exam) notFound();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="exam-hero site-shell">
          <p className="exam-language">{exam.language} certification</p>
          <h1>{exam.code} preparation</h1>
          <p className="exam-lede">{exam.description}</p>
          <div className="hero-actions">
            <Link className="button" href="/register">Build my plan <ArrowRight aria-hidden="true" size={17} /></Link>
            <a className="text-link" href={exam.officialUrl} target="_blank" rel="noreferrer">
              Official exam authority <ExternalLink aria-hidden="true" size={16} />
            </a>
          </div>
        </section>

        <section className="exam-overview section">
          <div className="site-shell">
            <div className="section-heading-row">
              <div>
                <h2 className="section-title">Select your target level</h2>
                <p className="section-intro">
                  The available levels and section timing below come from the current exam configuration.
                  Confirm registration details with the official authority before booking.
                </p>
              </div>
            </div>
            <nav className="level-index" aria-label={`${exam.code} levels`}>
              {exam.levels.map((level) => (
                <a className="level-index-link" href={`#${level.code.toLowerCase()}`} key={level.id}>{level.code}</a>
              ))}
            </nav>
            <div className="exam-level-list">
              {exam.levels.map((level) => (
                <article className="exam-level" id={level.code.toLowerCase()} key={level.id}>
                  <div className="exam-level-copy">
                    <h3>{level.code}</h3>
                    <p>{level.overview}</p>
                    <a className="text-link" href={level.officialSourceUrl} target="_blank" rel="noreferrer">
                      Verify official format <ExternalLink aria-hidden="true" size={15} />
                    </a>
                  </div>
                  <div className="exam-section-list">
                    <h4>Exam sections</h4>
                    {level.sections.map((section) => (
                      <div className="exam-section-row" key={section.id}>
                        <span>{section.name}</span>
                        <span>
                          {section.durationMinutes ? `${section.durationMinutes} min` : "See official format"}
                          {section.preparationMinutes ? ` · ${section.preparationMinutes} min preparation` : ""}
                        </span>
                      </div>
                    ))}
                    {exam.code === "JLPT" && (
                      <p className="exam-note">
                        JLPT assesses language knowledge, reading and listening. Writing and speaking
                        activities in LinguaCamp are supplementary practice, not official JLPT sections.
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="exam-skills section">
          <div className="site-shell exam-skills-grid">
            <div>
              <h2 className="section-title">Practice by tested skill</h2>
              <p className="section-intro">
                LinguaCamp keeps each exam’s sections separate in the study plan, attempts and mock checkpoints.
              </p>
            </div>
            <div className="exam-skills-list">
              {exam.code === "JLPT" && (
                <>
                  <p><strong>Vocabulary and kanji</strong><span>Recognition, contextual use and level-appropriate reading.</span></p>
                  <p><strong>Grammar</strong><span>Sentence completion, structure and contextual expression.</span></p>
                  <p><strong>Reading</strong><span>Short texts, information retrieval and longer passages.</span></p>
                  <p><strong>Listening</strong><span>Comprehension of conversations and spoken information.</span></p>
                </>
              )}
              {exam.code === "DELE" && (
                <>
                  <p><strong>Reading comprehension</strong><span>Locate information and interpret texts at the selected CEFR level.</span></p>
                  <p><strong>Listening comprehension</strong><span>Understand announcements, conversations and spoken arguments.</span></p>
                  <p><strong>Written expression and interaction</strong><span>Respond to the task with suitable structure and register.</span></p>
                  <p><strong>Oral expression and interaction</strong><span>Present, describe, discuss and interact at the target level.</span></p>
                </>
              )}
              {exam.code === "DALF" && (
                <>
                  <p><strong>Listening comprehension</strong><span>Follow extended spoken material and identify argument and evidence.</span></p>
                  <p><strong>Reading comprehension</strong><span>Analyze complex texts, positions and supporting details.</span></p>
                  <p><strong>Written production</strong><span>Build a structured synthesis or argumentative response.</span></p>
                  <p><strong>Oral production</strong><span>Present and defend a position with precise supporting arguments.</span></p>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="exam-cta section">
          <div className="site-shell">
            <h2>Set a date. Start with a plan.</h2>
            <p>Choose your current level and available study time to build a schedule around this exam.</p>
            <Link className="button" href={`/register?exam=${exam.code.toLowerCase()}`}>
              Prepare for {exam.code} <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
