import { ShieldCheck, Stethoscope, Sparkles } from "lucide-react";

type RoadmapItem = {
  label: string;
  badge: "Planned" | "Research" | "Enterprise";
};

const badgeStyles: Record<RoadmapItem["badge"], string> = {
  Planned: "text-primary",
  Research: "text-secondary",
  Enterprise: "text-text-muted"
};

const sections: Array<{
  title: string;
  icon: typeof ShieldCheck;
  items: RoadmapItem[];
}> = [
  {
    title: "Compliance & Security",
    icon: ShieldCheck,
    items: [
      { label: "HIPAA-compliant data handling", badge: "Planned" },
      { label: "Encrypted PHI at rest and in transit", badge: "Planned" },
      { label: "Role-based access control (RBAC)", badge: "Research" },
      { label: "Audit log retention & export", badge: "Planned" },
      { label: "Session timeout & device tracking", badge: "Enterprise" }
    ]
  },
  {
    title: "Clinical & Workflow",
    icon: Stethoscope,
    items: [
      { label: "E-prescriptions", badge: "Research" },
      { label: "Lab result uploads & review", badge: "Planned" },
      { label: "SOAP notes & encounter history", badge: "Planned" },
      { label: "ICD-10 / CPT coding", badge: "Enterprise" },
      { label: "Insurance & billing workflows", badge: "Enterprise" }
    ]
  },
  {
    title: "Intelligence & Automation",
    icon: Sparkles,
    items: [
      { label: "Smart appointment insights", badge: "Research" },
      { label: "Clinical summaries (AI-assisted)", badge: "Research" },
      { label: "Missed appointment predictions", badge: "Planned" },
      { label: "Patient risk flagging", badge: "Research" },
      { label: "Natural language charting", badge: "Enterprise" }
    ]
  }
];

export const WhatsNextPanel = () => {
  return (
    <div className="glass-card animate-fadeUp p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_28px_60px_rgba(34,211,191,0.16)]">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-text">What’s next for Medyra</h3>
        <p className="text-sm text-text-muted">
          Planned improvements to evolve Medyra into a production-ready EMR.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="rounded-2xl border border-border/60 bg-surface/60 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface/70 hover:shadow-[0_18px_40px_rgba(34,211,191,0.16)]"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-text">
                <Icon className="h-4 w-4 text-primary" />
                {section.title}
              </div>
              <ul className="mt-3 space-y-2 text-sm text-text-muted">
                {section.items.map((item) => (
                  <li key={item.label} className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 inline-flex rounded-full border border-border/60 bg-surface/70 px-2 py-0.5 text-[10px] font-semibold ${badgeStyles[item.badge]}`}
                    >
                      {item.badge}
                    </span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-text-subtle">
        Medyra is currently in demo mode. Roadmap items are not yet available.
      </p>
    </div>
  );
};
