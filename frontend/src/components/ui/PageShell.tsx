interface PageShellProps {
  children: React.ReactNode;
}

export const PageShell = ({ children }: PageShellProps) => {
  return (
    <div className="app-shell">
      <div
        aria-hidden="true"
        className="ambient-orb left-[-4rem] top-24 h-56 w-56 bg-gradient-to-br from-primary/15 to-surface/0 blur-3xl"
        style={{ animationDuration: "14s" }}
      />
      <div
        aria-hidden="true"
        className="ambient-orb right-[-3rem] top-10 h-48 w-48 bg-gradient-to-br from-secondary/15 to-surface/0 blur-3xl"
        style={{ animationDuration: "16s", animationDelay: "0.8s" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
