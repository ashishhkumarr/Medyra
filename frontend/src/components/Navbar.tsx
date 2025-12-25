import {
  Activity,
  Calendar,
  CalendarPlus,
  Home,
  LogOut,
  Moon,
  Sun,
  UserCircle,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/Button";

const navBase = "px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
      }
    ],
    []
  );

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
    <header className="sticky top-0 z-30 border-b border-border/60 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full items-center justify-between px-6 py-4 sm:px-8 lg:px-12 2xl:px-16">
        <NavLink to="/" className="flex items-center gap-2 text-lg font-semibold text-text">
          <div className="rounded-2xl bg-primary-soft/80 p-2 text-primary">
            <Activity className="h-5 w-5" />
          </div>
          MediTrack
        </NavLink>
        {user ? (
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1 rounded-2xl bg-surface-subtle px-2 py-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `${navBase} flex items-center gap-2 ${
                      isActive
                        ? "bg-surface text-text shadow-sm"
                        : "text-text-muted hover:bg-surface hover:text-text"
                    }`
                  }
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to="/profile/edit"
                className={({ isActive }) =>
                  `${navBase} flex items-center gap-2 ${
                    isActive
                      ? "bg-surface text-text shadow-sm"
                      : "text-text-muted hover:bg-surface hover:text-text"
                  }`
                }
              >
                <UserCircle className={iconClass} />
                Profile
              </NavLink>
            </nav>
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className="rounded-full border border-border/70 bg-surface p-2 text-text-muted transition hover:text-text hover:shadow-sm"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button variant="secondary" onClick={handleLogout} className="gap-2">
              <LogOut className={iconClass} />
              Logout
            </Button>
          </div>
        ) : (
          <Button onClick={() => navigate("/login")} variant="primary">
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};
