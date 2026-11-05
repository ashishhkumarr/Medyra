import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  FilePlus2,
  HeartPulse,
  Lock,
  Stethoscope,
  Trash2
} from "lucide-react";

import {
  useCreateEncounter,
  useDeleteEncounter,
  usePatientEncounters,
  useSignEncounter
} from "../../hooks/useEncounters";
import { toast } from "../../lib/toast";
import type {
  Encounter,
  EncounterCreatePayload,
  EncounterType
} from "../../services/encounters";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ErrorState } from "../ErrorState";
import { InputField, TextAreaField } from "../ui/FormField";
import { SectionHeader } from "../ui/SectionHeader";

const ENCOUNTER_TYPES: EncounterType[] = [
  "Office visit",
  "Telehealth",
  "Follow-up",
  "New patient",
  "Procedure"
];

type FormState = {
  encounter_type: EncounterType;
  provider: string;
  chief_complaint: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnosis: string;
  bp_systolic: string;
  bp_diastolic: string;
  heart_rate: string;
  temperature_c: string;
  respiratory_rate: string;
  spo2: string;
  height_cm: string;
  weight_kg: string;
};

const emptyForm = (provider: string): FormState => ({
  encounter_type: "Office visit",
  provider,
  chief_complaint: "",
  subjective: "",
  objective: "",
  assessment: "",
  plan: "",
  diagnosis: "",
  bp_systolic: "",
  bp_diastolic: "",
  heart_rate: "",
  temperature_c: "",
  respiratory_rate: "",
  spo2: "",
  height_cm: "",
  weight_kg: ""
});

const numOrUndef = (value: string): number | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
};

const strOrUndef = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

const bmiFrom = (heightCm?: number | null, weightKg?: number | null) => {
  if (!heightCm || !weightKg) return null;
  const m = heightCm / 100;
  if (m <= 0) return null;
  return Math.round((weightKg / (m * m)) * 10) / 10;
};

const Vitals = ({ e }: { e: Encounter }) => {
  const bmi = bmiFrom(e.height_cm, e.weight_kg);
  const items: string[] = [];
  if (e.bp_systolic && e.bp_diastolic) items.push(`BP ${e.bp_systolic}/${e.bp_diastolic}`);
  if (e.heart_rate) items.push(`HR ${e.heart_rate}`);
  if (e.temperature_c) items.push(`Temp ${e.temperature_c}°C`);
  if (e.respiratory_rate) items.push(`RR ${e.respiratory_rate}`);
  if (e.spo2) items.push(`SpO₂ ${e.spo2}%`);
  if (e.height_cm) items.push(`${e.height_cm} cm`);
  if (e.weight_kg) items.push(`${e.weight_kg} kg`);
  if (bmi) items.push(`BMI ${bmi}`);
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((v) => (
        <span
          key={v}
          className="rounded-lg bg-surface-subtle px-2.5 py-1 text-xs font-medium text-text-muted"
        >
          {v}
        </span>
      ))}
    </div>
  );
};

const SoapBlock = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value || !value.trim()) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-text-muted">{value}</p>
    </div>
  );
};

interface Props {
  patientId: number;
  defaultProvider?: string;
}

export const EncounterSection = ({ patientId, defaultProvider = "" }: Props) => {
  const { data: encounters, isLoading, error } = usePatientEncounters(patientId);
  const createEncounter = useCreateEncounter(patientId);
  const signEncounter = useSignEncounter(patientId);
  const deleteEncounter = useDeleteEncounter(patientId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(defaultProvider));
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const openModal = () => {
    setForm(emptyForm(defaultProvider));
    setApiError(null);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const setField = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setApiError(null);
    const payload: EncounterCreatePayload = {
      patient_id: patientId,
      encounter_type: form.encounter_type,
      provider: strOrUndef(form.provider),
      chief_complaint: strOrUndef(form.chief_complaint),
      subjective: strOrUndef(form.subjective),
      objective: strOrUndef(form.objective),
      assessment: strOrUndef(form.assessment),
      plan: strOrUndef(form.plan),
      diagnosis: strOrUndef(form.diagnosis),
      bp_systolic: numOrUndef(form.bp_systolic),
      bp_diastolic: numOrUndef(form.bp_diastolic),
      heart_rate: numOrUndef(form.heart_rate),
      temperature_c: numOrUndef(form.temperature_c),
      respiratory_rate: numOrUndef(form.respiratory_rate),
      spo2: numOrUndef(form.spo2),
      height_cm: numOrUndef(form.height_cm),
      weight_kg: numOrUndef(form.weight_kg)
    };
    try {
      const created = await createEncounter.mutateAsync(payload);
      toast.success("Visit note saved as draft");
      setExpandedId(created.id);
      closeModal();
    } catch {
      setApiError("We couldn't save this visit note. Please try again.");
      toast.error("Unable to save visit note");
    }
  };

  const handleSign = async (encounter: Encounter) => {
    try {
      await signEncounter.mutateAsync(encounter.id);
      toast.success("Note signed");
    } catch {
      toast.error("Unable to sign note");
    }
  };

  const handleDelete = async (encounter: Encounter) => {
    try {
      await deleteEncounter.mutateAsync(encounter.id);
      toast.success("Draft deleted");
    } catch {
      toast.error("Unable to delete draft");
    }
  };

  return (
    <Card className="space-y-4">
      <SectionHeader
        title="Clinical notes"
        description="Documented visits — SOAP notes and vitals."
        action={
          <Button onClick={openModal} className="gap-2">
            <FilePlus2 className="h-4 w-4" /> New visit note
          </Button>
        }
      />

      {isLoading && (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-surface-subtle" />
          ))}
        </div>
      )}
      {error && <ErrorState message="We couldn't load clinical notes for this patient." />}

      {!isLoading && !error && !encounters?.length && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-surface/70 px-4 py-8 text-center">
          <Stethoscope className="h-7 w-7 text-primary" />
          <p className="text-sm text-text-muted">
            No clinical notes yet. Document the first visit to start this patient's chart.
          </p>
          <Button variant="secondary" onClick={openModal} className="gap-2">
            <FilePlus2 className="h-4 w-4" /> New visit note
          </Button>
        </div>
      )}

      {!isLoading &&
        !error &&
        !!encounters?.length &&
        encounters.map((e) => {
          const expanded = expandedId === e.id;
          const isDraft = e.status === "Draft";
          return (
            <div
              key={e.id}
              className="rounded-2xl border border-border/60 bg-surface/70 shadow-sm"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : e.id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <HeartPulse className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text">
                      {e.encounter_type}
                      {e.chief_complaint ? ` · ${e.chief_complaint}` : ""}
                    </p>
                    <p className="text-xs text-text-subtle">
                      {formatDate(e.encounter_date)}
                      {e.provider ? ` · ${e.provider}` : ""}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isDraft
                      ? "bg-warning-soft/80 text-warning"
                      : "bg-success-soft/80 text-success"
                  }`}
                >
                  {isDraft ? "Draft" : "Signed"}
                </span>
              </button>

              {expanded && (
                <div className="space-y-4 border-t border-border/50 px-4 py-4">
                  <Vitals e={e} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SoapBlock label="Subjective" value={e.subjective} />
                    <SoapBlock label="Objective" value={e.objective} />
                    <SoapBlock label="Assessment" value={e.assessment} />
                    <SoapBlock label="Plan" value={e.plan} />
                  </div>
                  {e.diagnosis && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                        Diagnosis
                      </p>
                      <p className="mt-1 text-sm text-text-muted">{e.diagnosis}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {isDraft ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-danger"
                          onClick={() => handleDelete(e)}
                          disabled={deleteEncounter.isPending}
                        >
                          <Trash2 className="h-4 w-4" /> Delete draft
                        </Button>
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => handleSign(e)}
                          isLoading={signEncounter.isPending}
                          disabled={signEncounter.isPending}
                        >
                          <Lock className="h-4 w-4" /> Sign note
                        </Button>
                      </>
                    ) : (
                      <span className="flex items-center gap-2 text-xs text-text-subtle">
                        <Lock className="h-3.5 w-3.5" /> Signed {formatDate(e.signed_at)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 animate-fadeIn">
            <div className="absolute inset-0" onClick={closeModal} />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="New visit note"
              className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-border/60 bg-surface shadow-card animate-modalIn"
            >
              <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-border/60 bg-surface/95 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-2xl text-text">New visit note</h3>
                </div>
                <Button variant="ghost" size="sm" type="button" onClick={closeModal}>
                  Close
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm font-medium text-text">
                      Visit type
                      <select
                        value={form.encounter_type}
                        onChange={(ev) => setField("encounter_type", ev.target.value)}
                        className="glass-input text-sm"
                      >
                        {ENCOUNTER_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                    <InputField
                      label="Provider"
                      value={form.provider}
                      onChange={(ev) => setField("provider", ev.target.value)}
                      placeholder="Dr. ..."
                    />
                  </div>

                  <InputField
                    label="Chief complaint"
                    value={form.chief_complaint}
                    onChange={(ev) => setField("chief_complaint", ev.target.value)}
                    placeholder="e.g. Cough and fever for 3 days"
                  />

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-subtle">
                      Vitals
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <InputField label="BP sys" type="number" value={form.bp_systolic} onChange={(ev) => setField("bp_systolic", ev.target.value)} />
                      <InputField label="BP dia" type="number" value={form.bp_diastolic} onChange={(ev) => setField("bp_diastolic", ev.target.value)} />
                      <InputField label="HR (bpm)" type="number" value={form.heart_rate} onChange={(ev) => setField("heart_rate", ev.target.value)} />
                      <InputField label="Temp (°C)" type="number" value={form.temperature_c} onChange={(ev) => setField("temperature_c", ev.target.value)} />
                      <InputField label="Resp rate" type="number" value={form.respiratory_rate} onChange={(ev) => setField("respiratory_rate", ev.target.value)} />
                      <InputField label="SpO₂ (%)" type="number" value={form.spo2} onChange={(ev) => setField("spo2", ev.target.value)} />
                      <InputField label="Height (cm)" type="number" value={form.height_cm} onChange={(ev) => setField("height_cm", ev.target.value)} />
                      <InputField label="Weight (kg)" type="number" value={form.weight_kg} onChange={(ev) => setField("weight_kg", ev.target.value)} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextAreaField label="Subjective" value={form.subjective} onChange={(ev) => setField("subjective", ev.target.value)} placeholder="Patient-reported symptoms and history" />
                    <TextAreaField label="Objective" value={form.objective} onChange={(ev) => setField("objective", ev.target.value)} placeholder="Exam findings, observations" />
                    <TextAreaField label="Assessment" value={form.assessment} onChange={(ev) => setField("assessment", ev.target.value)} placeholder="Clinical impression" />
                    <TextAreaField label="Plan" value={form.plan} onChange={(ev) => setField("plan", ev.target.value)} placeholder="Treatment, meds, follow-up" />
                  </div>

                  <InputField
                    label="Diagnosis"
                    value={form.diagnosis}
                    onChange={(ev) => setField("diagnosis", ev.target.value)}
                    placeholder="e.g. Acute viral upper respiratory infection"
                  />

                  {apiError && <ErrorState message={apiError} />}
                </div>
                <div className="sticky bottom-0 flex justify-end gap-3 border-t border-border/60 bg-surface/95 px-6 py-4">
                  <Button variant="secondary" type="button" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={createEncounter.isPending} disabled={createEncounter.isPending}>
                    Save draft
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </Card>
  );
};
