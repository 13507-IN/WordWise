"use client";

import { AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminAccessGuard({ email, currentRole }: { email: string; currentRole: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleElevate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/elevate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to grant administrator access");
      }
      window.location.reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="admin-guard-page site-shell">
      <div className="admin-guard-card">
        <div className="admin-guard-icon" aria-hidden="true">
          <ShieldCheck size={36} />
        </div>
        <h1>Administrator access required</h1>
        <p className="admin-guard-lead">
          You are currently signed in as <strong>{email}</strong> with the <strong>{currentRole}</strong> role.
          The Admin Portal is restricted to authorized platform administrators.
        </p>

        {error && (
          <div className="admin-guard-error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="admin-guard-actions">
          <button
            type="button"
            className="button"
            onClick={handleElevate}
            disabled={loading}
          >
            <ShieldCheck size={17} />
            <span>{loading ? "Authorizing admin role..." : "Grant Admin Access to This Account"}</span>
          </button>

          <Link href="/dashboard" className="button button-secondary">
            <ArrowLeft size={17} />
            <span>Return to Student Dashboard</span>
          </Link>
        </div>

        <p className="small-copy" style={{ marginTop: "1.5rem" }}>
          In production, roles are managed via secure role-based access control (RBAC). In development and staging, any authenticated developer account can self-elevate to test administrative workflows.
        </p>
      </div>
    </div>
  );
}
