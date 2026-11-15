import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="site-shell policy-page">
        <p className="eyebrow">LinguaCamp</p>
        <h1>Privacy overview</h1>
        <p className="page-intro">This page describes the data handled by this application prototype. It is product documentation, not legal advice or a substitute for a reviewed commercial privacy policy.</p>
        <section>
          <h2>Account and study data</h2>
          <p>LinguaCamp stores account details, examination preferences, preparation plans, practice attempts, mock answers and lesson progress in its configured PostgreSQL database. Authentication cookies are used to keep you signed in.</p>
        </section>
        <section>
          <h2>Optional providers</h2>
          <p>Google sign-in, password-reset email and the AI tutor work only when their server-side credentials are configured. When the AI tutor is enabled, your recent chat messages and limited exam context are sent to the configured AI provider to produce a response. Chat transcripts are not saved by this application.</p>
        </section>
        <section>
          <h2>Questions and requests</h2>
          <p>This MVP does not yet include self-service account deletion or a privacy-request workflow. Add and verify those controls, retention periods, provider terms and regional compliance requirements before opening the service commercially.</p>
        </section>
        <Link className="text-link" href="/">Return to LinguaCamp</Link>
      </main>
      <SiteFooter />
    </>
  );
}
