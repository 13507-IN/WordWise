import { Brand } from "@/components/brand";

export default function RegisterLoading() {
  return (
    <main className="auth-wrap">
      <aside className="auth-aside">
        <Brand inverse />
        <div>
          <div className="skeleton-line" style={{ width: "80%", height: "48px", marginBottom: "1rem", background: "rgba(255,255,255,0.15)" }} />
          <div className="skeleton-line" style={{ width: "60%", height: "48px", marginBottom: "1.5rem", background: "rgba(255,255,255,0.15)" }} />
          <div className="skeleton-line" style={{ width: "90%", height: "18px", marginBottom: "0.5rem", background: "rgba(255,255,255,0.12)" }} />
          <div className="skeleton-line" style={{ width: "75%", height: "18px", background: "rgba(255,255,255,0.12)" }} />
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>Loading registration...</div>
      </aside>

      <section className="auth-main">
        <div className="auth-form">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div className="nav-inline-spinner" style={{ width: "24px", height: "24px", borderWidth: "3px" }} />
            <h2 style={{ fontSize: "1.6rem", margin: 0, letterSpacing: "-0.04em" }}>Preparing your account...</h2>
          </div>
          <p style={{ color: "var(--muted)", margin: "0 0 2rem" }}>
            Connecting to official JLPT, DELE, and DALF syllabus options...
          </p>

          <div style={{ display: "grid", gap: "1.25rem" }}>
            <div>
              <div className="skeleton-line" style={{ width: "70px", height: "14px", marginBottom: "0.4rem" }} />
              <div className="skeleton-box" style={{ width: "100%", height: "46px" }} />
            </div>

            <div>
              <div className="skeleton-line" style={{ width: "50px", height: "14px", marginBottom: "0.4rem" }} />
              <div className="skeleton-box" style={{ width: "100%", height: "46px" }} />
            </div>

            <div>
              <div className="skeleton-line" style={{ width: "80px", height: "14px", marginBottom: "0.4rem" }} />
              <div className="skeleton-box" style={{ width: "100%", height: "46px" }} />
            </div>

            <div>
              <div className="skeleton-line" style={{ width: "110px", height: "14px", marginBottom: "0.4rem" }} />
              <div className="skeleton-box" style={{ width: "100%", height: "46px" }} />
            </div>

            <div className="skeleton-box" style={{ width: "100%", height: "48px", marginTop: "0.5rem", background: "rgba(14, 56, 53, 0.2)" }} />
          </div>
        </div>
      </section>
    </main>
  );
}
