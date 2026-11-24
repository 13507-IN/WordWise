import Link from "next/link";
import { Brand } from "@/components/brand";

export function SiteHeader() {
  return (
    <header className="site-header site-shell">
      <Brand />
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/#programs">Exams</Link>
        <Link href="/#features">Features</Link>
        <Link href="/#method">How it works</Link>
        <Link href="/#pricing">Plans</Link>
        <Link className="text-link" href="/login">Sign in</Link>
        <Link className="button-link" href="/register">Start preparing</Link>
      </nav>
    </header>
  );
}
