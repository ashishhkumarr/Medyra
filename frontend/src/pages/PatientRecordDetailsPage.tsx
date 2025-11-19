import { useParams } from "react-router-dom";

import { ErrorState } from "../components/ErrorState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { usePatient } from "../hooks/usePatients";

const PatientRecordDetailsPage = () => {
  const { id } = useParams();
  const patientId = Number(id);
  const { data, isLoading, error } = usePatient(patientId);

  if (isLoading) return <LoadingSpinner />;
  if (error || !data) return <ErrorState message="Patient not found." />;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-700">{data.full_name}</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Detail label="Email" value={data.email} />
        <Detail label="Phone" value={data.phone} />
        <Detail label="Medical History" value={data.medical_history} />
        <Detail label="Medications" value={data.medications} />
        <Detail label="Notes" value={data.notes} />
      </div>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-sm text-slate-700">{value || "—"}</p>
  </div>
);

export default PatientRecordDetailsPage;
