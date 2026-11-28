import { BookOpenText } from "lucide-react";

export function PageLoader({
  title = "Loading...",
  subtitle = "Preparing your study session",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="page-loader-screen" role="status" aria-live="polite">
      <div className="page-loader-card">
        <div className="page-loader-spinner-wrap">
          <div className="page-loader-ring" />
          <div className="page-loader-icon-box">
            <BookOpenText size={22} className="page-loader-icon" />
          </div>
        </div>

        <div className="page-loader-text">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

        <div className="page-loader-track">
          <div className="page-loader-fill" />
        </div>
      </div>
    </div>
  );
}
