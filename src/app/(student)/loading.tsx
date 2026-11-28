export default function StudentLoading() {
  return (
    <div className="app-frame" style={{ minHeight: "100svh" }}>
      <div className="app-main" style={{ padding: "clamp(1.5rem, 3vw, 2.5rem)" }}>
        {/* Title row skeleton */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <div className="skeleton-line" style={{ width: "220px", height: "32px", marginBottom: "0.5rem" }} />
            <div className="skeleton-line" style={{ width: "340px", height: "16px" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="nav-inline-spinner" style={{ width: "18px", height: "18px" }} />
            <span style={{ fontSize: "0.86rem", color: "var(--muted)", fontWeight: 600 }}>Loading workspace...</span>
          </div>
        </div>

        {/* Metric Cards Skeleton Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="panel" style={{ padding: "1.25rem" }}>
              <div className="skeleton-line" style={{ width: "90px", height: "14px", marginBottom: "0.75rem" }} />
              <div className="skeleton-line" style={{ width: "140px", height: "36px", marginBottom: "0.5rem" }} />
              <div className="skeleton-line" style={{ width: "120px", height: "12px" }} />
            </div>
          ))}
        </div>

        {/* Main Content Panels Skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(300px, 0.6fr)", gap: "1.5rem" }}>
          <div className="panel" style={{ padding: "1.75rem", minHeight: "360px" }}>
            <div className="skeleton-line" style={{ width: "180px", height: "22px", marginBottom: "1rem" }} />
            <div className="skeleton-box" style={{ width: "100%", height: "240px" }} />
          </div>

          <div className="panel" style={{ padding: "1.75rem", minHeight: "360px" }}>
            <div className="skeleton-line" style={{ width: "150px", height: "22px", marginBottom: "1rem" }} />
            <div className="skeleton-line" style={{ width: "100%", height: "48px", marginBottom: "0.75rem" }} />
            <div className="skeleton-line" style={{ width: "100%", height: "48px", marginBottom: "0.75rem" }} />
            <div className="skeleton-line" style={{ width: "100%", height: "48px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
