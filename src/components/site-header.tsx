import Link from "next/link";
import { Brand } from "@/components/brand";

export function SiteHeader() {
  return (
    <header className="site-header site-shell">
      <Brand />
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/#programs">Programs</Link>
        <Link href="/#method">Method</Link>
        <Link href="/#pricing">Pricing</Link>
        <Link className="text-link" href="/login">Log in</Link>
        <Link className="button-link" href="/register">Start preparing</Link>
      </nav>
    </header>
  );
}
