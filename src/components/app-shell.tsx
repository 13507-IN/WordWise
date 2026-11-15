"use client";

import {
  BookOpenCheck,
  Brain,
  ClipboardList,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Menu,
  Settings2,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/brand";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/practice", label: "Practice", icon: BookOpenCheck },
  { href: "/mocks", label: "Mock exams", icon: ClipboardList },
  { href: "/tutor", label: "AI tutor", icon: Brain },
  { href: "/library", label: "Content library", icon: LibraryBig },
] as const;

function Navigation({ close }: { close?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Student navigation">
      <p className="nav-label">Your preparation</p>
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
        return (
          <Link className={`app-nav-link${active ? " active" : ""}`} href={href} key={href} onClick={close}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
      <p className="nav-label">Account</p>
      <Link className={`app-nav-link${pathname === "/settings" ? " active" : ""}`} href="/settings" onClick={close}>
        <Settings2 aria-hidden="true" />
        <span>Study preferences</span>
      </Link>
    </nav>
  );
}

export function AppShell({ name, email, children }: {
  name: string;
  email: string;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentPage = navigation.find(({ href }) => pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`)));

  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <Brand />
        <Navigation />
        <div className="app-sidebar-bottom">
          <div className="app-user">
            <strong>{name}</strong><br />
            <span>{email}</span>
          </div>
          <button className="app-nav-link sign-out-link" type="button" onClick={() => signOut({ redirectTo: "/" })}>
            <LogOut aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      <div className="app-workspace">
        <header className="app-topbar">
          <div className="app-mobile-brand">
            <Brand />
          </div>
          <nav aria-label="Account navigation">
            <span>{currentPage?.label ?? "Study preferences"}</span>
            <button type="button" onClick={() => signOut({ redirectTo: "/" })}>Sign out</button>
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
            <Navigation close={() => setMenuOpen(false)} />
            <div className="app-user">{name}<br /><span>{email}</span></div>
          </div>
        )}
        <div className="app-sheet">
          <main className="app-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
