import { forwardRef, useMemo, useState } from "react";
import type { InputHTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

type DateRangeValue = { start?: string; end?: string };

type BaseProps = {
  label: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

type DateProps = BaseProps & {
  mode: "date" | "datetime";
  value: string;
  onChange: (value: string) => void;
};

type RangeProps = BaseProps & {
  mode: "daterange";
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
};

type DateTimePickerProps = DateProps | RangeProps;

const pad = (value: number) => value.toString().padStart(2, "0");

const formatDateOnly = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatDateTime = (date: Date) =>
  `${formatDateOnly(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

const parseDateOnly = (value?: string) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const parseDateTime = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onToggle?: () => void;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, onToggle, disabled, ...props }, ref) => (
    <div className="relative w-full">
      <input
        ref={ref}
        className={`glass-input w-full pr-12 text-sm ${className ?? ""}`}
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle?.();
          }
        }}
        aria-label="Open calendar"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full border border-border/60 bg-surface/70 p-2 text-text-muted shadow-sm transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        disabled={disabled}
      >
        <Calendar className="h-4 w-4" />
      </button>
    </div>
  )
);

GlassInput.displayName = "GlassInput";

export const DateTimePicker = (props: DateTimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const PopperContainer = ({ children }: { children: ReactNode }) =>
    createPortal(children, document.body);
  const commonInputClass = props.error ? "border-danger focus:ring-danger/40" : "";
  const currentYear = new Date().getFullYear();
  const pickerProps = {
    popperClassName: "mt-date-picker-popper",
    calendarClassName: "mt-date-picker",
    wrapperClassName: "w-full",
    showPopperArrow: false,
    disabled: props.disabled,
    customInput: <GlassInput className={commonInputClass} onToggle={() => setIsOpen((v) => !v)} />,
    popperContainer: PopperContainer,
    showMonthDropdown: true,
    showYearDropdown: true,
    dropdownMode: "select" as const,
    scrollableYearDropdown: true,
    yearDropdownItemNumber: 120,
    open: isOpen,
    onClickOutside: () => setIsOpen(false),
    onInputClick: () => null,
    onKeyDown: (event: ReactKeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
  };

  const labelContent = (
    <span>
      {props.label}
      {props.required ? <span className="text-danger"> *</span> : null}
    </span>
  );

  if (props.mode === "daterange") {
    const startDate = parseDateOnly(props.value.start);
    const endDate = parseDateOnly(props.value.end);
    return (
      <label className="flex w-full flex-col gap-2 text-sm font-medium text-text">
        {labelContent}
        <DatePicker
          {...pickerProps}
          selectsRange
          startDate={startDate}
          endDate={endDate}
          placeholderText={props.placeholder ?? "Select dates"}
          onChange={(dates: [Date | null, Date | null] | null) => {
            if (!dates) {
              props.onChange({ start: undefined, end: undefined });
              return;
            }
            const [start, end] = dates as [Date | null, Date | null];
            props.onChange({
              start: start ? formatDateOnly(start) : undefined,
              end: end ? formatDateOnly(end) : undefined
            });
            if (start && end) {
              setIsOpen(false);
            }
          }}
          minDate={new Date(1900, 0, 1)}
          maxDate={new Date(currentYear + 5, 11, 31)}
          dateFormat="MMM d, yyyy"
        />
        {props.error && <span className="text-xs text-danger">{props.error}</span>}
      </label>
    );
  }

  const selected = useMemo(
    () => (props.mode === "date" ? parseDateOnly(props.value) : parseDateTime(props.value)),
    [props.mode, props.value]
  );

  return (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-text">
      {labelContent}
      <DatePicker
        {...pickerProps}
        selected={selected}
        onChange={(date: Date | null) => {
          const next = date;
          if (!next) {
            props.onChange("");
            return;
          }
          props.onChange(props.mode === "date" ? formatDateOnly(next) : formatDateTime(next));
          setIsOpen(false);
        }}
        minDate={props.mode === "date" ? new Date(1900, 0, 1) : undefined}
        maxDate={props.mode === "date" ? new Date(currentYear + 5, 11, 31) : undefined}
        placeholderText={props.placeholder ?? "Select date"}
        dateFormat={props.mode === "date" ? "MMM d, yyyy" : "MMM d, yyyy h:mm aa"}
        showTimeSelect={props.mode === "datetime"}
        timeIntervals={15}
        timeFormat="h:mm aa"
      />
      {props.error && <span className="text-xs text-danger">{props.error}</span>}
    </label>
  );
};
