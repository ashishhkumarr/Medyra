import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion
} from "framer-motion";
import {
  Activity,
  ArrowRight,
  BellRing,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  FileText,
  Lock,
  Plus,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users
} from "lucide-react";

import "../styles/landing.css";

const DEMO_URL = "/signup";
const LOGIN_URL = "/login";

/* ---------- motion helpers ---------- */
const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.2, 0.7, 0.3, 1] as const, delay }
});

function CountUp({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.2,
      ease: [0.22, 1, 0.3, 1],
      onUpdate: (v) => setVal(Math.round(v))
    });
    return () => controls.stop();
  }, [inView, to, reduce]);
  return (
    <span ref={ref}>
      {prefix}
      {val}
      {suffix}
    </span>
  );
}

function GrowBar({ h, alt = false }: { h: number; alt?: boolean }) {
  return (
    <motion.div
      className={`ml-bar${alt ? " alt" : ""}`}
      style={{ height: `${h}%`, transformOrigin: "bottom" }}
      initial={{ scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.9, ease: [0.2, 0.7, 0.3, 1] }}
    />
  );
}

type Faq = { q: string; a: string };
function FaqItem({ item, open, onToggle }: { item: Faq; open: boolean; onToggle: () => void }) {
  return (
    <div className={`ml-q${open ? " open" : ""}`}>
      <button onClick={onToggle} aria-expanded={open}>
        {item.q}
        <span className="ml-ic">
          <Plus size={18} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="ml-ans"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p>{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- content ---------- */
const chartBars = [
  { h: 46 }, { h: 62, alt: true }, { h: 54 }, { h: 78, alt: true }, { h: 66 }, { h: 90, alt: true }
];
const diveBars = [
  { h: 40 }, { h: 58, alt: true }, { h: 48 }, { h: 72, alt: true }, { h: 60 }, { h: 86, alt: true }
];

const securityItems = [
  { icon: Lock, title: "JWT auth & bcrypt", text: "Token-based sessions and hashed passwords, with login lockout after repeated failed attempts." },
  { icon: ShieldCheck, title: "Tenant isolation", text: "Each clinic's data is walled off at the data layer and verified by an automated test suite." },
  { icon: Clock, title: "Rate limiting & headers", text: "Request throttling and a hardened security-header middleware guard the API by default." },
  { icon: FileText, title: "Full audit logging", text: "Key actions are recorded with a request ID, so every change is traceable after the fact." },
  { icon: CheckCircle2, title: "Demo guardrails", text: "Feature flags keep reminders simulated and real-data entry discouraged — safe to show anyone." },
  { icon: Check, title: "75+ tests, 11 migrations", text: "A real test suite and versioned schema migrations — not a weekend prototype held together with tape." }
];

const techStack = [
  { c: "#61DAFB", n: "React + TypeScript" },
  { c: "#646CFF", n: "Vite" },
  { c: "#06B6D4", n: "Tailwind CSS" },
  { c: "#F59E0B", n: "D3.js" },
  { c: "#009688", n: "FastAPI" },
  { c: "#D71F00", n: "SQLAlchemy" },
  { c: "#336791", n: "PostgreSQL" },
  { c: "#2496ED", n: "Docker" },
  { c: "#111111", n: "Vercel" },
  { c: "#4285F4", n: "Google Cloud Run" },
  { c: "#3ECF8E", n: "Supabase" }
];

const faqs: Faq[] = [
  { q: "Is Medyra really free?", a: "Yes. Medyra is a free, demo-first project made so anyone — especially small clinics still on paper — can try a modern EMR without cost or commitment." },
  { q: "Can I enter real patient data?", a: "Please don't. Medyra runs in demo mode and is not intended for protected health information. Reminders are simulated and never leave the app, so it's safe to explore with sample data." },
  { q: "Who is it for?", a: "Small clinics and solo practitioners who want to see what a lightweight digital record feels like — and anyone evaluating the engineering behind a full-stack EMR." },
  { q: "What is it built with?", a: "A React + TypeScript frontend on Vercel, a FastAPI backend on Google Cloud Run, and a PostgreSQL database on Supabase — containerized with Docker and covered by an automated test suite." },
  { q: "Who built Medyra?", a: "A single full-stack engineer who worked with clinical EMR systems at a heart clinic in Las Vegas, then built Medyra after seeing how many small clinics still rely entirely on paper." }
];

const BrandGlyph = () => (
  <span className="ml-glyph" aria-hidden>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 21s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.7-7 10-7 10Z" fill="#fff" opacity=".92" />
      <path d="M6.5 12.5h3l1.3-2.5 1.8 4 1.2-2h3.2" stroke="#0D6E68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

/* ---------- page ---------- */
const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const reduce = useReducedMotion();

  // nav scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // hero mockup cursor parallax
  const rx = useMotionValue(4);
  const ry = useMotionValue(-9);
  const transform = useMotionTemplate`rotateY(${ry}deg) rotateX(${rx}deg)`;
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / r.width;
    const dy = (e.clientY - r.top - r.height / 2) / r.height;
    ry.set(-9 + dx * 6);
    rx.set(4 - dy * 6);
  };
  const onLeave = () => {
    animate(ry, -9, { duration: 0.5 });
    animate(rx, 4, { duration: 0.5 });
  };

  const bob = (d: number) =>
    reduce
      ? {}
      : { animate: { y: [0, -9, 0] }, transition: { duration: 6 + d, repeat: Infinity, ease: "easeInOut" as const, delay: d } };

  return (
    <MotionConfig reducedMotion="user">
      <div className="ml-root">
        {/* NAV */}
        <header className={`ml-nav${scrolled ? " scrolled" : ""}`}>
          <div className="ml-wrap ml-nav-inner">
            <Link to="/" className="ml-brand">
              <BrandGlyph /> Medyra
            </Link>
            <nav className="ml-nav-links">
              <a href="#features">Features</a>
              <a href="#workflow">Workflow</a>
              <a href="#security">Security</a>
              <a href="#built">Built with</a>
              <a href="#faq">FAQ</a>
            </nav>
            <div className="ml-nav-cta">
              <Link className="ml-btn ml-btn-ghost ml-btn-sm ml-hide-sm" to={LOGIN_URL}>
                Log in
              </Link>
              <Link className="ml-btn ml-btn-primary ml-btn-sm" to={DEMO_URL}>
                Start free <span className="ml-arrow">→</span>
              </Link>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="ml-hero">
          <div className="ml-wrap ml-hero-grid">
            <div>
              <motion.span className="ml-badge" {...reveal(0)}>
                <span className="ml-dot" /> Demo mode · no real patient data
              </motion.span>
              <motion.h1 {...reveal(0.05)}>
                The calm EMR for clinics that still run on <span className="ml-em">paper</span>.
              </motion.h1>
              <motion.p className="ml-sub" {...reveal(0.12)}>
                Medyra is a lightweight, free electronic medical record system — patient records,
                scheduling, and analytics in one clean workspace. Built for small practices, not
                enterprise budgets.
              </motion.p>
              <motion.div className="ml-hero-cta" {...reveal(0.18)}>
                <Link className="ml-btn ml-btn-primary" to={DEMO_URL}>
                  Try the live demo <span className="ml-arrow">→</span>
                </Link>
                <a className="ml-btn ml-btn-ghost" href="#features">
                  Explore features
                </a>
              </motion.div>
              <motion.div className="ml-trust-line" {...reveal(0.24)}>
                <span className="ml-tl"><Check size={15} /> Free &amp; open demo</span>
                <span className="ml-tl"><Check size={15} /> No sign-up to look around</span>
                <span className="ml-tl"><Check size={15} /> Built from real clinical EMR experience</span>
              </motion.div>
            </div>

            <motion.div className="ml-mock-stage" onMouseMove={onMove} onMouseLeave={onLeave} {...reveal(0.15)}>
              <motion.div className="ml-mock" style={{ transform }}>
                <div className="ml-mock-top">
                  <div className="ml-mt-l"><span className="ml-g" /> Medyra · Dashboard</div>
                  <div className="ml-mock-dots"><span /><span /><span /></div>
                </div>
                <div className="ml-kpi-row">
                  <div className="ml-kpi"><div className="ml-l">Patients</div><div className="ml-v"><CountUp to={248} /></div></div>
                  <div className="ml-kpi"><div className="ml-l">Today</div><div className="ml-v"><CountUp to={12} /></div></div>
                  <div className="ml-kpi"><div className="ml-l">Confirmed</div><div className="ml-v"><CountUp to={9} /><small>75%</small></div></div>
                </div>
                <div className="ml-mock-chart">
                  <div className="ml-mc-head"><span className="ml-t">Visit types</span><span className="ml-lg"><i /> This month</span></div>
                  <div className="ml-bars">
                    {chartBars.map((b, i) => (
                      <div className="ml-bar-col" key={i}>
                        <GrowBar h={b.h} alt={b.alt} />
                        <span className="ml-m">{["Mar", "Apr", "May", "Jun", "Jul", "Aug"][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ml-mock-list">
                  <div className="ml-li"><span className="ml-av">AN</span><div><div className="ml-nm">Asha Nair</div><div className="ml-tm">General check-up · 9:30</div></div><span className="ml-sp ok">Confirmed</span></div>
                  <div className="ml-li"><span className="ml-av">RK</span><div><div className="ml-nm">Ravi Kumar</div><div className="ml-tm">Follow-up · 10:15</div></div><span className="ml-sp wait">Pending</span></div>
                  <div className="ml-li"><span className="ml-av">MF</span><div><div className="ml-nm">Meera Fernandes</div><div className="ml-tm">Consultation · 11:00</div></div><span className="ml-sp ok">Confirmed</span></div>
                </div>
              </motion.div>

              <motion.div className="ml-float-card ml-fc1" {...bob(0)}>
                <span className="ml-fc-ic" style={{ background: "rgba(14,124,83,.14)", color: "var(--ml-green)" }}><UserPlus size={16} /></span>
                <div><div className="ml-ft">New patient added</div><div className="ml-fs">Asha Nair · just now</div></div>
              </motion.div>
              <motion.div className="ml-float-card ml-fc2" {...bob(0.6)}>
                <span className="ml-fc-ic" style={{ background: "rgba(14,143,168,.14)", color: "var(--ml-cyan)" }}><BellRing size={16} /></span>
                <div><div className="ml-ft">Reminder sent</div><div className="ml-fs">10:00 AM visit · demo</div></div>
              </motion.div>
              <motion.div className="ml-float-card ml-fc3" {...bob(0.3)}>
                <span className="ml-fc-ic" style={{ background: "rgba(13,110,104,.14)", color: "var(--ml-primary)" }}><TrendingUp size={16} /></span>
                <div><div className="ml-ft">Analytics updated</div><div className="ml-fs">+18% visits vs last month</div></div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* STATS */}
        <div className="ml-stats">
          <div className="ml-wrap ml-stats-grid">
            <motion.div className="ml-stat" {...reveal(0)}><div className="ml-v"><CountUp to={0} prefix="$" /></div><div className="ml-k">Free for small clinics</div></motion.div>
            <motion.div className="ml-stat" {...reveal(0.06)}><div className="ml-v"><CountUp to={75} suffix="+" /></div><div className="ml-k">Automated backend tests</div></motion.div>
            <motion.div className="ml-stat" {...reveal(0.12)}><div className="ml-v"><CountUp to={100} suffix="%" /></div><div className="ml-k">Demo-safe · no real data</div></motion.div>
            <motion.div className="ml-stat" {...reveal(0.18)}><div className="ml-v"><CountUp to={11} /></div><div className="ml-k">Versioned DB migrations</div></motion.div>
          </div>
        </div>

        {/* FEATURES */}
        <section className="ml-sec" id="features">
          <div className="ml-wrap">
            <motion.div className="ml-sec-head" {...reveal()}>
              <span className="ml-eyebrow">Everything a small clinic needs</span>
              <h2>One tidy workspace for the whole practice</h2>
              <p>From the front desk to the follow-up — patients, appointments, and insight without the enterprise weight.</p>
            </motion.div>
            <div className="ml-bento">
              <motion.div className="ml-card ml-feature-hero" {...reveal()}>
                <div>
                  <div className="ml-fic"><Activity size={22} /></div>
                  <h3>Analytics that read like a morning briefing</h3>
                  <p>Hand-built D3 charts turn your day into a glance: visit trends, confirmation rates, and what's coming next — no spreadsheets, no setup.</p>
                </div>
                <div className="ml-mini-dash">
                  <div className="ml-row"><span>Visits this week</span><span className="ml-pill g">+18%</span></div>
                  <div className="ml-row"><span>Confirmed</span><span className="ml-pill">75%</span></div>
                  <div className="ml-row"><span>Pending reminders</span><span className="ml-pill">4</span></div>
                  <div className="ml-row"><span>New patients</span><span className="ml-pill g">+9</span></div>
                </div>
              </motion.div>

              <motion.div className="ml-card ml-c-third" {...reveal()}>
                <div className="ml-fic"><Users size={22} /></div>
                <h3>Patient records</h3>
                <p>Demographics, notes, and visit history — organized, searchable, and private to your clinic.</p>
              </motion.div>
              <motion.div className="ml-card ml-c-third" {...reveal(0.06)}>
                <div className="ml-fic"><CalendarDays size={22} /></div>
                <h3>Smart scheduling</h3>
                <p>Book, confirm, reschedule, and complete — appointments with a real status lifecycle.</p>
              </motion.div>
              <motion.div className="ml-card ml-c-third" {...reveal(0.12)}>
                <div className="ml-fic"><BellRing size={22} /></div>
                <h3>Demo reminders</h3>
                <p>See the reminder workflow end-to-end — simulated, so nothing ever reaches a real inbox.</p>
              </motion.div>

              <motion.div className="ml-card ml-c-half" {...reveal()}>
                <div className="ml-fic"><FileCheck2 size={22} /></div>
                <h3>Audit trail on every action</h3>
                <p>Who changed what, and when. Medyra logs key actions automatically — accountability without extra effort.</p>
              </motion.div>
              <motion.div className="ml-card ml-c-half" {...reveal(0.06)}>
                <div className="ml-fic"><Compass size={22} /></div>
                <h3>Guided onboarding &amp; sample data</h3>
                <p>A first-run tour and one-click sample records mean a new clinic is exploring in seconds, not hours.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section className="ml-sec" id="workflow" style={{ background: "var(--ml-paper)", borderTop: "1px solid var(--ml-line)", borderBottom: "1px solid var(--ml-line)" }}>
          <div className="ml-wrap">
            <motion.div className="ml-sec-head" {...reveal()}>
              <span className="ml-eyebrow">How it works</span>
              <h2>Running by the end of your coffee</h2>
              <p>No migrations, no consultants. Three steps from paper to a working digital record.</p>
            </motion.div>
            <div className="ml-flow">
              {[
                { n: "1", t: "Create your clinic", d: "Sign up as clinic staff with a secure login. Your data is isolated to your account from the first minute.", line: true },
                { n: "2", t: "Add patients & book", d: "Capture demographics and notes, then schedule appointments with confirm, reschedule, and complete states.", line: true },
                { n: "3", t: "Track & improve", d: "Watch the analytics dashboard fill in, keep an eye on the audit log, and let demo reminders do the chasing.", line: false }
              ].map((s, i) => (
                <motion.div className="ml-step" key={s.n} {...reveal(i * 0.08)}>
                  <div className="ml-n">{s.n}</div>
                  {s.line && <span className="ml-ln" />}
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* DEEP DIVE 1 — ANALYTICS */}
        <section className="ml-sec">
          <div className="ml-wrap ml-dive">
            <motion.div className="ml-dcopy" {...reveal()}>
              <span className="ml-eyebrow">The dashboard</span>
              <h2>Your clinic's day, at a glance</h2>
              <p className="ml-d">Open Medyra and the picture is already there — how many patients, how many visits, how many still need a nudge. Built with D3 so every chart is crisp, responsive, and genuinely yours.</p>
              <div className="ml-dlist">
                <div className="ml-di"><Check size={18} /><span><b>Live KPIs</b> — patients, today's visits, and confirmation rate up top.</span></div>
                <div className="ml-di"><Check size={18} /><span><b>Visit-type trends</b> — hand-built bar &amp; line charts, no chart-library bloat.</span></div>
                <div className="ml-di"><Check size={18} /><span><b>What's next panel</b> — the day's upcoming appointments, ranked.</span></div>
              </div>
            </motion.div>
            <motion.div className="ml-panel" {...reveal(0.1)}>
              <div className="ml-kpi-row">
                <div className="ml-kpi"><div className="ml-l">Revenue-ready visits</div><div className="ml-v">156</div></div>
                <div className="ml-kpi"><div className="ml-l">Confirmed</div><div className="ml-v">112</div></div>
                <div className="ml-kpi"><div className="ml-l">Unconfirmed</div><div className="ml-v">44</div></div>
              </div>
              <div className="ml-mock-chart" style={{ marginBottom: 0 }}>
                <div className="ml-mc-head"><span className="ml-t">Visits over time</span><span className="ml-lg"><i /> 6 months</span></div>
                <div className="ml-bars">
                  {diveBars.map((b, i) => (
                    <div className="ml-bar-col" key={i}>
                      <GrowBar h={b.h} alt={b.alt} />
                      <span className="ml-m">{["Mar", "Apr", "May", "Jun", "Jul", "Aug"][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* DEEP DIVE 2 — SCHEDULING */}
        <section className="ml-sec" style={{ paddingTop: 0 }}>
          <div className="ml-wrap ml-dive rev">
            <motion.div className="ml-dcopy" {...reveal()}>
              <span className="ml-eyebrow">Scheduling</span>
              <h2>Appointments with a real lifecycle</h2>
              <p className="ml-d">Not just a calendar — a workflow. Every appointment moves through booked, confirmed, and completed, with the actions a front desk actually uses, and a themed date-time picker that matches the rest of the app.</p>
              <div className="ml-dlist">
                <div className="ml-di"><Check size={18} /><span><b>Status at a glance</b> — colour-coded confirmed, pending, and consultation states.</span></div>
                <div className="ml-di"><Check size={18} /><span><b>One-tap actions</b> — confirm, reschedule, or complete without leaving the list.</span></div>
                <div className="ml-di"><Check size={18} /><span><b>Demo reminders</b> — the full nudge flow, safely simulated.</span></div>
              </div>
            </motion.div>
            <motion.div className="ml-panel" {...reveal(0.1)}>
              <div className="ml-sch-head"><span className="ml-t">Thursday, 18 September</span><span className="ml-d">4 appointments</span></div>
              <div className="ml-slot g"><span className="ml-bar2" /><span className="ml-time">09:30</span><div><div className="ml-nm">Asha Nair</div><div className="ml-ty">General check-up</div></div><span className="ml-st">Confirmed</span></div>
              <div className="ml-slot a"><span className="ml-bar2" /><span className="ml-time">10:15</span><div><div className="ml-nm">Ravi Kumar</div><div className="ml-ty">Follow-up</div></div><span className="ml-st">Pending</span></div>
              <div className="ml-slot c"><span className="ml-bar2" /><span className="ml-time">11:00</span><div><div className="ml-nm">Meera Fernandes</div><div className="ml-ty">Consultation</div></div><span className="ml-st">Consult</span></div>
              <div className="ml-slot g"><span className="ml-bar2" /><span className="ml-time">11:45</span><div><div className="ml-nm">Sunil Rao</div><div className="ml-ty">Blood pressure review</div></div><span className="ml-st">Confirmed</span></div>
            </motion.div>
          </div>
        </section>

        {/* DEEP DIVE 3 — RECORDS */}
        <section className="ml-sec" style={{ paddingTop: 0 }}>
          <div className="ml-wrap ml-dive">
            <motion.div className="ml-dcopy" {...reveal()}>
              <span className="ml-eyebrow">Patient records</span>
              <h2>Every patient, private to your clinic</h2>
              <p className="ml-d">Medyra is multi-tenant by design — each clinic account only ever sees its own patients, enforced on the server and covered by tests. Search, open, and read a full history in a couple of clicks.</p>
              <div className="ml-dlist">
                <div className="ml-di"><Check size={18} /><span><b>Isolated by account</b> — tenant separation enforced in the backend.</span></div>
                <div className="ml-di"><Check size={18} /><span><b>Full demographics &amp; notes</b> — the details a visit actually needs.</span></div>
                <div className="ml-di"><Check size={18} /><span><b>Clean, searchable list</b> — find anyone fast, even as records grow.</span></div>
              </div>
            </motion.div>
            <motion.div className="ml-panel" {...reveal(0.1)}>
              {[
                { in: "AN", nm: "Asha Nair", me: "39 · F · last visit Oct 20", tag: "Active" },
                { in: "RK", nm: "Ravi Kumar", me: "52 · M · last visit Sep 05", tag: "Active" },
                { in: "MF", nm: "Meera Fernandes", me: "34 · F · last visit Sep 04", tag: "Active" },
                { in: "SR", nm: "Sunil Rao", me: "61 · M · last visit Oct 04", tag: "Follow-up" },
                { in: "PV", nm: "Priya Verma", me: "28 · F · last visit Oct 07", tag: "Active" }
              ].map((r) => (
                <div className="ml-rec-row" key={r.nm}>
                  <span className="ml-av">{r.in}</span>
                  <div><div className="ml-nm">{r.nm}</div><div className="ml-me">{r.me}</div></div>
                  <span className="ml-tag">{r.tag}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* SECURITY */}
        <section className="ml-sec ml-sec-dark" id="security">
          <div className="ml-wrap">
            <motion.div className="ml-sec-head" {...reveal()}>
              <span className="ml-eyebrow">Built to be trusted</span>
              <h2>Security that fits a clinic, not a committee</h2>
              <p>Medyra is a demo — but it's engineered like production. The safeguards a real EMR needs, baked in from the start.</p>
            </motion.div>
            <div className="ml-sgrid">
              {securityItems.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div className="ml-scard" key={s.title} {...reveal((i % 3) * 0.06)}>
                    <div className="ml-sic"><Icon size={20} /></div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BUILT WITH */}
        <section className="ml-sec" id="built">
          <div className="ml-wrap">
            <motion.div className="ml-sec-head" {...reveal()}>
              <span className="ml-eyebrow">Built end-to-end by one engineer</span>
              <h2>A full-stack project, start to finish</h2>
              <p>Design, frontend, backend, database, and deployment — Medyra is a portfolio piece built the way a real product is shipped.</p>
            </motion.div>
            <motion.div className="ml-stack-row" {...reveal(0.05)}>
              {techStack.map((t) => (
                <span className="ml-tech" key={t.n}><span className="ml-td" style={{ background: t.c }} />{t.n}</span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="ml-sec" id="faq" style={{ background: "var(--ml-paper)", borderTop: "1px solid var(--ml-line)" }}>
          <div className="ml-wrap">
            <motion.div className="ml-sec-head" {...reveal()}>
              <span className="ml-eyebrow">Questions, answered</span>
              <h2>Good to know</h2>
            </motion.div>
            <div className="ml-faq">
              {faqs.map((f, i) => (
                <FaqItem key={f.q} item={f} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="ml-sec">
          <div className="ml-wrap">
            <motion.div className="ml-cta-final" {...reveal()}>
              <h2>See Medyra in action</h2>
              <p>Open the demo, load the sample clinic, and click around — no real patient data, nothing at stake.</p>
              <div className="ml-hero-cta">
                <Link className="ml-btn ml-btn-white" to={DEMO_URL}>Create your clinic <span className="ml-arrow">→</span></Link>
                <Link className="ml-btn ml-btn-outline-w" to={LOGIN_URL}>Log in</Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="ml-footer">
          <div className="ml-wrap">
            <div className="ml-foot">
              <div className="ml-fb">
                <div className="ml-brand"><BrandGlyph /> Medyra</div>
                <p>A lightweight, free electronic medical record for small clinics. A demo-first, full-stack portfolio project.</p>
              </div>
              <div className="ml-foot-links">
                <div className="ml-fcol"><h4>Product</h4><a href="#features">Features</a><a href="#workflow">Workflow</a><a href="#security">Security</a><Link to={DEMO_URL}>Live demo</Link></div>
                <div className="ml-fcol"><h4>Project</h4><a href="#built">Built with</a><a href="#faq">FAQ</a><a href="#security">Engineering</a></div>
                <div className="ml-fcol"><h4>Try it</h4><Link to={DEMO_URL}>Open demo</Link><Link to={DEMO_URL}>Create a clinic login</Link><Link to={LOGIN_URL}>Log in</Link></div>
              </div>
            </div>
            <div className="ml-foot-base">
              <span>© 2026 Medyra · A portfolio project. Demo only — not for real patient data.</span>
              <span>Designed &amp; built end-to-end by one engineer.</span>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
};

export default LandingPage;
