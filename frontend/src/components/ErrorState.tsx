import { AlertTriangle } from "lucide-react";

interface Props {
  message?: string;
}

export const ErrorState = ({ message }: Props) => (
  <div className="flex items-center gap-3 rounded-2xl border border-danger/40 bg-danger-soft/60 px-4 py-3 text-sm text-danger shadow-sm animate-toastIn">
    <AlertTriangle className="h-4 w-4" />
    {message || "Something went wrong. Please try again."}
  </div>
);
