"use client";

import {
  AlertCircle,
  CalendarDays,
  Check,
  GraduationCap,
  Search,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";
const USER_ROLES = ["STUDENT", "INSTRUCTOR", "ADMIN"] as const;
type UserRole = (typeof USER_ROLES)[number];

type UserRecord = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  profile: {
    preferredLanguage: string | null;
    onboardingComplete: boolean;
    targetLevel: {
      code: string;
      exam: {
        code: string;
        name: string;
      };
    } | null;
  } | null;
  studyPlans: {
    id: string;
    status: string;
    examDate: string;
    dailyMinutes: number;
  }[];
  _count: {
    questionAttempts: number;
    mockAttempts: number;
  };
};

export function UserManager({ initialUsers }: { initialUsers: UserRecord[] }) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(term);
      const matchEmail = u.email.toLowerCase().includes(term);
      if (!matchName && !matchEmail) return false;
    }
    return true;
  });

  async function handleRoleChange(userId: string, newRole: UserRole) {
    setUpdatingId(userId);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setStatusMessage(`Updated role for ${data.email} to ${newRole}`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="app-title-row">
        <div>
          <h1>User Directory &amp; Role-Based Access</h1>
          <p>
            Audit registered accounts, view target certification goals, and assign administrator or instructor roles.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="admin-toast-notice">
          <Check size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="admin-filter-bar panel">
        <div className="admin-search-wrap">
          <Search size={16} className="admin-search-icon" />
          <input
            type="search"
            placeholder="Search by name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="admin-filter-group">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">All Roles</option>
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-filter-count">
          Showing <strong>{filtered.length}</strong> of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="panel admin-table-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Target Exam</th>
                <th>Study Schedule</th>
                <th>Activity</th>
                <th>Assigned Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((u) => {
                  const target = u.profile?.targetLevel;
                  const plan = u.studyPlans[0];

                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="admin-user-cell">
                          <strong>{u.name || "Unnamed Student"}</strong>
                          <span className="admin-cell-sub">{u.email}</span>
                          <span className="admin-muted" style={{ fontSize: "0.74rem" }}>
                            Registered {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td>
                        {target ? (
                          <div className="admin-user-target">
                            <span className="level-tag">
                              {target.exam.code} {target.code}
                            </span>
                            <span className="admin-cell-sub">{target.exam.name}</span>
                          </div>
                        ) : (
                          <span className="admin-muted">Not selected</span>
                        )}
                      </td>

                      <td>
                        {plan ? (
                          <div className="admin-schedule-cell">
                            <span className="admin-clock-text">
                              <CalendarDays size={13} />
                              <span>
                                {new Date(plan.examDate).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </span>
                            <span className="admin-cell-sub">
                              {plan.dailyMinutes} min/day · {plan.status}
                            </span>
                          </div>
                        ) : (
                          <span className="admin-muted">No active plan</span>
                        )}
                      </td>

                      <td>
                        <div className="admin-activity-cell">
                          <span>
                            <strong>{u._count.questionAttempts}</strong> practice Qs
                          </span>
                          <span className="admin-cell-sub">
                            {u._count.mockAttempts} mock checkpoints
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="admin-role-cell">
                          <select
                            className={`admin-role-select ${u.role.toLowerCase()}`}
                            value={u.role}
                            disabled={updatingId === u.id}
                            onChange={(e) =>
                              handleRoleChange(u.id, e.target.value as UserRole)
                            }
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="INSTRUCTOR">INSTRUCTOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="empty-state" style={{ padding: "2.5rem", textAlign: "center" }}>
                    No users match the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
