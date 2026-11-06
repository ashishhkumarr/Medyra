import { useMemo } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { usePatientEncounters } from "../../hooks/useEncounters";
import type { Encounter } from "../../services/encounters";
import { Card } from "../ui/Card";
import { SectionHeader } from "../ui/SectionHeader";

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

const bmiOf = (e: Encounter): number | null => {
  if (!e.height_cm || !e.weight_kg) return null;
  const m = e.height_cm / 100;
  if (m <= 0) return null;
  return Math.round((e.weight_kg / (m * m)) * 10) / 10;
};

const hasAnyVital = (e: Encounter) =>
  [
    e.bp_systolic,
    e.bp_diastolic,
    e.heart_rate,
    e.temperature_c,
    e.respiratory_rate,
    e.spo2,
    e.height_cm,
    e.weight_kg
  ].some((v) => num(v) !== null);

const series = (encs: Encounter[], pick: (e: Encounter) => number | null | undefined) =>
  encs.map((e) => num(pick(e))).filter((v): v is number => v !== null);

const last = <T,>(arr: T[]): T | undefined => arr[arr.length - 1];

const Sparkline = ({ values }: { values: number[] }) => {
  const w = 100;
  const h = 28;
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const x = (i: number) => pad + (i / (values.length - 1)) * (w - 2 * pad);
  const y = (v: number) => h - pad - ((v - min) / range) * (h - 2 * pad);
  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="mt-2 h-6 w-full overflow-visible"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="rgb(var(--color-primary))"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={x(values.length - 1)} cy={y(last(values) as number)} r="2.4" fill="rgb(var(--color-primary))" />
    </svg>
  );
};

const MetricTile = ({
  label,
  unit,
  values,
  display
}: {
  label: string;
  unit?: string;
  values: number[];
  display: string;
}) => {
  if (!values.length) return null;
  const latest = last(values) as number;
  const prev = values.length >= 2 ? values[values.length - 2] : null;
  const delta = prev !== null ? Math.round((latest - prev) * 10) / 10 : null;
  return (
    <div className="rounded-xl border border-border/60 bg-surface/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-text-subtle">{label}</span>
        {delta !== null && Math.abs(delta) > 0.01 && (
          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-text-muted">
            {delta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(delta)}
          </span>
        )}
      </div>
      <p className="mt-1 font-display text-2xl leading-none text-text">
        {display}
        {unit ? <span className="ml-1 font-sans text-xs text-text-subtle">{unit}</span> : null}
      </p>
      {values.length >= 2 && <Sparkline values={values} />}
    </div>
  );
};

export const VitalsCard = ({ patientId }: { patientId: number }) => {
  const { data: encounters } = usePatientEncounters(patientId);

  const vitalsEncs = useMemo(
    () =>
      (encounters ?? [])
        .filter(hasAnyVital)
        .slice()
        .sort(
          (a, b) =>
            new Date(a.encounter_date ?? a.created_at).getTime() -
            new Date(b.encounter_date ?? b.created_at).getTime()
        ),
    [encounters]
  );

  if (!vitalsEncs.length) return null;

  const sys = series(vitalsEncs, (e) => e.bp_systolic);
  const dia = series(vitalsEncs, (e) => e.bp_diastolic);
  const hr = series(vitalsEncs, (e) => e.heart_rate);
  const temp = series(vitalsEncs, (e) => e.temperature_c);
  const spo2 = series(vitalsEncs, (e) => e.spo2);
  const weight = series(vitalsEncs, (e) => e.weight_kg);
  const bmi = series(vitalsEncs, bmiOf);

  const bpDisplay =
    sys.length && dia.length ? `${last(sys)}/${last(dia)}` : sys.length ? `${last(sys)}` : "—";

  return (
    <Card className="space-y-4">
      <SectionHeader
        title="Vitals"
        description={
          vitalsEncs.length >= 2
            ? `Latest readings and trend across ${vitalsEncs.length} visits.`
            : "Latest readings from the most recent visit."
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricTile label="Blood pressure" unit="mmHg" values={sys} display={bpDisplay} />
        <MetricTile label="Heart rate" unit="bpm" values={hr} display={`${last(hr) ?? ""}`} />
        <MetricTile label="Temperature" unit="°C" values={temp} display={`${last(temp) ?? ""}`} />
        <MetricTile label="SpO₂" unit="%" values={spo2} display={`${last(spo2) ?? ""}`} />
        <MetricTile label="Weight" unit="kg" values={weight} display={`${last(weight) ?? ""}`} />
        <MetricTile label="BMI" values={bmi} display={`${last(bmi) ?? ""}`} />
      </div>
    </Card>
  );
};
