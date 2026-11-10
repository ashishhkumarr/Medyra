import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  BellRing,
  CalendarDays,
  Check,
  ClipboardList,
  Facebook,
  HeartPulse,
  Instagram,
  Linkedin,
  Plus,
  Twitter,
  X
} from "lucide-react";

import heroDoctor from "../assets/landing/hero-doctor.png";
import consultation from "../assets/landing/consultation.png";
import "../styles/landing.css";

const DEMO_URL = "/signup";
const LOGIN_URL = "/login";

/* ---------------- motion ---------------- */
const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.2, 0.7, 0.3, 1] as const, delay }
});

/* ---------------- brand mark ---------------- */
const Glyph = ({ className = "ml-glyph" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
    <path d="M16 3 5 7.5V15c0 6.5 4.8 10.8 11 13 6.2-2.2 11-6.5 11-13V7.5Z" fill="#2E3A26" />
    <path
      d="M16 20c-4.2-3.2-6.5-5-6.5-7.6A2.8 2.8 0 0 1 16 10.3a2.8 2.8 0 0 1 6.5 2.1c0 2.6-2.3 4.4-6.5 7.6Z"
      fill="#9FBF60"
    />
  </svg>
);

/* ---------------- data ---------------- */
const TECH = ["React", "TypeScript", "FastAPI", "PostgreSQL", "Docker"];

const PRINCIPLES = [
  {
    t: "Structured the way clinicians think",
    d: "Visits follow the SOAP note — subjective, objective, assessment, plan — and vitals are captured once at intake, then flow into the chart. The structure mirrors how care actually gets documented."
  },
  {
    t: "Safe in the small details",
    d: "Two patients with the same name are told apart by date of birth and contact before you book. Signed notes lock and timestamp. Demo mode never sends a real message."
  },
  {
    t: "Trends, not just snapshots",
    d: "Vitals are plotted across every visit, so a blood pressure creeping up over months is visible at a glance instead of buried in a single reading."
  },
  {
    t: "Built like a production system",
    d: "Tenant-isolated data, a typed FastAPI backend, PostgreSQL, an automated test suite, containerized with Docker and deployed on real cloud infrastructure — the foundations a shipping product runs on."
  }
];

const FAQS = [
  { q: "Is Medyra really free?", a: "Yes. Medyra is a free, demo-first electronic medical record built so any small clinic — especially ones still on paper — can try a modern chart without cost or a sales call." },
  { q: "Can I enter real patient data?", a: "Please don't. Medyra runs in demo mode and isn't intended for protected health information. Reminders are simulated and never leave the app, so it's safe to explore with synthetic data." },
  { q: "Who is Medyra for?", a: "Small clinics and solo practitioners who want to see what a lightweight digital record feels like — and anyone evaluating the engineering behind a full-stack EMR." },
  { q: "What is Medyra built with?", a: "A React + TypeScript front end on Vercel, a FastAPI back end on Google Cloud Run, and a PostgreSQL database on Supabase — containerized with Docker and covered by an automated test suite." },
  { q: "How do I get started?", a: "Create a clinic login, load the sample data, and you're exploring patients, scheduling, and clinical notes in under a minute. Nothing to install." }
];

type Story = {
  cat: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  read: string;
  variant: "photo" | "invoice" | "nodes";
  body: { h?: string; p?: string; list?: string[] }[];
};

const STORIES: Story[] = [
  {
    cat: "Practice management",
    title: "Going paperless: a small clinic's first week",
    excerpt: "A practical, day-by-day look at moving a two-provider practice off paper charts — without losing a single afternoon to setup.",
    date: "Nov 2, 2026",
    author: "Medyra Team",
    read: "4 min read",
    variant: "nodes",
    body: [
      { p: "Most small clinics don't avoid going digital because they're attached to paper — they avoid it because every migration they've seen took a quarter and a consultant. It doesn't have to. Here's how a two-provider family practice made the switch in a week, an hour at a time." },
      { h: "Day 1 — Stand up the clinic", p: "Create your clinic login and load the sample data so the front desk can click around a populated chart before any real information goes in. Nothing is installed; it runs in the browser. The goal of day one isn't to move data — it's to let everyone see where things live." },
      { h: "Day 2–3 — Bring patients across", p: "Add your active roster first, not your whole history. A patient who's coming in this week matters more than one who hasn't visited in three years. Demographics, a phone number, and a short note are enough to start; the chart fills itself in as you see people." },
      { h: "Day 4–5 — Chart one real visit", p: "The moment it clicks is the first visit you document live: vitals at intake, a SOAP note during the exam, a signature at the end. After that, the paper binder stops being the source of truth and the screen takes over — usually without anyone deciding it formally." },
      { h: "The quiet win", p: "By the end of the week, the thing that changes isn't speed — it's that information stops living in someone's handwriting in a drawer. Anyone on the team can find a patient's last BP in two clicks, and that's the difference paper never gives you." }
    ]
  },
  {
    cat: "Clinical",
    title: "Why the SOAP note still runs the exam room",
    excerpt: "Subjective, Objective, Assessment, Plan has outlasted every documentation fad for a reason. A short defense of the format — and how to keep it fast.",
    date: "Oct 24, 2026",
    author: "Medyra Team",
    read: "3 min read",
    variant: "photo",
    body: [
      { p: "Documentation trends come and go, but open almost any chart in almost any clinic and you'll find the same four letters structuring the visit: S, O, A, P. It has survived because it mirrors how clinicians actually think." },
      { h: "It separates story from signal", p: "Subjective is what the patient tells you; Objective is what you measure. Keeping them apart stops the two from blurring — a reported symptom never quietly becomes a recorded finding, and a vital sign never gets colored by a complaint." },
      { h: "It forces a decision", p: "The Assessment is where a pile of observations becomes a clinical judgment, and the Plan turns that judgment into an action someone can follow next week. A note without those two sections is a transcript, not a record." },
      { h: "Keeping it fast", p: "The format gets a bad reputation when the tooling makes it slow. The fix is a chart where vitals are captured once at intake and flow into the note, where the four fields are right there in front of you, and where signing locks the note so it becomes a real part of the history. Structure shouldn't cost you time — it should save it." }
    ]
  },
  {
    cat: "Analytics",
    title: "Five numbers every small clinic should watch",
    excerpt: "You don't need a dashboard with forty charts. You need five numbers that tell you whether this week is going well — and what to do if it isn't.",
    date: "Oct 15, 2026",
    author: "Medyra Team",
    read: "3 min read",
    variant: "invoice",
    body: [
      { p: "Analytics for a small practice shouldn't feel like running a hedge fund. Most of what matters fits on a single screen. These are the five numbers worth glancing at each morning." },
      { list: [
        "Visits today — the shape of the day, at a glance.",
        "Confirmation rate — how many of today's appointments are actually confirmed.",
        "Pending notes — visits you've seen but haven't finished charting.",
        "New patients this month — whether the practice is growing or holding.",
        "No-show rate — the quiet number that decides whether your schedule is honest."
      ] },
      { h: "Why these five", p: "Each one maps to an action. A low confirmation rate means send reminders. A stack of pending notes means block ten minutes before you leave. A rising no-show rate means your reminders aren't landing. The point of a number is the decision it changes — everything else is decoration." },
      { h: "Watch the trend, not the day", p: "A single day tells you almost nothing; the direction over a few weeks tells you everything. A confirmation rate drifting down is worth more attention than one bad Tuesday. Good clinic analytics are less about precision and more about noticing, early, when something starts to move." }
    ]
  }
];

/* ---------------- page ---------------- */
const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openStory, setOpenStory] = useState<Story | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = openStory ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openStory]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="ml-root">
        {/* ANNOUNCEMENT */}
        <div className="ml-announce">
          Ready to see Medyra in action? Explore the free, open EHR demo —{" "}
          <Link to={DEMO_URL}>start free today</Link>.
        </div>

        {/* NAV */}
        <header className={`ml-nav${scrolled ? " scrolled" : ""}`}>
          <div className="ml-wrap ml-nav-inner">
            <Link to="/" className="ml-brand">
              <Glyph /> Medyra
            </Link>
            <nav className="ml-nav-links">
              <a href="#features">Product</a>
              <a href="#care">Why Medyra</a>
              <a href="#stories">Resources</a>
              <a href="#how-its-built">How it&rsquo;s built</a>
              <a href="#faq">FAQ</a>
            </nav>
            <div className="ml-nav-cta">
              <Link className="ml-btn ml-btn-outline ml-btn-sm ml-hide-sm" to={LOGIN_URL}>Log in</Link>
              <Link className="ml-btn ml-btn-primary ml-btn-sm" to={DEMO_URL}>Start free</Link>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="ml-hero">
          <div className="ml-wrap ml-hero-grid">
            <motion.div {...reveal(0)}>
              <h1>One calm chart for the whole clinic</h1>
              <p className="ml-sub">
                From scheduling to clinical notes and vitals, Medyra keeps patients, visits,
                and history together in one place — so you can focus on care, not software.
              </p>
              <div className="ml-hero-cta">
                <Link className="ml-btn ml-btn-primary" to={DEMO_URL}>Start for free</Link>
                <Link className="ml-btn ml-btn-outline" to={LOGIN_URL}>View the demo</Link>
              </div>
              <div className="ml-trust">
                <p className="ml-tl">Built with a modern, production-grade stack:</p>
                <div className="ml-logos">
                  {TECH.map((t) => (
                    <span className="ml-logo" key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div className="ml-hero-visual" {...reveal(0.12)}>
              <img className="ml-hero-doc" src={heroDoctor} alt="A clinician using Medyra on a laptop" />
              <div className="ml-dash">
                <div className="ml-dash-top"><span className="ml-g" /> Medyra · Dashboard</div>
                <div className="ml-dash-kpis">
                  <div className="ml-dk"><div className="l">Patients</div><div className="v">248</div></div>
                  <div className="ml-dk"><div className="l">Today</div><div className="v">12</div></div>
                </div>
                <div className="ml-dash-chart">
                  <div className="ch-head"><b>Visit types</b><span>This month</span></div>
                  <div className="ml-bars">
                    {[46, 62, 54, 78, 66, 90].map((h, i) => (
                      <div className="bcol" key={i}>
                        <div className={`bar${i % 2 ? " dim" : ""}`} style={{ height: `${h}%` }} />
                        <span className="bm">{["Mar", "Apr", "May", "Jun", "Jul", "Aug"][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <motion.div className="ml-float ml-fc-patient">
                <span className="av">AN</span>
                <div><div className="nm">Asha Nair</div><div className="rl">Patient · new visit</div></div>
              </motion.div>
              <motion.div className="ml-float ml-fc-remind">
                <div className="rt"><BellRing size={14} /> Reminder</div>
                <div className="rs">Appointment tomorrow at 10:00 AM.</div>
                <div className="rb">Confirm</div>
              </motion.div>
              <motion.div className="ml-float light ml-fc-ring">
                <span className="ml-ring"><span>156</span></span>
                <div>
                  <div className="rv">Upcoming visits</div>
                  <div className="rvs"><span className="dot" style={{ background: "var(--ml-gold)" }} />112 confirmed</div>
                  <div className="rvs"><span className="dot" style={{ background: "var(--ml-ink-mute)" }} />44 unconfirmed</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* SHEET (cream) */}
        <div className="ml-sheet">
          {/* FEATURES */}
          <section className="ml-sec" id="features">
            <div className="ml-wrap">
              <motion.div className="ml-sec-head" {...reveal()}>
                <div className="ml-ratings">
                  <span className="rt"><Check size={15} /> Free &amp; open demo</span>
                  <span className="rt"><Check size={15} /> No sign-up to look around</span>
                </div>
                <h2>Everything your clinic runs on</h2>
                <p>Scheduling, charting, vitals, and insight — in one lightweight workspace, not five tabs.</p>
              </motion.div>

              <div className="ml-features">
                <motion.div className="ml-fcard" {...reveal(0)}>
                  <h3>Scheduling</h3>
                  <p>Book, confirm, and track visits with a real status lifecycle.</p>
                  <div className="ml-mini">
                    <div className="ml-mini-av"><span className="a">AN</span><div><div className="nm">Book an appointment</div><div className="mt">Mon, 20 March</div></div></div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <span className="ml-chip"><CalendarDays size={12} /> 11:30</span>
                      <span className="ml-chip"><CalendarDays size={12} /> 12:00</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div className="ml-fcard" {...reveal(0.06)}>
                  <h3>Charting</h3>
                  <p>SOAP notes and patient history, all in one view.</p>
                  <div className="ml-mini">
                    <div className="ml-mini-av"><span className="a">EJ</span><div><div className="nm">Emily Johnson</div><div className="mt">14 Feb 1985</div></div></div>
                    <div className="ml-vit">
                      <div className="v"><div className="vl">Temp</div><div className="vv">98°F</div></div>
                      <div className="v"><div className="vl">SpO₂</div><div className="vv">97%</div></div>
                      <div className="v"><div className="vl">BMI</div><div className="vv">23.5</div></div>
                    </div>
                  </div>
                </motion.div>

                <motion.div className="ml-fcard" {...reveal(0.12)}>
                  <h3>Vitals</h3>
                  <p>Capture vitals once — watch the trend over every visit.</p>
                  <div className="ml-mini">
                    <div className="row"><span>Blood pressure</span><b style={{ color: "var(--ml-forest)" }}>126/82</b></div>
                    <div className="ml-spark">
                      {[60, 72, 54, 80, 68, 90].map((h, i) => (
                        <i key={i} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div className="ml-fcard" {...reveal(0.18)}>
                  <h3>Analytics</h3>
                  <p>The day's numbers, read like a morning briefing.</p>
                  <div className="ml-mini">
                    <div className="row"><span>Visits this week</span><span className="ml-chip">+18%</span></div>
                    <svg viewBox="0 0 120 44" className="ml-line-mini" preserveAspectRatio="none">
                      <polyline points="0,36 24,30 48,34 72,16 96,22 120,8" fill="none" stroke="var(--ml-lime)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="120" cy="8" r="3" fill="var(--ml-forest)" />
                    </svg>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* DEEP DIVE */}
          <section className="ml-sec" id="care" style={{ paddingTop: 0 }}>
            <div className="ml-wrap ml-dive">
              <motion.div className="ml-notes" {...reveal()}>
                <div className="ml-notes-photo">
                  <img src={consultation} alt="A clinician in conversation with a patient" loading="lazy" />
                </div>
                <div className="ml-notes-card">
                  <div className="nh"><span className="g" /> Clinical note · signed</div>
                  <div className="nsec"><div className="t">Subjective</div><div className="b">Cough and mild fever for three days. No shortness of breath.</div></div>
                  <div className="nsec"><div className="t">Assessment &amp; plan</div><div className="b">Acute viral URI. Rest, fluids, review in 5 days if not improving.</div></div>
                </div>
              </motion.div>

              <motion.div className="ml-dcopy" {...reveal(0.1)}>
                <span className="ml-eyebrow">Care, documented</span>
                <h2>Every visit, written straight into the chart</h2>
                <p className="d">
                  Vitals captured at intake flow into the note. You chart the exam in a clean SOAP layout,
                  sign it, and it locks into the patient's history — traceable, never lost in a drawer.
                </p>
                <div className="ml-dlist">
                  <div className="di"><h4>Capture vitals once</h4><p>BP, HR, temp, SpO₂, weight — recorded at intake and trended across visits automatically.</p></div>
                  <div className="di"><h4>Chart in SOAP, fast</h4><p>Subjective, Objective, Assessment, Plan — the format every clinician already thinks in.</p></div>
                  <div className="di"><h4>Sign &amp; lock</h4><p>A signed note becomes part of the record: immutable, dated, and accountable.</p></div>
                </div>
              </motion.div>
            </div>
          </section>
        </div>

        {/* HOW IT'S BUILT */}
        <section className="ml-testi" id="how-its-built">
          <div className="ml-wrap">
            <motion.div className="ml-sec-head" {...reveal()}>
              <span className="ml-kicker">A portfolio project · built solo</span>
              <h2>Built by one developer, end to end.</h2>
              <p>From the database schema to the design system, every part of Medyra was built with intent. Here&rsquo;s the clinical and engineering reasoning behind it.</p>
            </motion.div>

            <motion.figure className="ml-note" {...reveal(0.05)}>
              <blockquote>
                I&rsquo;m a product engineer, and I built Medyra end to end on my own — from the PostgreSQL schema and FastAPI backend to the React front end, the design system, and the deploy pipeline. I wanted to see whether I could take something as involved as a clinical record from an empty repository to a polished, working product. Everything you can click here is real and functional, running on the same stack a production app would use.
              </blockquote>
              <figcaption>— Ashish Kumar, product engineer</figcaption>
            </motion.figure>

            <div className="ml-pgrid">
              {PRINCIPLES.map((p, i) => (
                <motion.div className="ml-pcard" key={p.t} {...reveal((i % 2) * 0.05)}>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="ml-sec" id="faq">
          <div className="ml-wrap">
            <motion.div className="ml-sec-head" {...reveal()}>
              <h2>Frequently asked questions</h2>
            </motion.div>
            <div className="ml-faq">
              {FAQS.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div className={`ml-q${open ? " open" : ""}`} key={f.q}>
                    <button onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open}>
                      {f.q}
                      <span className="ic"><Plus size={16} /></span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div className="ans" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.2, 0.7, 0.3, 1] }} style={{ overflow: "hidden" }}>
                          <p>{f.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* STORIES */}
        <section className="ml-sec" id="stories" style={{ paddingTop: 0 }}>
          <div className="ml-wrap">
            <motion.div className="ml-stories-head" {...reveal()}>
              <h2>Guidance &amp; stories</h2>
            </motion.div>
            <div className="ml-stories">
              {STORIES.map((s, i) => (
                <motion.button className="ml-story" key={s.title} onClick={() => setOpenStory(s)} {...reveal((i) * 0.07)}>
                  <div className="ml-story-img">
                    {s.variant === "photo" ? (
                      <div className="ml-story-graphic">
                        <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
                          <rect x="34" y="16" width="52" height="48" rx="8" fill="#394831" />
                          <rect x="44" y="26" width="32" height="3" rx="1.5" fill="#9FBF60" />
                          <rect x="44" y="34" width="24" height="3" rx="1.5" fill="#D8E6BB" opacity=".6" />
                          <path d="M42 50 h8 l3 -8 4 14 3 -6 h15" stroke="#9FBF60" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ) : s.variant === "invoice" ? (
                      <div className="ml-story-graphic">
                        <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
                          <rect x="42" y="14" width="36" height="52" rx="4" fill="#D8E6BB" />
                          {[24, 32, 40, 48].map((y) => <rect key={y} x="48" y={y} width="24" height="3" rx="1.5" fill="#2E3A26" opacity=".4" />)}
                          <circle cx="30" cy="26" r="7" fill="#394831" /><circle cx="90" cy="26" r="7" fill="#394831" />
                          <circle cx="30" cy="54" r="7" fill="#394831" /><circle cx="90" cy="54" r="7" fill="#394831" />
                        </svg>
                      </div>
                    ) : (
                      <div className="ml-story-graphic ml-sg-nodes">
                        <span className="n"><HeartPulse size={18} color="#9FBF60" /></span>
                        <span className="doc" />
                        <span className="n"><ClipboardList size={18} color="#9FBF60" /></span>
                      </div>
                    )}
                  </div>
                  <span className="ml-story-cat">{s.cat}</span>
                  <h3>{s.title}</h3>
                  <p className="ex">{s.excerpt}</p>
                  <p className="meta">{s.date} · {s.author} · {s.read}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="ml-wrap ml-final">
          <motion.div {...reveal()}>
            <h2>Bring your clinic online</h2>
            <p>Join the small practices simplifying scheduling, charting, and patient care in one calm place.</p>
            <div className="ml-hero-cta">
              <Link className="ml-btn ml-btn-primary" to={DEMO_URL}>Start for free</Link>
              <Link className="ml-btn ml-btn-outline" to={LOGIN_URL}>Log in</Link>
            </div>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="ml-footer">
          <div className="ml-wrap">
            <div className="ml-foot">
              <div className="fb">
                <Link to="/" className="ml-brand"><Glyph /> Medyra</Link>
                <p>A lightweight, free electronic medical record for small clinics. A demo-first, full-stack project.</p>
                <div className="fsoc">
                  <a href="#" aria-label="LinkedIn"><Linkedin size={16} /></a>
                  <a href="#" aria-label="X"><Twitter size={16} /></a>
                  <a href="#" aria-label="Instagram"><Instagram size={16} /></a>
                  <a href="#" aria-label="Facebook"><Facebook size={16} /></a>
                </div>
              </div>
              <div className="ml-fcol"><h4>Product</h4><a href="#features">Scheduling</a><a href="#features">Charting</a><a href="#features">Vitals</a><a href="#features">Analytics</a></div>
              <div className="ml-fcol"><h4>Resources</h4><a href="#stories">Guidance</a><a href="#faq">FAQ</a><a href="#how-its-built">How it&rsquo;s built</a></div>
              <div className="ml-fcol"><h4>Get started</h4><Link to={DEMO_URL}>Create a clinic login</Link><Link to={LOGIN_URL}>Log in</Link><Link to={DEMO_URL}>Open the demo</Link></div>
            </div>
            <div className="ml-foot-base">
              <span>© 2026 Medyra · Demo only — not for real patient data.</span>
              <span className="lnks"><a href="#">Privacy</a><a href="#">Terms</a><a href="#faq">Security</a></span>
            </div>
          </div>
        </footer>

        {/* STORY MODAL */}
        <AnimatePresence>
          {openStory && (
            <motion.div className="ml-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenStory(null)}>
              <motion.div className="ml-modal" initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.98 }} transition={{ duration: 0.3, ease: [0.2, 0.7, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
                <div className="ml-modal-hero">
                  <span style={{ color: "var(--ml-on-dark-mute)", fontSize: 12 }}>Medyra · {openStory.cat}</span>
                  <button className="ml-modal-close" onClick={() => setOpenStory(null)} aria-label="Close"><X size={18} /></button>
                </div>
                <div className="ml-modal-body">
                  <span className="cat">{openStory.cat}</span>
                  <h2>{openStory.title}</h2>
                  <p className="meta">{openStory.date} · {openStory.author} · {openStory.read}</p>
                  <div className="article">
                    {openStory.body.map((blk, i) => (
                      <div key={i}>
                        {blk.h && <h3>{blk.h}</h3>}
                        {blk.p && <p>{blk.p}</p>}
                        {blk.list && <ul>{blk.list.map((li) => <li key={li}>{li}</li>)}</ul>}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};

export default LandingPage;
