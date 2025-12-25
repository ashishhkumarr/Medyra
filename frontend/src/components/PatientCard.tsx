import { Mail, Phone } from "lucide-react";

import { Patient } from "../services/patients";

interface Props {
  patient: Patient;
  onSelect?: (patientId: number) => void;
}

export const PatientCard = ({ patient, onSelect }: Props) => {
  return (
    <button
      onClick={() => onSelect?.(patient.id)}
      className="w-full rounded-3xl border border-border/70 bg-surface p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-subtle">Patient</p>
          <h3 className="text-lg font-semibold text-text">{patient.full_name}</h3>
        </div>
        <div className="rounded-full bg-primary-soft/80 px-3 py-1 text-xs font-medium text-primary">
          ID #{patient.id}
        </div>
      </div>
      <div className="mt-3 space-y-2 text-sm text-text-muted">
        {patient.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {patient.email}
          </div>
        )}
        {patient.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {patient.phone}
          </div>
        )}
      </div>
      {patient.medical_history && (
        <p className="mt-3 rounded-2xl bg-surface-subtle px-3 py-2 text-xs text-text-muted">
          {patient.medical_history}
        </p>
      )}
    </button>
  );
};
