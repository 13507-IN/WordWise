export default function StudentLoading() {
  return (
    <div className="workspace-loading-view" role="status" aria-live="polite">
      <div className="workspace-loading-head">
        <div>
          <div className="skeleton-line" style={{ width: "200px", height: "30px", marginBottom: "0.5rem" }} />
          <div className="skeleton-line" style={{ width: "320px", height: "14px" }} />
        </div>
        <div className="workspace-loading-pill">
          <span className="nav-inline-spinner" />
          <span>Loading workspace…</span>
        </div>
      </div>

      <div className="workspace-loading-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-panel" style={{ minHeight: "120px", padding: "1.25rem" }}>
            <div className="skeleton-line" style={{ width: "80px", height: "14px", marginBottom: "0.75rem" }} />
            <div className="skeleton-line" style={{ width: "120px", height: "32px", marginBottom: "0.5rem" }} />
            <div className="skeleton-line" style={{ width: "100px", height: "12px" }} />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        <div className="skeleton-panel" style={{ minHeight: "340px", padding: "1.5rem" }}>
          <div className="skeleton-line" style={{ width: "180px", height: "20px", marginBottom: "1rem" }} />
          <div className="skeleton-box" style={{ width: "100%", height: "240px" }} />
        </div>
        <div className="skeleton-panel" style={{ minHeight: "340px", padding: "1.5rem" }}>
          <div className="skeleton-line" style={{ width: "140px", height: "20px", marginBottom: "1rem" }} />
          <div className="skeleton-line" style={{ width: "100%", height: "46px", marginBottom: "0.75rem" }} />
          <div className="skeleton-line" style={{ width: "100%", height: "46px", marginBottom: "0.75rem" }} />
          <div className="skeleton-line" style={{ width: "100%", height: "46px" }} />
        </div>
      </div>
    </div>
  );
}
