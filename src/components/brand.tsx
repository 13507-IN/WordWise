import { BookOpenText } from "lucide-react";
import Link from "next/link";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link className={`brand${inverse ? " brand-inverse" : ""}`} href="/" aria-label="LinguaCamp home">
      <span className="brand-mark" aria-hidden="true">
        <BookOpenText />
      </span>
      <span>LinguaCamp</span>
    </Link>
  );
}
