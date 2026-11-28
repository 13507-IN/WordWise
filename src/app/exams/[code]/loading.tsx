export default function ExamDetailLoading() {
  return (
    <div className="site-shell" style={{ paddingBlock: "4rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div className="skeleton-line" style={{ width: "120px", height: "24px", borderRadius: "999px", marginBottom: "1.25rem" }} />
        <div className="skeleton-line" style={{ width: "70%", height: "48px", marginBottom: "1rem" }} />
        <div className="skeleton-line" style={{ width: "90%", height: "20px", marginBottom: "0.5rem" }} />
        <div className="skeleton-line" style={{ width: "60%", height: "20px", marginBottom: "3rem" }} />

        <div style={{ display: "grid", gap: "1.5rem" }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="panel" style={{ padding: "1.75rem" }}>
              <div className="skeleton-line" style={{ width: "160px", height: "28px", marginBottom: "0.75rem" }} />
              <div className="skeleton-box" style={{ width: "100%", height: "120px" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
