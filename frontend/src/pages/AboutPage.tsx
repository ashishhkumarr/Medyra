import { Github } from "lucide-react";

import { WhatsNextPanel } from "../components/dashboard/WhatsNextPanel";
import { Card } from "../components/ui/Card";
import { SectionHeader } from "../components/ui/SectionHeader";
import { usePageTitle } from "../hooks/usePageTitle";

const AboutPage = () => {
  usePageTitle("About Medyra");

  return (
    <div className="w-full space-y-8">
      <Card className="space-y-8 p-6 sm:p-8 lg:p-10 hover:border-primary/30 hover:shadow-[0_28px_60px_rgba(34,211,191,0.16)]">
        <SectionHeader
          title="About Medyra"
          description="A demo-first Electronic Medical Record (EMR) system built to showcase full-stack engineering, UX, and product thinking."
        />

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <section className="space-y-3 text-sm text-text-muted">
              <h3 className="text-base font-semibold text-text">What Medyra Is</h3>
              <p>
                Medyra is a lightweight EMR/EHR demo application built to demonstrate
                real-world clinical workflows. It is not intended for real patient
                data, but it is designed with scalability and compliance in mind.
              </p>
            </section>

            <section className="space-y-3 text-sm text-text-muted">
              <h3 className="text-base font-semibold text-text">Engineering Highlights</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <p>• React + TypeScript frontend</p>
                <p>• D3.js for interactive data visualization</p>
                <p>• FastAPI backend</p>
                <p>• PostgreSQL database</p>
                <p>• Tenant-safe data isolation</p>
                <p>• Feature-flag driven demo controls</p>
                <p>• Dockerized local development</p>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="space-y-3 text-sm text-text-muted">
              <h3 className="text-base font-semibold text-text">Key Features Implemented</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <p>• Multi-tenant user accounts</p>
                <p>• Patient &amp; appointment management</p>
                <p>• Status-based appointment lifecycle</p>
                <p>• Analytics dashboard with D3.js visualizations</p>
                <p>• Dark/light mode with glass UI</p>
                <p>• Demo mode safeguards</p>
                <p>• Audit logging (demo-level)</p>
                <p>• Sample data loading</p>
                <p>• Accessibility &amp; keyboard support</p>
              </div>
            </section>

            <section className="rounded-2xl border border-border/60 bg-surface/70 p-4 text-sm text-text-muted shadow-sm backdrop-blur">
              <h3 className="text-sm font-semibold text-text">What’s Intentionally Missing</h3>
              <p className="mt-2">
                To keep Medyra safe as a public demo, the following are intentionally
                not enabled:
              </p>
              <ul className="mt-3 space-y-1">
                <li>• Real email/SMS reminders</li>
                <li>• HIPAA-compliant storage</li>
                <li>• Production authentication hardening</li>
                <li>• Real-world billing or insurance logic</li>
              </ul>
            </section>
          </div>
        </div>

        <section className="space-y-3 text-sm text-text-muted">
          <h3 className="text-base font-semibold text-text">Future Roadmap</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <p>• HIPAA compliance</p>
            <p>• Role-based access control</p>
            <p>• Encrypted PHI storage</p>
            <p>• Production-grade reminders</p>
            <p>• FHIR integrations</p>
            <p>• PWA + offline support</p>
          </div>
        </section>

        <section className="space-y-3 text-sm text-text-muted">
          <h3 className="text-base font-semibold text-text">Open Source &amp; Code</h3>
          <p>Medyra is open-source and actively developed.</p>
          <a
            href="https://github.com/ashishhkumarr/Medyra.git"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/70 px-4 py-2 text-sm font-semibold text-text shadow-sm backdrop-blur transition hover:border-primary/30 hover:bg-surface/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
        </section>

        <p className="text-xs text-text-subtle">
          This project was built as a portfolio demonstration and is continuously evolving.
        </p>
      </Card>

      <WhatsNextPanel />
    </div>
  );
};

export default AboutPage;
