import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  FilePenLine,
  FileText,
  Gauge,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  UserRound
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Career Profile", icon: UserRound },
  { to: "/job-fit", label: "Job Fit", icon: Gauge },
  { to: "/cv-tailoring", label: "CV Tailoring", icon: FilePenLine },
  { to: "/cover-letter", label: "Cover Letter", icon: FileText },
  { to: "/application-answers", label: "Answers", icon: MessageSquareText },
  { to: "/tracker", label: "Tracker", icon: ClipboardList },
  { to: "/interview-kb", label: "Interview KB", icon: Building2 }
];

export function AppShell() {
  const { isDemoMode, session, signOut } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <BriefcaseBusiness size={18} />
          </div>
          <div>
            <strong>CareerOS AI</strong>
            <span>Graduate job OS</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"}>
              <item.icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <BarChart3 size={18} />
          <div>
            <strong>Priority</strong>
            <span>Fit, workflow, tracking, interview prep.</span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">AI-powered graduate job application operating system</span>
            <h1>Application command centre</h1>
          </div>
          <div className="topbar-actions">
            <span className="pill">{isDemoMode ? "Local mode" : session?.user.email}</span>
            <button className="icon-button" onClick={signOut} aria-label="Sign out" title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
