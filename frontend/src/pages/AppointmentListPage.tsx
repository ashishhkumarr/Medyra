import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";

import { ErrorState } from "../components/ErrorState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DateTimePicker } from "../components/ui/DateTimePicker";
import { InputField, TextAreaField } from "../components/ui/FormField";
import { SectionHeader } from "../components/ui/SectionHeader";
import {
  useAppointments,
  useCancelAppointment,
  useCompleteAppointment,
  useUpdateAppointment
} from "../hooks/useAppointments";
import { usePatients } from "../hooks/usePatients";
import { usePageTitle } from "../hooks/usePageTitle";
import { Appointment, AppointmentStatus, simulateAppointmentReminder } from "../services/appointments";
import { toast } from "../lib/toast";

type AppointmentFormState = {
  appointment_datetime: string;
  appointment_end_datetime: string;
  doctor_name: string;
  department: string;
  notes: string;
  reminder_email_enabled: boolean;
  reminder_sms_enabled: boolean;
  reminder_email_minutes_before: number;
  reminder_sms_minutes_before: number;
};

const statusStyles: Record<string, string> = {
  Confirmed: "bg-secondary-soft/80 text-secondary",
  Unconfirmed: "bg-warning-soft/80 text-warning",
  Scheduled: "bg-warning-soft/80 text-warning",
  Completed: "bg-success-soft/80 text-success",
  Cancelled: "bg-danger-soft/80 text-danger"
};

type StatusTab = "all" | "completed" | "confirmed" | "unconfirmed" | "cancelled";
type DateRangeFilter = "any" | "today" | "next7" | "next30" | "custom";
type SortOption = "date_asc" | "date_desc" | "patient_asc";

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "unconfirmed", label: "Unconfirmed" },
  { key: "cancelled", label: "Cancelled" }
];

const REMINDER_EMAIL_OPTIONS = [1440, 720, 240, 120, 60, 30];
const REMINDER_SMS_OPTIONS = [240, 120, 60, 30, 15];

const toInputValue = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (amount: number) => amount.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

const formatDateTimeCell = (appointment: Appointment) => {
  const start = new Date(appointment.appointment_datetime);
  if (Number.isNaN(start.getTime())) {
    return { dateLabel: "—", timeRange: "—" };
  }
  const end = appointment.appointment_end_datetime
    ? new Date(appointment.appointment_end_datetime)
    : null;
  const dateLabel = start.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  const startTime = start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const endTime =
    end && !Number.isNaN(end.getTime())
      ? end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      : "TBD";
  return { dateLabel, timeRange: `${startTime} - ${endTime}` };
};

const getApiErrorMessage = (error: any) => {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    const first = detail[0];
    if (typeof first === "string") {
      return detail.join(" ");
    }
    if (first?.msg) {
      return first.msg;
    }
  }
  if (typeof detail === "string") {
    return detail;
  }
  return "We couldn't update this appointment. Please try again.";
};

const AppointmentListPage = () => {
  usePageTitle("Appointments");
  const { data, isLoading, error } = useAppointments();
  const { data: patients } = usePatients();
  const updateAppointment = useUpdateAppointment();
  const cancelAppointment = useCancelAppointment();
  const completeAppointment = useCompleteAppointment();
  const navigate = useNavigate();
  const location = useLocation();

  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeFilter>("any");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("date_asc");
  const filterRef = useRef<HTMLDivElement | null>(null);
  const filterPanelRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const modalLastFocusRef = useRef<HTMLElement | null>(null);
  const filterControlClass =
    "glass-input mt-2 w-full text-sm hover:border-primary/30 hover:bg-surface/90 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/40";
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<Appointment | null>(null);
  const [isSimulatingReminder, setIsSimulatingReminder] = useState(false);
  const [formState, setFormState] = useState<AppointmentFormState>({
    appointment_datetime: "",
    appointment_end_datetime: "",
    doctor_name: "",
    department: "",
    notes: "",
    reminder_email_enabled: false,
    reminder_sms_enabled: false,
    reminder_email_minutes_before: 1440,
    reminder_sms_minutes_before: 120
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AppointmentFormState, string>>>(
    {}
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [undoState, setUndoState] = useState<{
    appointmentId: number;
    previousStatus: AppointmentStatus;
  } | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  const isModalOpen = isViewOpen || isEditOpen || isCancelOpen || isCompleteOpen;

  useEffect(() => {
    if (!filterOpen) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const element = event.target as HTMLElement | null;
      if (filterPanelRef.current?.contains(target)) return;
      if (filterRef.current?.contains(target)) return;
      if (element?.closest?.(".mt-date-picker-popper")) return;
      setFilterOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [filterOpen]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 3500);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!undoState) return;
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current);
    }
    undoTimerRef.current = window.setTimeout(() => {
      setUndoState(null);
      undoTimerRef.current = null;
    }, 30000);
    return () => {
      if (undoTimerRef.current) {
        window.clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
    };
  }, [undoState]);

  useEffect(() => {
    const locationState = location.state as { successMessage?: string } | null;
    if (locationState?.successMessage) {
      setSuccessMessage(locationState.successMessage);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!isModalOpen) return;
    document.body.classList.add("overflow-hidden");
    modalLastFocusRef.current = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => modalRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsViewOpen(false);
        setIsEditOpen(false);
        setIsCancelOpen(false);
        setIsCompleteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", handleKeyDown);
      modalLastFocusRef.current?.focus();
    };
  }, [isModalOpen]);

  const patientById = useMemo(() => {
    const map = new Map<number, { phone?: string; email?: string; full_name?: string }>();
    (patients ?? []).forEach((patient) => {
      map.set(patient.id, {
        phone: patient.phone ?? undefined,
        email: patient.email ?? undefined,
        full_name: patient.full_name ?? undefined
      });
    });
    return map;
  }, [patients]);

  const normalizeStatus = (status: AppointmentStatus) => {
    if (status === "Scheduled") return "Unconfirmed";
    return status;
  };

  const getDerivedStatus = (appointment: Appointment) => normalizeStatus(appointment.status);

  const getReminderState = (
    appointment: Appointment,
    startOverride?: string
  ): { enabled: boolean; message: string } => {
    const derivedStatus = getDerivedStatus(appointment);
    const startTime = startOverride ?? appointment.appointment_datetime;
    const parsedStart = startTime ? new Date(startTime).getTime() : NaN;
    const isPast = !Number.isNaN(parsedStart) && parsedStart < Date.now();

    if (derivedStatus === "Cancelled") {
      return {
        enabled: false,
        message: "Cancelled appointments do not send reminders."
      };
    }

    if (derivedStatus === "Completed" || isPast) {
      return {
        enabled: false,
        message: "Reminders aren’t available for completed or past visits."
      };
    }

    if (derivedStatus === "Unconfirmed") {
      return {
        enabled: false,
        message: "Confirm the appointment to enable reminders."
      };
    }

    return { enabled: true, message: "" };
  };

  const statusCounts = useMemo(() => {
    const counts = {
      all: 0,
      completed: 0,
      confirmed: 0,
      unconfirmed: 0,
      cancelled: 0
    };
    (data ?? []).forEach((appointment) => {
      const derived = getDerivedStatus(appointment);
      counts.all += 1;
      if (derived === "Cancelled") {
        counts.cancelled += 1;
      }
      if (derived === "Completed") counts.completed += 1;
      if (derived === "Confirmed") counts.confirmed += 1;
      if (derived === "Unconfirmed") counts.unconfirmed += 1;
    });
    return counts;
  }, [data]);

  const departments = useMemo(() => {
    const values = new Set<string>();
    (data ?? []).forEach((appointment) => {
      if (appointment.department) values.add(appointment.department);
    });
    return Array.from(values).sort();
  }, [data]);

  const doctors = useMemo(() => {
    const values = new Set<string>();
    (data ?? []).forEach((appointment) => {
      if (appointment.doctor_name) values.add(appointment.doctor_name);
    });
    return Array.from(values).sort();
  }, [data]);

  const filteredAppointments = useMemo(() => {
    const appointments = data ?? [];
    const term = searchTerm.trim().toLowerCase();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const next7 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    const next30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);

    const filtered = appointments.filter((appointment) => {
      const derivedStatus = getDerivedStatus(appointment);
      if (statusTab !== "all" && derivedStatus.toLowerCase() !== statusTab) return false;

      const patientInfo = appointment.patient ?? patientById.get(appointment.patient_id);
      const patientName = patientInfo?.full_name?.toLowerCase() ?? "";
      const email = patientInfo?.email?.toLowerCase() ?? "";
      const phone = patientInfo?.phone?.toLowerCase() ?? "";
      const doctor = appointment.doctor_name?.toLowerCase() ?? "";
      const department = appointment.department?.toLowerCase() ?? "";

      if (term) {
        const matches =
          patientName.includes(term) ||
          doctor.includes(term) ||
          department.includes(term) ||
          email.includes(term) ||
          phone.includes(term);
        if (!matches) return false;
      }

      if (departmentFilter !== "all" && appointment.department !== departmentFilter) {
        return false;
      }
      if (doctorFilter !== "all" && appointment.doctor_name !== doctorFilter) {
        return false;
      }

      const appointmentDate = new Date(appointment.appointment_datetime);
      if (Number.isNaN(appointmentDate.getTime())) return false;

      if (dateRange === "today") {
        if (appointmentDate < startOfToday || appointmentDate >= endOfToday) return false;
      }
      if (dateRange === "next7") {
        if (appointmentDate < startOfToday || appointmentDate > next7) return false;
      }
      if (dateRange === "next30") {
        if (appointmentDate < startOfToday || appointmentDate > next30) return false;
      }
      if (dateRange === "custom") {
        if (customStart) {
          const start = new Date(customStart);
          if (!Number.isNaN(start.getTime()) && appointmentDate < start) return false;
        }
        if (customEnd) {
          const end = new Date(customEnd);
          if (!Number.isNaN(end.getTime())) {
            const endOfDay = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);
            if (appointmentDate >= endOfDay) return false;
          }
        }
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (sortOption === "date_desc") {
        return (
          new Date(b.appointment_datetime).getTime() -
          new Date(a.appointment_datetime).getTime()
        );
      }
      if (sortOption === "patient_asc") {
        const nameA = (a.patient?.full_name ?? patientById.get(a.patient_id)?.full_name ?? "").toLowerCase();
        const nameB = (b.patient?.full_name ?? patientById.get(b.patient_id)?.full_name ?? "").toLowerCase();
        return nameA.localeCompare(nameB);
      }
      return (
        new Date(a.appointment_datetime).getTime() -
        new Date(b.appointment_datetime).getTime()
      );
    });
  }, [
    data,
    statusTab,
    searchTerm,
    dateRange,
    customStart,
    customEnd,
    departmentFilter,
    doctorFilter,
    sortOption,
    patientById
  ]);

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFormErrors({});
    setActionError(null);
    setFormState({
      appointment_datetime: toInputValue(appointment.appointment_datetime),
      appointment_end_datetime: toInputValue(appointment.appointment_end_datetime),
      doctor_name: appointment.doctor_name,
      department: appointment.department ?? "",
      notes: appointment.notes ?? "",
      reminder_email_enabled: appointment.reminder_email_enabled ?? false,
      reminder_sms_enabled: appointment.reminder_sms_enabled ?? false,
      reminder_email_minutes_before: appointment.reminder_email_minutes_before ?? 1440,
      reminder_sms_minutes_before: appointment.reminder_sms_minutes_before ?? 120
    });
    setIsEditOpen(true);
  };

  const handleCancelPrompt = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setActionError(null);
    setIsCancelOpen(true);
  };

  const closeModals = () => {
    setIsViewOpen(false);
    setIsEditOpen(false);
    setIsCancelOpen(false);
    setIsCompleteOpen(false);
    setSelectedAppointment(null);
    setCompleteTarget(null);
    setActionError(null);
    setIsSimulatingReminder(false);
  };

  const handleFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateTimeChange = (
    name: "appointment_datetime" | "appointment_end_datetime"
  ) => {
    return (value: string) => {
      setFormState((prev) => ({ ...prev, [name]: value }));
    };
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof AppointmentFormState, string>> = {};
    if (!formState.appointment_datetime) {
      nextErrors.appointment_datetime = "Required";
    }
    if (formState.appointment_end_datetime) {
      const startTime = new Date(formState.appointment_datetime).getTime();
      const endTime = new Date(formState.appointment_end_datetime).getTime();
      if (!Number.isNaN(startTime) && !Number.isNaN(endTime) && endTime <= startTime) {
        nextErrors.appointment_end_datetime = "End time must be after start time";
      }
    }
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionError(null);
    if (!selectedAppointment) return;
    if (!validateForm()) return;
    try {
      await updateAppointment.mutateAsync({
        appointmentId: selectedAppointment.id,
        payload: {
          appointment_datetime: formState.appointment_datetime,
          appointment_end_datetime: formState.appointment_end_datetime || null,
          doctor_name: formState.doctor_name.trim(),
          department: formState.department.trim() || undefined,
          notes: formState.notes.trim() || undefined,
          reminder_email_enabled: formState.reminder_email_enabled,
          reminder_sms_enabled: formState.reminder_sms_enabled,
          reminder_email_minutes_before: formState.reminder_email_minutes_before,
          reminder_sms_minutes_before: formState.reminder_sms_minutes_before
        }
      });
      setSuccessMessage("Appointment updated successfully.");
      closeModals();
    } catch (submitError: any) {
      setActionError(getApiErrorMessage(submitError));
    }
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;
    setActionError(null);
    try {
      await cancelAppointment.mutateAsync(selectedAppointment.id);
      setSuccessMessage("Appointment cancelled.");
      closeModals();
    } catch (cancelError: any) {
      setActionError(getApiErrorMessage(cancelError));
    }
  };

  const handleConfirm = async (appointment: Appointment) => {
    setActionError(null);
    try {
      await updateAppointment.mutateAsync({
        appointmentId: appointment.id,
        payload: { status: "Confirmed" }
      });
      toast.success("Appointment confirmed");
    } catch (confirmError: any) {
      const message = getApiErrorMessage(confirmError);
      toast.error(message || "Unable to confirm appointment");
      setActionError(message);
    }
  };

  const handleCompletePrompt = (appointment: Appointment) => {
    setCompleteTarget(appointment);
    setActionError(null);
    setIsCompleteOpen(true);
  };

  const handleCompleteConfirm = async () => {
    if (!completeTarget) return;
    setActionError(null);
    try {
      const previousStatus = completeTarget.status;
      await completeAppointment.mutateAsync(completeTarget.id);
      setUndoState({ appointmentId: completeTarget.id, previousStatus });
      closeModals();
    } catch (completeError: any) {
      setActionError(getApiErrorMessage(completeError));
    }
  };

  const handleUndoComplete = async () => {
    if (!undoState) return;
    setActionError(null);
    try {
      await updateAppointment.mutateAsync({
        appointmentId: undoState.appointmentId,
        payload: { status: undoState.previousStatus }
      });
      setSuccessMessage("Completion undone.");
      setUndoState(null);
    } catch (undoError: any) {
      setActionError(getApiErrorMessage(undoError));
    }
  };

  const handleSimulateReminder = async () => {
    if (!selectedAppointment) return;
    setActionError(null);
    setIsSimulatingReminder(true);
    try {
      await simulateAppointmentReminder(selectedAppointment.id);
      toast.success("Demo reminder simulated");
    } catch (simulateError: any) {
      const message = getApiErrorMessage(simulateError);
      toast.error(message || "Unable to simulate reminder");
      setActionError(message);
    } finally {
      setIsSimulatingReminder(false);
    }
  };

  const editReminderState = selectedAppointment
    ? getReminderState(selectedAppointment, formState.appointment_datetime)
    : { enabled: false, message: "Confirm the appointment to enable reminders." };
  const viewReminderState = selectedAppointment
    ? getReminderState(selectedAppointment)
    : { enabled: false, message: "Confirm the appointment to enable reminders." };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message="Unable to fetch appointments." />;

  return (
    <Card className="animate-fadeUp space-y-5 p-4 sm:p-6">
      <SectionHeader
        title="Appointments"
        description="Review scheduled visits and recent activity."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => navigate("/appointments/create")} className="shadow-card">
              Create appointment
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-surface/70 p-4 shadow-sm backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const isActive = statusTab === tab.key;
            const count = statusCounts[tab.key];
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusTab(tab.key)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-surface text-text shadow-sm"
                    : "text-text-muted hover:bg-surface/70 hover:text-text"
                }`}
              >
                {tab.label} <span className="text-text-subtle">({count})</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search..."
              className="glass-input w-full pl-9 text-sm"
            />
          </div>
          <div className="relative" ref={filterRef}>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              type="button"
              onClick={() => setFilterOpen((prev) => !prev)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </Button>
            {filterOpen &&
              createPortal(
                <div className="fixed inset-0 z-[90]">
                  <div className="absolute inset-0" onMouseDown={() => setFilterOpen(false)} />
                  <div
                    ref={filterPanelRef}
                    className="absolute left-4 right-4 top-24 rounded-3xl border border-border/70 bg-surface/85 p-4 text-sm text-text-muted shadow-card backdrop-blur sm:left-auto sm:right-6 sm:top-28 sm:w-[320px]"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                          Date range
                        </label>
                        <select
                          value={dateRange}
                          onChange={(event) => setDateRange(event.target.value as DateRangeFilter)}
                          className={filterControlClass}
                        >
                          <option value="any">Any time</option>
                          <option value="today">Today</option>
                          <option value="next7">Next 7 days</option>
                          <option value="next30">Next 30 days</option>
                          <option value="custom">Custom range</option>
                        </select>
                        {dateRange === "custom" && (
                          <div className="mt-3">
                            <DateTimePicker
                              label="Custom range"
                              mode="daterange"
                              value={{ start: customStart, end: customEnd }}
                              onChange={(range) => {
                                setCustomStart(range.start ?? "");
                                setCustomEnd(range.end ?? "");
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                          Department
                        </label>
                        <select
                          value={departmentFilter}
                          onChange={(event) => setDepartmentFilter(event.target.value)}
                          className={filterControlClass}
                        >
                          <option value="all">All departments</option>
                          {departments.map((department) => (
                            <option key={department} value={department}>
                              {department}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                          Doctor
                        </label>
                        <select
                          value={doctorFilter}
                          onChange={(event) => setDoctorFilter(event.target.value)}
                          className={filterControlClass}
                        >
                          <option value="all">All doctors</option>
                          {doctors.map((doctor) => (
                            <option key={doctor} value={doctor}>
                              {doctor}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                          Sort
                        </label>
                        <select
                          value={sortOption}
                          onChange={(event) => setSortOption(event.target.value as SortOption)}
                          className={filterControlClass}
                        >
                          <option value="date_asc">Date (soonest)</option>
                          <option value="date_desc">Date (latest)</option>
                          <option value="patient_asc">Patient (A–Z)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setDateRange("any");
                            setCustomStart("");
                            setCustomEnd("");
                            setDepartmentFilter("all");
                            setDoctorFilter("all");
                            setSortOption("date_asc");
                            setSearchTerm("");
                          }}
                        >
                          Clear
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          type="button"
                          onClick={() => setFilterOpen(false)}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>,
                document.body
              )}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-2xl border border-success/30 bg-success-soft/80 px-4 py-3 text-sm text-success shadow-sm animate-toastIn">
          {successMessage}
        </div>
      )}
      {undoState && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-secondary/30 bg-secondary-soft/70 px-4 py-3 text-sm text-text shadow-sm animate-toastIn">
          <span>Appointment marked as completed.</span>
          <Button variant="ghost" size="sm" type="button" onClick={handleUndoComplete}>
            Undo
          </Button>
        </div>
      )}

      {actionError && !isEditOpen && !isCancelOpen && !isCompleteOpen && (
        <ErrorState message={actionError} />
      )}

      {!!filteredAppointments.length && (
        <>
          <div className="space-y-3 md:hidden">
            {filteredAppointments.map((appointment) => {
              const { dateLabel, timeRange } = formatDateTimeCell(appointment);
              const patientInfo = appointment.patient ?? patientById.get(appointment.patient_id);
              const patientName = patientInfo?.full_name ?? `Patient #${appointment.patient_id}`;
              const contactPhone = patientInfo?.phone;
              const contactEmail = patientInfo?.email;
              const derivedStatus = getDerivedStatus(appointment);
              const isUnconfirmed = derivedStatus === "Unconfirmed";
              const isConfirmed = derivedStatus === "Confirmed";
              const isCompleted = derivedStatus === "Completed";
              const startTime = new Date(appointment.appointment_datetime).getTime();
              const isHistorical =
                isCompleted && !Number.isNaN(startTime) && startTime < Date.now();
              const canEdit = isUnconfirmed || isConfirmed;
              const canConfirm = isUnconfirmed;
              const canMarkCompleted = isConfirmed;
              const canCancel = isUnconfirmed || isConfirmed;
              return (
                <Card key={appointment.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-text">{patientName}</p>
                      <p className="text-xs text-text-subtle">
                        {dateLabel} · {timeRange}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[derivedStatus]}`}
                      >
                        {derivedStatus}
                      </span>
                      {isHistorical && (
                        <span className="rounded-full border border-border/60 bg-surface/70 px-2.5 py-1 text-[11px] font-semibold text-text-subtle">
                          Past visit
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-text-muted">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs uppercase tracking-wide text-text-subtle">
                        Contact
                      </span>
                      <span>{contactPhone || "—"}</span>
                      {contactEmail && (
                        <span className="text-xs text-text-subtle">{contactEmail}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs uppercase tracking-wide text-text-subtle">
                        Doctor
                      </span>
                      <span>{appointment.doctor_name || "—"}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs uppercase tracking-wide text-text-subtle">
                        Department
                      </span>
                      <span>{appointment.department || "—"}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="min-h-[44px]"
                      onClick={() => handleView(appointment)}
                    >
                      View
                    </Button>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-[44px]"
                        onClick={() => handleEdit(appointment)}
                      >
                        Edit
                      </Button>
                    )}
                    {canConfirm && (
                      <button
                        type="button"
                        onClick={() => handleConfirm(appointment)}
                        disabled={updateAppointment.isPending}
                        className="min-h-[44px] rounded-full border border-success/30 bg-success-soft/60 px-4 py-2 text-xs font-semibold text-success transition hover:border-success/40 hover:bg-success-soft/80 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/40 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Confirm
                      </button>
                    )}
                    {canMarkCompleted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-[44px]"
                        onClick={() => handleCompletePrompt(appointment)}
                      >
                        Mark Completed
                      </Button>
                    )}
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => handleCancelPrompt(appointment)}
                        className="min-h-[44px] rounded-full border border-danger/30 bg-danger-soft/60 px-4 py-2 text-xs font-semibold text-danger transition hover:border-danger/40 hover:bg-danger-soft/80 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
          <div className="hidden overflow-x-auto rounded-2xl border border-border/60 bg-surface/60 shadow-sm backdrop-blur md:block">
            <table className="min-w-full text-left text-sm text-text-muted">
              <thead className="bg-surface/75 text-xs uppercase tracking-wide text-text-subtle backdrop-blur">
                <tr>
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Date & Time</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Doctor</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 bg-surface/60">
                {filteredAppointments.map((appointment) => {
                  const { dateLabel, timeRange } = formatDateTimeCell(appointment);
                  const patientInfo =
                    appointment.patient ?? patientById.get(appointment.patient_id);
                  const patientName =
                    patientInfo?.full_name ?? `Patient #${appointment.patient_id}`;
                  const contactPhone = patientInfo?.phone;
                  const contactEmail = patientInfo?.email;
                  const derivedStatus = getDerivedStatus(appointment);
                  const isUnconfirmed = derivedStatus === "Unconfirmed";
                  const isConfirmed = derivedStatus === "Confirmed";
                  const isCompleted = derivedStatus === "Completed";
                  const startTime = new Date(appointment.appointment_datetime).getTime();
                  const isHistorical =
                    isCompleted && !Number.isNaN(startTime) && startTime < Date.now();
                  const canEdit = isUnconfirmed || isConfirmed;
                  const canConfirm = isUnconfirmed;
                  const canMarkCompleted = isConfirmed;
                  const canCancel = isUnconfirmed || isConfirmed;
                  return (
                    <tr key={appointment.id} className="transition hover:bg-surface/80">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-text">{patientName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-text">{dateLabel}</p>
                        <p className="text-xs text-text-subtle">{timeRange}</p>
                      </td>
                      <td className="px-4 py-3">
                        {contactPhone || contactEmail ? (
                          <div className="space-y-1 text-xs text-text-muted">
                            {contactPhone && (
                              <p className="text-sm font-medium text-text">{contactPhone}</p>
                            )}
                            {contactEmail && (
                              <p className="text-xs text-text-subtle">{contactEmail}</p>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">{appointment.doctor_name}</td>
                      <td className="px-4 py-3">{appointment.department || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[derivedStatus]}`}
                          >
                            {derivedStatus}
                          </span>
                          {isHistorical && (
                            <span className="rounded-full border border-border/60 bg-surface/70 px-2.5 py-1 text-[11px] font-semibold text-text-subtle">
                              Past visit
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(appointment)}>
                            View
                          </Button>
                          {canEdit && (
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(appointment)}>
                              Edit
                            </Button>
                          )}
                          {canConfirm && (
                            <button
                              type="button"
                              onClick={() => handleConfirm(appointment)}
                              disabled={updateAppointment.isPending}
                              className="rounded-full border border-success/30 bg-success-soft/60 px-3 py-1 text-xs font-semibold text-success transition hover:border-success/40 hover:bg-success-soft/80 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/40 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Confirm
                            </button>
                          )}
                          {canMarkCompleted && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCompletePrompt(appointment)}
                            >
                              Mark Completed
                            </Button>
                          )}
                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => handleCancelPrompt(appointment)}
                              className="rounded-full border border-danger/30 bg-danger-soft/60 px-3 py-1 text-xs font-semibold text-danger transition hover:border-danger/40 hover:bg-danger-soft/80 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!filteredAppointments.length && (
        <div className="rounded-2xl border border-border/60 bg-surface/70 px-4 py-6 text-center text-sm text-text-muted shadow-sm backdrop-blur">
          <p>
            {statusTab === "cancelled"
              ? "No cancelled appointments found yet."
              : "No appointments match the current filters."}
          </p>
          <Button
            className="mt-4"
            variant="secondary"
            onClick={() => navigate("/appointments/create")}
          >
            Create appointment
          </Button>
        </div>
      )}

      {isViewOpen &&
        selectedAppointment &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 sm:p-6 animate-fadeIn">
            <div className="absolute inset-0" onClick={closeModals} />
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="appointment-view-title"
              aria-describedby="appointment-view-desc"
              tabIndex={-1}
              className="relative z-10 flex w-full max-w-[95vw] flex-col overflow-hidden rounded-[32px] border border-border/60 bg-surface/80 shadow-card max-h-[90vh] backdrop-blur-xl animate-modalIn sm:max-w-3xl"
            >
              <div className="sticky top-0 z-10 flex flex-wrap items-start justify-between gap-3 border-b border-border/60 bg-surface/85 px-6 pb-4 pt-5 backdrop-blur">
                <div>
                  <h3 id="appointment-view-title" className="text-lg font-semibold text-text">
                    Appointment details
                  </h3>
                  <p id="appointment-view-desc" className="text-sm text-text-muted">
                    Review appointment information and status.
                  </p>
                </div>
                <Button variant="ghost" type="button" onClick={closeModals}>
                  Close
                </Button>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-surface/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-text-subtle">Patient</p>
                    <p className="mt-1 text-sm text-text-muted">
                      {selectedAppointment.patient?.full_name ??
                        `Patient #${selectedAppointment.patient_id}`}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-surface/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-text-subtle">Status</p>
                    <p className="mt-1 text-sm text-text-muted">
                      {getDerivedStatus(selectedAppointment)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-surface/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-text-subtle">Date & Time</p>
                    <p className="mt-1 text-sm text-text-muted">
                      {formatDateTimeCell(selectedAppointment).dateLabel}
                    </p>
                    <p className="text-xs text-text-subtle">
                      {formatDateTimeCell(selectedAppointment).timeRange}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-surface/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-text-subtle">Doctor</p>
                    <p className="mt-1 text-sm text-text-muted">
                      {selectedAppointment.doctor_name}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-surface/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-text-subtle">Department</p>
                    <p className="mt-1 text-sm text-text-muted">
                      {selectedAppointment.department || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-surface/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-text-subtle">Notes</p>
                    <p className="mt-1 text-sm text-text-muted">
                      {selectedAppointment.notes || "—"}
                    </p>
                  </div>
                </div>
                <div className="rounded-3xl border border-border/60 bg-surface/70 px-4 py-4 text-sm text-text-muted shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                    Reminders (Demo)
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Reminders are simulated in demo mode and do not send real messages.
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-sm text-text">Email reminder</span>
                      <span className="text-xs text-text-subtle">
                        {selectedAppointment.reminder_email_enabled ? "On" : "Off"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-sm text-text">SMS reminder (Demo)</span>
                      <span className="text-xs text-text-subtle">
                        {selectedAppointment.reminder_sms_enabled ? "On" : "Off"}
                      </span>
                    </div>
                    {viewReminderState.enabled &&
                      (selectedAppointment.reminder_email_enabled ||
                        selectedAppointment.reminder_sms_enabled) &&
                      selectedAppointment.reminder_next_run_at && (
                        <p className="text-xs text-text-subtle">
                          Next reminder:{" "}
                          {new Date(selectedAppointment.reminder_next_run_at).toLocaleString()}{" "}
                          (Demo)
                        </p>
                      )}
                    {!viewReminderState.enabled && (
                      <p className="text-xs text-text-subtle">{viewReminderState.message}</p>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={handleSimulateReminder}
                      disabled={
                        !viewReminderState.enabled ||
                        isSimulatingReminder ||
                        !(selectedAppointment.reminder_email_enabled ||
                          selectedAppointment.reminder_sms_enabled)
                      }
                    >
                      {isSimulatingReminder ? "Sending..." : "Send test reminder (Demo)"}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-border/60 bg-surface/85 px-6 py-4 backdrop-blur">
                <Button variant="secondary" type="button" onClick={closeModals}>
                  Close
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {isEditOpen &&
        selectedAppointment &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 sm:p-6 animate-fadeIn">
            <div className="absolute inset-0" onClick={closeModals} />
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="appointment-edit-title"
              aria-describedby="appointment-edit-desc"
              tabIndex={-1}
              className="relative z-10 flex w-full max-w-[95vw] flex-col overflow-hidden rounded-[32px] border border-border/60 bg-surface/80 shadow-card max-h-[90vh] backdrop-blur-xl animate-modalIn sm:max-w-3xl"
            >
              <div className="sticky top-0 z-10 flex flex-wrap items-start justify-between gap-3 border-b border-border/60 bg-surface/85 px-6 pb-4 pt-5 backdrop-blur">
                <div>
                  <h3 id="appointment-edit-title" className="text-lg font-semibold text-text">
                    Reschedule appointment
                  </h3>
                  <p id="appointment-edit-desc" className="text-sm text-text-muted">
                    Update timing, clinician details, or notes.
                  </p>
                </div>
                <Button variant="ghost" type="button" onClick={closeModals}>
                  Close
                </Button>
              </div>
              <form onSubmit={handleUpdate} className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <DateTimePicker
                      label="Start time"
                      mode="datetime"
                      value={formState.appointment_datetime}
                      onChange={handleDateTimeChange("appointment_datetime")}
                      error={formErrors.appointment_datetime}
                      required
                    />
                    <DateTimePicker
                      label="End time (optional)"
                      mode="datetime"
                      value={formState.appointment_end_datetime}
                      onChange={handleDateTimeChange("appointment_end_datetime")}
                      error={formErrors.appointment_end_datetime}
                    />
                    <InputField
                      label="Doctor (optional)"
                      name="doctor_name"
                      value={formState.doctor_name}
                      onChange={handleFieldChange}
                    />
                    <InputField
                      label="Department (optional)"
                      name="department"
                      value={formState.department}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <TextAreaField
                    label="Notes"
                    name="notes"
                    value={formState.notes}
                    onChange={handleFieldChange}
                    placeholder="Add visit notes or prep instructions."
                  />
                  <div className="rounded-3xl border border-border/60 bg-surface/70 px-4 py-4 text-sm text-text-muted shadow-sm backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                      Reminders (Demo)
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      Reminders are simulated in demo mode and do not send real messages.
                    </p>
                    <div className="mt-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formState.reminder_email_enabled}
                            disabled={!editReminderState.enabled}
                            onChange={(event) =>
                              setFormState((prev) => ({
                                ...prev,
                                reminder_email_enabled: event.target.checked
                              }))
                            }
                          />
                          <span className="text-sm text-text">Email reminder</span>
                        </label>
                        <select
                          value={formState.reminder_email_minutes_before}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              reminder_email_minutes_before: Number(event.target.value)
                            }))
                          }
                          disabled={!editReminderState.enabled}
                          className="glass-input w-full max-w-[180px] text-xs"
                        >
                          {REMINDER_EMAIL_OPTIONS.map((minutes) => (
                            <option key={minutes} value={minutes}>
                              {minutes} min before
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formState.reminder_sms_enabled}
                            disabled={!editReminderState.enabled}
                            onChange={(event) =>
                              setFormState((prev) => ({
                                ...prev,
                                reminder_sms_enabled: event.target.checked
                              }))
                            }
                          />
                          <span className="text-sm text-text">SMS reminder (Demo)</span>
                        </label>
                        <select
                          value={formState.reminder_sms_minutes_before}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              reminder_sms_minutes_before: Number(event.target.value)
                            }))
                          }
                          disabled={!editReminderState.enabled}
                          className="glass-input w-full max-w-[180px] text-xs"
                        >
                          {REMINDER_SMS_OPTIONS.map((minutes) => (
                            <option key={minutes} value={minutes}>
                              {minutes} min before
                            </option>
                          ))}
                        </select>
                      </div>
                      {editReminderState.enabled &&
                        (formState.reminder_email_enabled || formState.reminder_sms_enabled) &&
                        selectedAppointment?.reminder_next_run_at && (
                          <p className="text-xs text-text-subtle">
                            Next reminder:{" "}
                            {new Date(selectedAppointment.reminder_next_run_at).toLocaleString()}{" "}
                            (Demo)
                          </p>
                        )}
                      {!editReminderState.enabled && (
                        <p className="text-xs text-text-subtle">{editReminderState.message}</p>
                      )}
                    </div>
                  </div>
                  {actionError && <ErrorState message={actionError} />}
                </div>
                <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-border/60 bg-surface/85 px-6 py-4 backdrop-blur">
                  <Button variant="secondary" type="button" onClick={closeModals}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={updateAppointment.isPending}
                    disabled={updateAppointment.isPending}
                  >
                    {updateAppointment.isPending ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {isCancelOpen &&
        selectedAppointment &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 sm:p-6 animate-fadeIn">
            <div className="absolute inset-0" onClick={closeModals} />
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="appointment-cancel-title"
              aria-describedby="appointment-cancel-desc"
              tabIndex={-1}
              className="relative z-10 w-full max-w-[95vw] overflow-hidden rounded-[32px] border border-border/60 bg-surface/80 shadow-card backdrop-blur-xl animate-modalIn sm:max-w-md"
            >
              <div className="border-b border-border/60 px-6 pb-4 pt-5">
                <h3 id="appointment-cancel-title" className="text-lg font-semibold text-text">
                  Cancel appointment
                </h3>
                <p id="appointment-cancel-desc" className="text-sm text-text-muted">
                  Are you sure you want to cancel this appointment? This will mark it as cancelled.
                </p>
              </div>
              <div className="space-y-3 px-6 py-5 text-sm text-text-muted">
                <p>
                  <span className="font-semibold text-text">Patient:</span>{" "}
                  {selectedAppointment.patient?.full_name ??
                    `Patient #${selectedAppointment.patient_id}`}
                </p>
                <p>
                  <span className="font-semibold text-text">Date:</span>{" "}
                  {formatDateTimeCell(selectedAppointment).dateLabel}
                </p>
                {actionError && <ErrorState message={actionError} />}
              </div>
              <div className="flex flex-wrap justify-end gap-3 border-t border-border/60 px-6 py-4">
                <Button variant="secondary" type="button" onClick={closeModals}>
                  Keep appointment
                </Button>
                <Button
                  variant="destructive"
                  type="button"
                  onClick={handleCancel}
                  isLoading={cancelAppointment.isPending}
                  disabled={cancelAppointment.isPending}
                >
                  {cancelAppointment.isPending ? "Cancelling..." : "Confirm cancel"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {isCompleteOpen &&
        completeTarget &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 sm:p-6 animate-fadeIn">
            <div className="absolute inset-0" onClick={closeModals} />
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="appointment-complete-title"
              aria-describedby="appointment-complete-desc"
              tabIndex={-1}
              className="relative z-10 w-full max-w-[95vw] overflow-hidden rounded-[32px] border border-border/60 bg-surface/80 shadow-card backdrop-blur-xl animate-modalIn sm:max-w-md"
            >
              <div className="border-b border-border/60 px-6 pb-4 pt-5">
                <h3 id="appointment-complete-title" className="text-lg font-semibold text-text">
                  Mark appointment as completed?
                </h3>
                <p id="appointment-complete-desc" className="text-sm text-text-muted">
                  This will finalize the visit in the schedule. You can undo for a short time.
                </p>
              </div>
              <div className="space-y-3 px-6 py-5 text-sm text-text-muted">
                <p>
                  <span className="font-semibold text-text">Patient:</span>{" "}
                  {completeTarget.patient?.full_name ??
                    `Patient #${completeTarget.patient_id}`}
                </p>
                <p>
                  <span className="font-semibold text-text">Date:</span>{" "}
                  {formatDateTimeCell(completeTarget).dateLabel}
                </p>
                {actionError && <ErrorState message={actionError} />}
              </div>
              <div className="flex flex-wrap justify-end gap-3 border-t border-border/60 px-6 py-4">
                <Button variant="secondary" type="button" onClick={closeModals}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCompleteConfirm}
                  isLoading={completeAppointment.isPending}
                  disabled={completeAppointment.isPending}
                >
                  {completeAppointment.isPending ? "Marking..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </Card>
  );
};

export default AppointmentListPage;
