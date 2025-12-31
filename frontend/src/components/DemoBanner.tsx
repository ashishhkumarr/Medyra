import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export const DemoBanner = () => (
  <div className="border-b border-warning/40 bg-warning-soft/80 text-warning">
    <div className="mx-auto flex w-full items-center justify-between gap-3 px-6 py-2 text-xs font-semibold sm:px-8 sm:text-sm lg:px-12 2xl:px-16">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>DEMO ONLY — do not enter real patient data.</span>
      </div>
      <Link
        to="/demo-notice"
        className="inline-flex items-center gap-1 text-warning transition hover:text-warning/80"
      >
        Demo notice
        <ArrowUpRight className="h-3 w-3" />
      </Link>
    </div>
  </div>
);
