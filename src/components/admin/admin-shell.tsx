"use client";

import {
  Activity,
  ArrowLeftRight,
  BookOpenCheck,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/brand";

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/questions", label: "Question Bank", icon: FileQuestion },
  { href: "/admin/exams", label: "Exams & Levels", icon: GraduationCap },
  { href: "/admin/lessons", label: "Lessons & Curriculum", icon: BookOpenCheck },
  { href: "/admin/users", label: "User Directory", icon: Users },
  { href: "/admin/attempts", label: "Exam Attempts", icon: Activity },
] as const;

function AdminNavigation({ close }: { close?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation">
      <p className="nav-label">Management</p>
      {adminNav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href as any}
            className={`app-nav-link admin-nav-link${active ? " active" : ""}`}
            onClick={close}
          >
            <Icon aria-hidden="true" size={18} />
            <span>{label}</span>
          </Link>
        );
      })}

      <p className="nav-label">Mode Switch</p>
      <Link href="/dashboard" className="app-nav-link" onClick={close}>
        <ArrowLeftRight aria-hidden="true" size={18} />
        <span>Student Workspace</span>
      </Link>
    </nav>
  );
}

export function AdminShell({
  name,
  email,
  children,
}: {
  name: string;
  email: string;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentPage = adminNav.find(
    ({ href }) => pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`))
  );

  return (
    <div className="app-frame admin-frame">
      <aside className="app-sidebar admin-sidebar">
        <div className="admin-brand-wrap">
          <Brand />
          <span className="admin-portal-badge">
            <ShieldCheck size={12} />
            <span>Admin</span>
          </span>
        </div>

        <AdminNavigation />

        <div className="app-sidebar-bottom">
          <div className="app-user">
            <div className="admin-user-title">
              <strong>{name}</strong>
              <span className="admin-role-tag">ADMIN</span>
            </div>
            <span>{email}</span>
          </div>
          <button
            className="app-nav-link sign-out-link"
            type="button"
            onClick={() => signOut({ redirectTo: "/" })}
          >
            <LogOut aria-hidden="true" size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="app-workspace">
        <header className="app-topbar admin-topbar">
          <div className="app-mobile-brand">
            <Brand />
            <span className="admin-portal-badge">Admin</span>
          </div>

          <div className="admin-breadcrumbs">
            <span className="admin-crumb-parent">Administration</span>
            <span className="admin-crumb-sep">/</span>
            <span className="admin-crumb-current">{currentPage?.label ?? "Overview"}</span>
          </div>

          <nav aria-label="Admin action navigation" className="admin-topbar-actions">
            <Link href="/dashboard" className="admin-mode-pill">
              <ArrowLeftRight size={14} />
              <span>Student View</span>
            </Link>
            <button
              type="button"
              className="admin-signout-btn"
              onClick={() => signOut({ redirectTo: "/" })}
            >
              Sign out
            </button>
          </nav>

          <button
            className="mobile-menu-button"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </header>

        {menuOpen && (
          <div className="mobile-menu-sheet">
            <AdminNavigation close={() => setMenuOpen(false)} />
            <div className="app-user">
              <strong>{name}</strong> (ADMIN)<br />
              <span>{email}</span>
            </div>
          </div>
        )}

        <div className="app-sheet admin-sheet">
          <main className="app-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
