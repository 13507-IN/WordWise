export default function AdminLoading() {
  return (
    <div className="admin-frame" style={{ minHeight: "100svh" }}>
      <div style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <div className="skeleton-line" style={{ width: "200px", height: "30px", marginBottom: "0.5rem", background: "rgba(255,255,255,0.15)" }} />
            <div className="skeleton-line" style={{ width: "300px", height: "14px", background: "rgba(255,255,255,0.1)" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="nav-inline-spinner" style={{ width: "18px", height: "18px" }} />
            <span style={{ fontSize: "0.86rem", color: "#a4accc" }}>Loading admin data...</span>
          </div>
        </div>

        <div className="panel" style={{ padding: "1.5rem", minHeight: "400px" }}>
          <div className="skeleton-line" style={{ width: "100%", height: "44px", marginBottom: "1rem" }} />
          <div className="skeleton-box" style={{ width: "100%", height: "280px" }} />
        </div>
      </div>
    </div>
  );
}
