export default function AdminLoading() {
  return (
    <div className="workspace-loading-view" role="status" aria-live="polite">
      <div className="workspace-loading-head">
        <div>
          <div
            className="skeleton-line"
            style={{ width: "220px", height: "30px", marginBottom: "0.5rem", background: "rgba(255,255,255,0.12)" }}
          />
          <div
            className="skeleton-line"
            style={{ width: "300px", height: "14px", background: "rgba(255,255,255,0.08)" }}
          />
        </div>
        <div
          className="workspace-loading-pill"
          style={{
            background: "rgba(255,255,255,0.08)",
            borderColor: "rgba(255,255,255,0.12)",
            color: "#a5b4fc",
          }}
        >
          <span className="nav-inline-spinner" style={{ borderTopColor: "#818cf8" }} />
          <span>Loading admin…</span>
        </div>
      </div>
      <div
        className="skeleton-panel"
        style={{
          minHeight: "360px",
          background: "rgba(20, 23, 49, 0.7)",
          borderColor: "rgba(255,255,255,0.08)",
          marginTop: "1.25rem",
        }}
      />
    </div>
  );
}
