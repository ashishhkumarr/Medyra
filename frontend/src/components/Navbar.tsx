import {
  Calendar,
  CalendarPlus,
  ClipboardList,
  Home,
  Info,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserCircle,
  X,
  Users
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { APP_NAME } from "../config/brand";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./ui/Button";

const navBase =
  "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement | null>(null);
  const firstNavRef = useRef<HTMLAnchorElement | null>(null);
  const closeDrawer = () => setIsMobileOpen(false);

  const iconClass = "h-4 w-4";
  const setFirstNavRef = (node: HTMLAnchorElement | null) => {
    if (node && !firstNavRef.current) {
      firstNavRef.current = node;
    }
  };
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

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileOpen) return;
    document.body.classList.add("overflow-hidden");
    requestAnimationFrame(() => firstNavRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", handleKeyDown);
      mobileTriggerRef.current?.focus();
    };
  }, [isMobileOpen]);

  const handleLogout = () => {
    closeDrawer();
    logout();
    navigate("/login");
  };

  const mobileMenu = isMobileOpen
    ? createPortal(
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 p-4 sm:p-6">
          <div className="absolute inset-0" onClick={() => setIsMobileOpen(false)} />
          <div
            ref={mobilePanelRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className="relative z-10 flex h-full w-full max-w-sm flex-col overflow-y-auto rounded-[28px] border border-border/60 bg-surface/85 p-5 shadow-card backdrop-blur-xl"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-semibold text-text">
                <BrandLogo className="h-8 w-8" />
                {APP_NAME}
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setIsMobileOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-surface/70 text-text-muted shadow-sm transition hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              {user ? (
                <>
                  <nav className="space-y-2">
                    {links.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        data-tour={
                          link.to === "/patients"
                            ? "nav-patients"
                            : link.to === "/appointments"
                              ? "nav-appointments"
                              : link.to === "/appointments/create"
                                ? "nav-new-appointment"
                                : link.to === "/audit-logs"
                                  ? "nav-audit"
                                  : undefined
                        }
                        onClick={closeDrawer}
                        ref={link.to === "/admin" ? setFirstNavRef : undefined}
                        className={`${navBase} w-full justify-between py-3 ${
                          isLinkActive(link.to)
                            ? "bg-surface text-text shadow-sm"
                            : "text-text-muted hover:bg-surface/70 hover:text-text"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {link.icon}
                          {link.label}
                        </span>
                      </NavLink>
                    ))}
                    <NavLink
                      to="/profile/edit"
                      data-tour="nav-profile"
                      onClick={closeDrawer}
                      className={`${navBase} w-full justify-between py-3 ${
                        isLinkActive("/profile/edit")
                          ? "bg-surface text-text shadow-sm"
                          : "text-text-muted hover:bg-surface/70 hover:text-text"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <UserCircle className={iconClass} />
                        Profile
                      </span>
                    </NavLink>
                    <NavLink
                      to="/about"
                      onClick={closeDrawer}
                      className={`${navBase} w-full justify-between py-3 ${
                        isLinkActive("/about")
                          ? "bg-surface text-text shadow-sm"
                          : "text-text-muted hover:bg-surface/70 hover:text-text"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Info className={iconClass} />
                        About
                      </span>
                    </NavLink>
                  </nav>
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface/70 px-4 py-3 text-sm text-text-muted">
                    <span>Theme</span>
                    <button
                      type="button"
                      onClick={() => setIsDark((prev) => !prev)}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-surface/70 text-text-muted shadow-sm transition hover:text-text"
                      aria-label="Toggle dark mode"
                    >
                      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button variant="secondary" size="md" onClick={handleLogout} className="w-full">
                    <LogOut className={iconClass} />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <nav className="space-y-2">
                    {publicLinks.map((link, index) => {
                      const href = isLandingPage ? link.href : `/${link.href}`;
                      return (
                        <a
                          key={link.href}
                          href={href}
                          onClick={closeDrawer}
                          ref={index === 0 ? setFirstNavRef : undefined}
                          className={`${navBase} w-full justify-between py-3 text-text-muted hover:bg-surface/70 hover:text-text`}
                        >
                          {link.label}
                        </a>
                      );
                    })}
                  </nav>
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface/70 px-4 py-3 text-sm text-text-muted">
                    <span>Theme</span>
                    <button
                      type="button"
                      onClick={() => setIsDark((prev) => !prev)}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-surface/70 text-text-muted shadow-sm transition hover:text-text"
                      aria-label="Toggle dark mode"
                    >
                      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      closeDrawer();
                      navigate("/login");
                    }}
                  >
                    Log in
                  </Button>
                  <Button
                    size="md"
                    onClick={() => {
                      closeDrawer();
                      navigate("/signup");
                    }}
                  >
                    Get started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {mobileMenu}
      <header className="safe-top sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between rounded-full border border-border/60 bg-surface/70 px-4 py-3 shadow-card backdrop-blur">
        <NavLink
          to="/"
          data-tour="nav-brand"
          className="flex items-center gap-2 text-lg font-semibold text-text"
        >
          <BrandLogo className="h-8 w-8 sm:h-9 sm:w-9" />
          <span className={isLandingPage ? "inline" : "hidden sm:inline"}>{APP_NAME}</span>
        </NavLink>
        {user ? (
          <div className="hidden flex-wrap items-center gap-3 md:flex">
            <nav className="no-scrollbar flex min-w-0 max-w-[58vw] items-center gap-1 overflow-x-auto rounded-full bg-surface/70 px-2 py-1 shadow-sm backdrop-blur">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  data-tour={
                    link.to === "/patients"
                      ? "nav-patients"
                      : link.to === "/appointments"
                        ? "nav-appointments"
                        : link.to === "/appointments/create"
                          ? "nav-new-appointment"
                          : link.to === "/audit-logs"
                            ? "nav-audit"
                            : undefined
                  }
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
                data-tour="nav-profile"
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
            <NavLink
              to="/about"
              className={`${navBase} ${
                isLinkActive("/about")
                  ? "bg-surface text-text shadow-sm"
                  : "text-text-muted hover:bg-surface/70 hover:text-text"
              }`}
            >
              <Info className={iconClass} />
              About
            </NavLink>
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
          <div className="hidden items-center gap-4 md:flex">
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
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-surface/70 text-text-muted shadow-sm transition hover:text-text"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            ref={mobileTriggerRef}
            type="button"
            aria-label="Open navigation menu"
            onClick={() => {
              firstNavRef.current = null;
              setIsMobileOpen(true);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-surface/70 text-text-muted shadow-sm transition hover:text-text"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
    </>
  );
};
