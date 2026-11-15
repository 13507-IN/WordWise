import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="not-found site-shell">
        <h1>That page isn’t here.</h1>
        <p>Choose one of the available certification programs or return to the LinguaCamp home page.</p>
        <Link className="button" href="/">Back to LinguaCamp</Link>
      </main>
      <SiteFooter />
    </>
  );
}
