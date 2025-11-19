import { Patient } from "../services/patients";

interface Props {
  patient: Patient;
  onSelect?: (patientId: number) => void;
}

export const PatientCard = ({ patient, onSelect }: Props) => {
  return (
    <div
      className="cursor-pointer rounded-lg border bg-white p-4 shadow-sm hover:border-brand"
      onClick={() => onSelect?.(patient.id)}
    >
      <h3 className="text-lg font-semibold">{patient.full_name}</h3>
      <p className="text-sm text-slate-500">{patient.email}</p>
      <p className="text-sm text-slate-500">{patient.phone}</p>
      {patient.medical_history && (
        <p className="mt-2 text-xs text-slate-400">
          History: {patient.medical_history}
        </p>
      )}
    </div>
  );
};
