import Link from "next/link";
import { Brand } from "@/components/brand";

export function AuthLayout({ children, title, description }: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <main className="auth-wrap">
      <aside className="auth-aside">
        <Brand inverse />
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <Link href="/">Back to LinguaCamp</Link>
      </aside>
      <section className="auth-main">{children}</section>
    </main>
  );
}
