import {
  Activity,
  Calendar,
  CalendarPlus,
  ClipboardList,
  Home,
  LogOut,
  Moon,
  Sun,
  UserCircle,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/Button";

const navBase =
  "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  const iconClass = "h-4 w-4";
  const links = useMemo(
    () => [
      { to: "/admin", label: "Dashboard", icon: <Home className={iconClass} /> },
      { to: "/patients", label: "Patients", icon: <Users className={iconClass} /> },
      { to: "/appointments", label: "Appointments", icon: <Calendar className={iconClass} /> },
      {
        to: "/appointments/create",
        label: "New Appointment",
        icon: <CalendarPlus className={iconClass} />
      },
      {
        to: "/audit-logs",
        label: "Audit Log",
        icon: <ClipboardList className={iconClass} />
      }
    ],
    []
  );

  const isLinkActive = (to: string) => {
    if (to === "/appointments") {
      return location.pathname === "/appointments";
    }
    if (to === "/appointments/create") {
      return ["/appointments/create", "/appointments/new"].includes(location.pathname);
    }
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  const publicLinks = [
    { href: "#features", label: "Features" },
    { href: "#workflow", label: "Workflow" },
    { href: "#communication", label: "Reminders" }
  ];
  const isLandingPage = location.pathname === "/";

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setIsDark(true);
      return;
    }
    if (storedTheme === "light") {
      setIsDark(false);
      return;
    }
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between rounded-full border border-border/60 bg-surface/70 px-4 py-3 shadow-card backdrop-blur">
        <NavLink to="/" className="flex items-center gap-2 text-lg font-semibold text-text">
          <div className="rounded-2xl bg-primary-soft/80 p-2 text-primary">
            <Activity className="h-5 w-5" />
          </div>
          MediTrack
        </NavLink>
        {user ? (
          <div className="flex flex-wrap items-center gap-3">
            <nav className="no-scrollbar flex min-w-0 max-w-[58vw] items-center gap-1 overflow-x-auto rounded-full bg-surface/70 px-2 py-1 shadow-sm backdrop-blur">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`${navBase} ${
                    isLinkActive(link.to)
                      ? "bg-surface text-text shadow-sm"
                      : "text-text-muted hover:bg-surface/70 hover:text-text"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to="/profile/edit"
                className={`${navBase} ${
                  isLinkActive("/profile/edit")
                    ? "bg-surface text-text shadow-sm"
                    : "text-text-muted hover:bg-surface/70 hover:text-text"
                }`}
              >
                <UserCircle className={iconClass} />
                Profile
              </NavLink>
            </nav>
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className="rounded-full border border-border/60 bg-surface/70 p-2 text-text-muted shadow-sm transition hover:text-text"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button variant="secondary" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className={iconClass} />
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-4 text-sm font-semibold text-text-muted lg:flex">
              {publicLinks.map((link) => {
                const href = isLandingPage ? link.href : `/${link.href}`;
                return (
                  <a key={link.href} href={href} className="transition hover:text-text">
                    {link.label}
                  </a>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className="rounded-full border border-border/60 bg-surface/70 p-2 text-text-muted shadow-sm transition hover:text-text"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button variant="secondary" size="sm" onClick={() => navigate("/login")}>
              Log in
            </Button>
            <Button size="sm" onClick={() => navigate("/signup")}>
              Get started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
