import { AuthLayout } from "@/components/auth-layout";

export default function LoginLoading() {
  return (
    <AuthLayout
      title="Your exam plan, ready when you are."
      description="Sign in to continue your study schedule, practice sets and results."
    >
      <div className="auth-form" role="status" aria-live="polite">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <span className="nav-inline-spinner" style={{ width: "20px", height: "20px" }} />
          <h2 style={{ margin: 0, fontSize: "1.45rem" }}>Sign in to LinguaCamp</h2>
        </div>
        <p style={{ color: "var(--muted)", margin: "0 0 1.5rem" }}>
          Loading your exam preparation session…
        </p>

        <div style={{ display: "grid", gap: "1.25rem" }}>
          <div>
            <div className="skeleton-line" style={{ width: "50px", height: "14px", marginBottom: "0.4rem" }} />
            <div className="skeleton-box" style={{ width: "100%", height: "44px" }} />
          </div>
          <div>
            <div className="skeleton-line" style={{ width: "70px", height: "14px", marginBottom: "0.4rem" }} />
            <div className="skeleton-box" style={{ width: "100%", height: "44px" }} />
          </div>
          <div className="skeleton-box" style={{ width: "100%", height: "46px", marginTop: "0.5rem" }} />
        </div>
      </div>
    </AuthLayout>
  );
}
