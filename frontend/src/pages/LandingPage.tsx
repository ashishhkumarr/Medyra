import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Mail,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";

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
    description:
      "Patients never log in. They receive clear appointment emails and reminders."
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
    description:
      "Only clinic staff sign in. Patient data stays internal and controlled."
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
  const primaryAction = user
    ? { label: "Open dashboard", to: "/admin" }
    : { label: "Sign in to MediTrack", to: "/login" };

  return (
    <div className="mx-auto w-full max-w-none space-y-20 pb-16">
      <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-surface/80 p-8 shadow-card">
        <div className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-6 animate-fadeUp lg:max-w-[560px]">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <Activity className="h-4 w-4" />
              Built for modern clinics
            </span>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold text-text sm:text-5xl">
                Run a small clinic with clarity, speed, and confidence.
              </h1>
              <p className="text-base text-text-muted sm:text-lg">
                MediTrack is a lightweight clinic management hub for staff. It unifies patient
                profiles and appointment scheduling without the overhead of a full EMR system.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link to={primaryAction.to}>
                <Button className="gap-2 px-5 py-3 text-base">
                  {primaryAction.label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#workflow">
                <Button variant="secondary" className="px-5 py-3 text-base">
                  See how it works
                </Button>
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-2xl border border-border/70 bg-surface px-4 py-3 text-sm text-text-muted shadow-sm"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fadeUp" style={{ animationDelay: "120ms" }}>
            <div className="mb-4 hidden gap-3 lg:grid lg:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-surface px-4 py-3 text-sm shadow-card">
                <p className="text-xs uppercase tracking-wide text-text-subtle">Today</p>
                <p className="mt-1 text-lg font-semibold text-text">18 visits</p>
                <p className="text-xs text-text-muted">4 new reminders sent</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-surface px-4 py-3 text-sm shadow-card">
                <p className="text-xs uppercase tracking-wide text-text-subtle">Next patient</p>
                <p className="mt-1 text-sm font-semibold text-text">Maria Santos</p>
                <p className="text-xs text-text-muted">11:30 AM · Cardiology</p>
              </div>
            </div>

            <div className="relative rounded-3xl border border-border/70 bg-surface shadow-card">
              <div className="border-b border-border/70 px-5 py-4">
                <p className="text-xs uppercase tracking-wide text-text-subtle">MediTrack dashboard</p>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text">Clinic overview</h3>
                  <span className="rounded-full bg-success-soft/80 px-3 py-1 text-xs font-semibold text-success">
                    Live
                  </span>
                </div>
              </div>
              <div className="space-y-4 px-5 py-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-surface-subtle p-4">
                    <p className="text-xs uppercase tracking-wide text-text-subtle">
                      Appointments today
                    </p>
                    <div className="mt-2 flex items-end justify-between">
                      <p className="text-2xl font-semibold text-text">18</p>
                      <p className="text-xs font-semibold text-success">+4</p>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-surface-muted">
                      <div className="h-full w-3/5 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface-subtle p-4">
                    <p className="text-xs uppercase tracking-wide text-text-subtle">
                      Reminders sent
                    </p>
                    <div className="mt-2 flex items-end justify-between">
                      <p className="text-2xl font-semibold text-text">32</p>
                      <p className="text-xs font-semibold text-secondary">+11</p>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-surface-muted">
                      <div className="h-full w-4/5 rounded-full bg-secondary" />
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-surface-subtle p-4">
                  <p className="text-xs uppercase tracking-wide text-text-subtle">Next up</p>
                  <div className="mt-3 space-y-3 text-sm text-text-muted">
                    <div className="flex items-center justify-between">
                      <span>09:00 AM · Dr. Howard</span>
                      <span className="rounded-full bg-secondary-soft/80 px-3 py-1 text-xs font-semibold text-secondary">
                        Scheduled
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>10:30 AM · Pediatrics</span>
                      <span className="rounded-full bg-secondary-soft/80 px-3 py-1 text-xs font-semibold text-secondary">
                        Scheduled
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>11:45 AM · Follow-up</span>
                      <span className="rounded-full bg-success-soft/80 px-3 py-1 text-xs font-semibold text-success">
                        Confirmed
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-surface-subtle p-4 text-sm text-text-muted">
                    <p className="text-xs uppercase tracking-wide text-text-subtle">
                      Patient notes
                    </p>
                    <p className="mt-2">
                      "Follow up on lab results and ensure updated contact details."
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface-subtle p-4 text-sm text-text-muted">
                    <p className="text-xs uppercase tracking-wide text-text-subtle">
                      Email status
                    </p>
                    <p className="mt-2">Reminders scheduled for the next 24 hours.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Core capabilities
            </p>
            <h2 className="text-3xl font-semibold text-text">
              Everything a small clinic needs, nothing it does not.
            </h2>
          </div>
          <Link to="/login">
            <Button variant="secondary" className="px-5 py-3 text-base">
              Launch the portal
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-border/70 bg-surface/90 transition hover:-translate-y-1"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/20" />
                <div className="relative space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft/80 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-text">{feature.title}</h3>
                  <p className="text-sm text-text-muted">{feature.description}</p>
                  <div
                    className="text-xs font-semibold uppercase tracking-wide text-text-subtle"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    Clinic ready
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="workflow" className="grid gap-8 lg:grid-cols-[1fr,1.1fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Daily workflow
          </p>
          <h2 className="text-3xl font-semibold text-text">
            A clear clinic flow from intake to follow-up.
          </h2>
          <p className="text-base text-text-muted">
            MediTrack keeps staff aligned with a single view of patient profiles and appointments.
            Keep the day organized, prevent schedule conflicts, and maintain continuity of care.
          </p>
          <div className="rounded-3xl border border-border/70 bg-surface-subtle p-6">
            <p className="text-sm font-semibold text-text">What MediTrack does not do</p>
            <p className="mt-2 text-sm text-text-muted">
              No billing, insurance claims, prescriptions, or advanced EMR charting. MediTrack
              stays focused on essential clinic operations.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {workflow.map((item) => (
            <div key={item.step} className="rounded-3xl border border-border/70 bg-surface p-5 shadow-sm">
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

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <Card className="space-y-4 border-border/70 bg-surface/90">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Patient communication
          </p>
          <h2 className="text-3xl font-semibold text-text">
            Email reminders keep patients on time without extra work.
          </h2>
          <p className="text-base text-text-muted">
            Confirmations, reschedule updates, cancellations, and appointment reminders are sent
            automatically when patients have an email on file.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-surface-subtle p-4 text-sm text-text-muted">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                Confirmations
              </p>
              <p className="mt-2">Immediate email after scheduling.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-surface-subtle p-4 text-sm text-text-muted">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                Reminders
              </p>
              <p className="mt-2">Automatic reminders within 24 hours.</p>
            </div>
          </div>
        </Card>
        <div className="rounded-3xl border border-border/70 bg-surface-subtle p-6">
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

      <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-surface px-8 py-10 shadow-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.12),_transparent_55%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Start in minutes
            </p>
            <h2 className="text-3xl font-semibold text-text">
              A calm, reliable clinic operations platform.
            </h2>
            <p className="text-base text-text-muted">
              MediTrack keeps small practices on schedule with minimal training required. Give
              your staff a tool they can trust every day.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <Link to={primaryAction.to} className="w-full">
              <Button className="w-full justify-center gap-2 px-5 py-3 text-base">
                {primaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login" className="w-full">
              <Button variant="secondary" className="w-full justify-center px-5 py-3 text-base">
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
