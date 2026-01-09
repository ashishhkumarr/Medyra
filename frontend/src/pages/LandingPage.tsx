import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Mail,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";

import brainHero from "../assets/hero/brain-hero.png";
import doctorHero from "../assets/hero/doctor-hero.png";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";

const features = [
  {
    icon: Users,
    title: "Patient profiles that stay organized",
    description:
      "Capture demographics, contact details, and medical notes in a clean, searchable directory."
  },
  {
    icon: CalendarClock,
    title: "Appointments without double-booking",
    description:
      "Schedule, reschedule, and cancel visits with overlap protection built in."
  },
  {
    icon: Mail,
    title: "Automated confirmations and reminders",
    description: "Patients never log in. They receive clear appointment emails and reminders."
  },
  {
    icon: ClipboardList,
    title: "Visit history at a glance",
    description:
      "See past and upcoming appointments for every patient without switching screens."
  },
  {
    icon: ShieldCheck,
    title: "Admin-only access",
    description: "Only clinic staff sign in. Patient data stays internal and controlled."
  },
  {
    icon: Sparkles,
    title: "Lightweight and reliable",
    description:
      "Focus on daily clinic operations without billing, insurance, or complex EMR workflows."
  }
];

const workflow = [
  {
    step: "01",
    title: "Register patient profiles",
    description: "Capture the essentials and add clinical notes in seconds."
  },
  {
    step: "02",
    title: "Schedule visits with confidence",
    description: "Prevent overlaps and keep a clear view of the day ahead."
  },
  {
    step: "03",
    title: "Keep patients informed",
    description: "Automated confirmation, update, and reminder emails go out instantly."
  }
];

const highlights = [
  "No patient logins or portals",
  "Email-first communication",
  "Small clinic focused",
  "Reliable scheduling controls"
];

const LandingPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const primaryAction = user
    ? { label: "Open dashboard", to: "/admin" }
    : { label: "Sign in to MediTrack", to: "/login" };

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    if (!id) return;
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const scrollToSection = () => {
      const element = document.getElementById(id);
      if (!element) return;
      element.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
    };
    const timer = window.setTimeout(scrollToSection, 0);
    return () => window.clearTimeout(timer);
  }, [location.hash, location.pathname]);

  return (
    <div className="space-y-24 pb-20">
      <section className="relative overflow-hidden rounded-[40px] border border-border/60 bg-surface/60 p-8 shadow-card sm:p-12 lg:p-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(112,144,255,0.16),_transparent_55%)]" />
        <div className="pointer-events-none absolute -left-16 top-12 h-52 w-52 animate-float rounded-full bg-gradient-to-br from-secondary/40 to-surface/50 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 top-10 h-40 w-40 animate-float rounded-full bg-gradient-to-br from-primary/40 to-surface/50 blur-2xl" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm">
            <Sparkles className="h-4 w-4" />
            Your everyday clinic protection
          </span>
          <h1 className="mt-6 text-4xl font-semibold text-text sm:text-5xl lg:text-6xl">
            Run your clinic with clarity and confidence
          </h1>
          <p className="mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
            MediTrack keeps patient profiles, scheduling, and audit history in one lightweight
            workspace — built for demo safety and small-clinic speed.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
            <Link to={primaryAction.to}>
              <Button size="lg" className="gap-2">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#workflow" className="text-sm font-semibold text-text-muted hover:text-text">
              See how it works
            </a>
          </div>
        </div>

        <div className="relative mt-16 flex min-h-[400px] items-end justify-center lg:min-h-[480px]">
          <div className="pointer-events-none absolute left-16 top-12 h-16 w-16 animate-float rounded-full bg-gradient-to-br from-primary/50 to-surface/70 blur-sm" />
          <div className="pointer-events-none absolute right-24 top-6 h-12 w-12 animate-float rounded-full bg-gradient-to-br from-secondary/50 to-surface/70 blur-sm" />
          <div className="pointer-events-none absolute left-10 bottom-20 h-20 w-20 animate-float rounded-full bg-gradient-to-br from-primary-soft/80 to-surface/70 blur-sm" />

          <img
            src={brainHero}
            alt="MediTrack analytics"
            className="absolute bottom-0 left-1/2 z-0 w-[620px] -translate-x-1/2 drop-shadow-[0_40px_80px_rgba(126,142,200,0.35)] sm:w-[700px] lg:w-[780px]"
          />

          <div
            className="absolute left-6 bottom-48 z-20 hidden w-60 rounded-3xl border border-border/60 bg-surface/70 p-5 text-xs text-text-muted shadow-card backdrop-blur sm:block animate-float transition-transform hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(120,140,190,0.2)]"
            style={{ animationDuration: "9s", animationDelay: "0.2s" }}
          >
            <p className="text-[11px] uppercase tracking-wide text-text-subtle">Clinic rating</p>
            <p className="mt-1 text-2xl font-semibold text-text">9.6</p>
            <p className="text-xs text-text-subtle">Based on 100+ reviews</p>
          </div>

          <div
            className="absolute left-14 bottom-12 z-20 hidden h-32 w-32 items-center justify-center rounded-3xl border border-border/60 bg-surface/70 text-center text-xs text-text-muted shadow-card backdrop-blur sm:flex animate-float transition-transform hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(120,140,190,0.2)]"
            style={{ animationDuration: "11s", animationDelay: "0.6s" }}
          >
            <div>
              <p className="text-2xl font-semibold text-text">2h</p>
              <p className="text-[11px] text-text-subtle">Sports</p>
            </div>
          </div>

          <div
            className="absolute bottom-10 left-1/2 z-20 hidden w-[620px] -translate-x-1/2 rounded-[36px] border border-border/70 bg-surface/80 p-7 shadow-card backdrop-blur lg:block animate-float transition-transform hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(120,140,190,0.2)]"
            style={{ animationDuration: "10s", animationDelay: "0.4s" }}
          >
            <div className="relative pr-[150px]">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                Variety of tools
              </p>
              <p className="mt-1 text-base font-semibold text-text">Clinic workflows</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-text-muted">
                {["Brain", "Heart", "Scheduling", "Reminders", "Analytics"].map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-border/70 bg-surface/70 px-4 py-1.5 text-[11px] shadow-sm"
                  >
                    {pill}
                  </span>
                ))}
              </div>
              <img
                src={doctorHero}
                alt="Doctor"
                className="absolute -bottom-6 right-0 w-[140px] drop-shadow-[0_20px_40px_rgba(120,140,200,0.3)]"
              />
            </div>
          </div>

          <div
            className="absolute right-8 bottom-44 z-20 hidden w-72 rounded-[34px] border border-border/70 bg-surface/80 p-6 text-xs text-text-muted shadow-card backdrop-blur lg:block animate-float transition-transform hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(120,140,190,0.2)]"
            style={{ animationDuration: "8.5s", animationDelay: "0.8s" }}
          >
            <p className="text-xs font-semibold text-text">Monitor heart trends</p>
            <svg
              viewBox="0 0 200 80"
              className="mt-4 h-16 w-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="heroLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(34,211,191,0.7)" />
                  <stop offset="100%" stopColor="rgba(168,154,255,0.4)" />
                </linearGradient>
              </defs>
              <path
                d="M0 55 L40 50 L80 58 L120 32 L160 40 L200 22"
                fill="none"
                stroke="url(#heroLine)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="120" cy="32" r="4" fill="rgb(34,211,191)" />
              <circle cx="200" cy="22" r="4" fill="rgb(168,154,255)" />
            </svg>
            <p className="mt-2 text-[11px] text-text-subtle">Stable in the last week</p>
          </div>

          <div className="relative z-20 mt-8 grid w-full max-w-xl gap-4 sm:grid-cols-2 lg:hidden">
            <div className="rounded-3xl border border-border/60 bg-surface/70 p-4 text-xs text-text-muted shadow-card backdrop-blur">
              <p className="text-[11px] uppercase tracking-wide text-text-subtle">Clinic rating</p>
              <p className="mt-1 text-2xl font-semibold text-text">9.6</p>
              <p className="text-xs text-text-subtle">Based on 100+ reviews</p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-surface/70 p-4 text-xs text-text-muted shadow-card backdrop-blur">
              <p className="text-xs font-semibold text-text">Monitor heart trends</p>
              <svg viewBox="0 0 200 80" className="mt-3 h-16 w-full" aria-hidden="true">
                <path
                  d="M0 55 L40 50 L80 58 L120 32 L160 40 L200 22"
                  fill="none"
                  stroke="rgba(34,211,191,0.7)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="space-y-10 scroll-mt-28 md:scroll-mt-32">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Core capabilities</p>
            <h2 className="text-3xl font-semibold text-text sm:text-4xl">
              Everything a small clinic needs, nothing it does not.
            </h2>
          </div>
          <Link to="/login">
            <Button variant="secondary">Launch the portal</Button>
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="group relative overflow-hidden">
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 blur-2xl transition group-hover:from-primary/30" />
                <div className="relative space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft/80 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-text">{feature.title}</h3>
                  <p className="text-sm text-text-muted">{feature.description}</p>
                  <div className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                    Clinic ready
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section
        id="workflow"
        className="grid gap-10 scroll-mt-28 md:scroll-mt-32 lg:grid-cols-[1fr,1.05fr]"
      >
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Daily workflow</p>
          <h2 className="text-3xl font-semibold text-text sm:text-4xl">
            A clear clinic flow from intake to follow-up.
          </h2>
          <p className="text-base text-text-muted">
            MediTrack keeps staff aligned with a single view of patient profiles and appointments.
            Keep the day organized, prevent schedule conflicts, and maintain continuity of care.
          </p>
          <div className="rounded-3xl border border-border/60 bg-surface/65 p-6 text-sm text-text-muted shadow-card backdrop-blur">
            <p className="text-sm font-semibold text-text">What MediTrack does not do</p>
            <p className="mt-2 text-sm text-text-muted">
              No billing, insurance claims, prescriptions, or advanced EMR charting. MediTrack
              stays focused on essential clinic operations.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {workflow.map((item) => (
            <div key={item.step} className="rounded-3xl border border-border/60 bg-surface/70 p-5 shadow-card backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                    {item.step}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-text">{item.title}</h3>
                  <p className="mt-2 text-sm text-text-muted">{item.description}</p>
                </div>
                <span className="rounded-full bg-primary-soft/80 px-3 py-1 text-xs font-semibold text-primary">
                  Step
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="communication"
        className="grid gap-6 scroll-mt-28 md:scroll-mt-32 lg:grid-cols-[1.1fr,0.9fr]"
      >
        <Card className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Patient communication
          </p>
          <h2 className="text-3xl font-semibold text-text sm:text-4xl">
            Email reminders keep patients on time without extra work.
          </h2>
          <p className="text-base text-text-muted">
            Confirmations, reschedule updates, cancellations, and appointment reminders are sent
            automatically when patients have an email on file.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-surface/70 p-4 text-sm text-text-muted">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                Confirmations
              </p>
              <p className="mt-2">Immediate email after scheduling.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-surface/70 p-4 text-sm text-text-muted">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                Reminders
              </p>
              <p className="mt-2">Automatic reminders within 24 hours.</p>
            </div>
          </div>
        </Card>
        <div className="rounded-3xl border border-border/60 bg-surface/70 p-6 text-sm text-text-muted shadow-card backdrop-blur">
          <h3 className="text-lg font-semibold text-text">Why clinics choose MediTrack</h3>
          <ul className="mt-4 space-y-3 text-sm text-text-muted">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-1 h-4 w-4 text-success" />
              One view of patients, notes, and appointments.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-1 h-4 w-4 text-success" />
              Scheduling controls that stop overlap mistakes.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-1 h-4 w-4 text-success" />
              Simple enough for staff to learn in minutes.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-1 h-4 w-4 text-success" />
              Patients are kept informed automatically.
            </li>
          </ul>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[36px] border border-border/60 bg-surface/65 px-8 py-10 shadow-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(94,234,212,0.16),_transparent_55%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Start in minutes</p>
            <h2 className="text-3xl font-semibold text-text sm:text-4xl">
              A calm, reliable clinic operations platform.
            </h2>
            <p className="text-base text-text-muted">
              MediTrack keeps small practices on schedule with minimal training required. Give
              your staff a tool they can trust every day.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <Link to={primaryAction.to} className="w-full">
              <Button size="lg" className="w-full justify-center gap-2">
                {primaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login" className="w-full">
              <Button size="lg" variant="secondary" className="w-full justify-center">
                Staff login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
