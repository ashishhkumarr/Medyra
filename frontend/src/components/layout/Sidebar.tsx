import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Calendar,
  CalendarPlus,
  Home,
  Info,
  LogOut,
  type LucideIcon,
  Menu,
  Moon,
  Settings,
  Sun,
  Users,
  X
} from "lucide-react";

import { APP_NAME } from "../../config/brand";
import { useAuth } from "../../hooks/useAuth";
import { BrandLogo } from "../BrandLogo";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  tour?: string;
  end?: boolean;
}

const mainNav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: Home, tour: "nav-dashboard", end: true },
  { to: "/patients", label: "Patients", icon: Users, tour: "nav-patients" },
  { to: "/appointments", label: "Appointments", icon: Calendar, tour: "nav-appointments", end: true },
  { to: "/appointments/create", label: "New appointment", icon: CalendarPlus, tour: "nav-new-appointment" }
];

const secondaryNav: NavItem[] = [
  { to: "/about", label: "About", icon: Info },
  { to: "/profile/edit", label: "Profile", icon: Settings, tour: "nav-profile" }
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
    isActive
      ? "bg-primary-soft text-primary-strong"
      : "text-text-muted hover:bg-surface-subtle hover:text-text"
  ].join(" ");

const NavItems = ({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) => (
  <div className="flex flex-col gap-1">
    {items.map(({ to, label, icon: Icon, tour, end }) => (
      <NavLink key={to} to={to} end={end} className={linkClass} data-tour={tour} onClick={onNavigate}>
        <Icon className="h-[18px] w-[18px] flex-none" />
        {label}
      </NavLink>
    ))}
  </div>
);

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") setIsDark(true);
    else if (storedTheme === "light") setIsDark(false);
    else setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", mobileOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials =
    (user?.full_name ?? "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "M";

  const railContent = (onNavigate?: () => void) => (
    <>
      <NavLink to="/admin" className="flex items-center gap-2.5 px-2 py-1" onClick={onNavigate}>
        <BrandLogo className="h-9 w-9" />
        <span className="text-lg font-bold tracking-tight text-text">{APP_NAME}</span>
      </NavLink>

      <p className="mt-6 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-subtle">
        Workspace
      </p>
      <div className="mt-2">
        <NavItems items={mainNav} onNavigate={onNavigate} />
      </div>

      <div className="mt-auto space-y-3 pt-6">
        <NavItems items={secondaryNav} onNavigate={onNavigate} />
        <button
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted transition hover:bg-surface-subtle hover:text-text"
        >
          {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          {isDark ? "Light mode" : "Dark mode"}
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface-subtle/70 px-3 py-2.5">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary-strong">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text">{user?.full_name ?? "Clinician"}</p>
            <p className="truncate text-xs text-text-subtle">{user?.email ?? ""}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            className="flex-none rounded-lg p-1.5 text-text-muted transition hover:bg-surface hover:text-danger"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-surface/80 px-4 py-6 backdrop-blur lg:flex">
        {railContent()}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-surface/85 px-4 py-3 backdrop-blur lg:hidden">
        <NavLink to="/admin" className="flex items-center gap-2">
          <BrandLogo className="h-8 w-8" />
          <span className="text-base font-bold text-text">{APP_NAME}</span>
        </NavLink>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl border border-border/60 bg-surface p-2 text-text-muted"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 animate-fadeIn" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-border/60 bg-surface px-4 py-6 shadow-card animate-modalIn">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-text-muted hover:bg-surface-subtle"
            >
              <X className="h-5 w-5" />
            </button>
            {railContent(() => setMobileOpen(false))}
          </aside>
        </div>
      )}
    </>
  );
};
