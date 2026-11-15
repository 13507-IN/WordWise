import Link from "next/link";
import { Brand } from "@/components/brand";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell">
        <div className="footer-top">
          <div>
            <Brand inverse />
            <h2>Build a plan for the exam ahead.</h2>
            <Link className="button" href="/register">Create your plan</Link>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <Link href="/exams/jlpt">JLPT</Link>
            <Link href="/exams/dele">DELE</Link>
            <Link href="/exams/dalf">DALF</Link>
            <Link href="/login">Sign in</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>Original practice material. Exam structures linked to their official authorities.</span>
          <Link href="/privacy">Privacy</Link>
        </div>
        <p className="footer-brand" aria-hidden="true">LinguaCamp</p>
      </div>
    </footer>
  );
}
