import "./DatePicker.css";
import {
  Show,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  onCleanup,
  onMount,
  splitProps,
  type JSX,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import Calendar, { type CalendarWeekdayFormat } from "../calendar";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./DatePicker.classes";

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const createDate = (year: number, monthIndex: number, day: number) =>
  new Date(year, monthIndex, day, 12, 0, 0, 0);

const parseISODate = (value: string | undefined): Date | null => {
  if (!value) return null;

  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  const parsed = createDate(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

type DatePickerBaseProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  name?: string;
  placeholder?: string;
  locale?: string;
  weekdayFormat?: CalendarWeekdayFormat;
  minValue?: string;
  maxValue?: string;
  isDateUnavailable?: (date: Date) => boolean;
  isDisabled?: boolean;
  disabled?: boolean;
};

export type DatePickerProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange" | "children"
> &
  IComponentBaseProps &
  DatePickerBaseProps;

const DatePicker = (props: DatePickerProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
    "ref",
    "value",
    "defaultValue",
    "onChange",
    "isOpen",
    "defaultOpen",
    "onOpenChange",
    "name",
    "placeholder",
    "locale",
    "weekdayFormat",
    "minValue",
    "maxValue",
    "isDateUnavailable",
    "isDisabled",
    "disabled",
  ]);

  const [internalValue, setInternalValue] = createSignal(local.defaultValue ?? "");
  const [internalOpen, setInternalOpen] = createSignal(Boolean(local.defaultOpen));

  const isOpenControlled = createMemo(() => local.isOpen !== undefined);
  const isValueControlled = createMemo(() => local.value !== undefined);
  const value = createMemo(() =>
    isValueControlled() ? local.value ?? "" : internalValue(),
  );
  const isOpen = createMemo(() =>
    isOpenControlled() ? Boolean(local.isOpen) : internalOpen(),
  );
  const isDisabled = createMemo(() => Boolean(local.isDisabled) || Boolean(local.disabled));
  const formatter = createMemo(
    () =>
      new Intl.DateTimeFormat(local.locale ?? "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
  );
  const displayValue = createMemo(() => {
    const parsed = parseISODate(value());
    if (!parsed) return local.placeholder ?? "Select date";

    return formatter().format(parsed);
  });

  const setOpen = (nextOpen: boolean) => {
    if (nextOpen && isDisabled()) return;

    const previous = isOpen();
    if (!isOpenControlled()) {
      setInternalOpen(nextOpen);
    }

    if (previous !== nextOpen) {
      local.onOpenChange?.(nextOpen);
    }
  };

  const handleValueChange = (nextValue: string) => {
    if (!isValueControlled()) {
      setInternalValue(nextValue);
    }

    local.onChange?.(nextValue);
    setOpen(false);
  };

  let rootRef: HTMLDivElement | undefined;

  onMount(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!isOpen()) return;
      if (!rootRef) return;
      if (rootRef.contains(event.target as Node)) return;
      setOpen(false);
    };

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (!isOpen()) return;
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleGlobalKeyDown);

    onCleanup(() => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleGlobalKeyDown);
    });
  });

  createEffect(() => {
    if (!isDisabled()) return;
    if (isOpen()) {
      setOpen(false);
    }
  });

  const uniqueId = createUniqueId();
  const popoverId = `date-picker-popover-${uniqueId}`;

  return (
    <div
      {...others}
      ref={(node) => {
        rootRef = node;
        if (typeof local.ref === "function") {
          local.ref(node);
        }
      }}
      class={twMerge(
        CLASSES.Root.base,
        isOpen() && CLASSES.Root.flag.open,
        isDisabled() && CLASSES.Root.flag.disabled,
        local.class,
        local.className,
      )}
      data-slot="date-picker"
      data-open={isOpen() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
      aria-disabled={isDisabled() ? "true" : undefined}
    >
      <Show when={local.name}>
        <input type="hidden" name={local.name} value={value()} disabled={isDisabled()} />
      </Show>

      <button
        type="button"
        class={CLASSES.Trigger.base}
        data-slot="date-picker-trigger"
        aria-haspopup="dialog"
        aria-expanded={isOpen() ? "true" : "false"}
        aria-controls={isOpen() ? popoverId : undefined}
        aria-disabled={isDisabled() ? "true" : "false"}
        data-disabled={isDisabled() ? "true" : "false"}
        disabled={isDisabled()}
        onClick={() => setOpen(!isOpen())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span
          class={twMerge(
            CLASSES.TriggerValue.base,
            !parseISODate(value()) && CLASSES.TriggerValue.flag.placeholder,
          )}
          data-slot="date-picker-trigger-value"
        >
          {displayValue()}
        </span>

        <span class={CLASSES.TriggerIndicator.base} data-slot="date-picker-trigger-indicator" aria-hidden="true">
          <svg
            class={CLASSES.TriggerIcon.base}
            data-slot="date-picker-trigger-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </span>
      </button>

      <Show when={isOpen()}>
        <div
          id={popoverId}
          class={CLASSES.Popover.base}
          data-slot="date-picker-popover"
          role="dialog"
          aria-modal="false"
        >
          <Calendar
            class={CLASSES.Calendar.base}
            data-slot="date-picker-calendar"
            value={value()}
            onChange={handleValueChange}
            locale={local.locale}
            weekdayFormat={local.weekdayFormat}
            minValue={local.minValue}
            maxValue={local.maxValue}
            isDateUnavailable={local.isDateUnavailable}
            isDisabled={isDisabled()}
          />
        </div>
      </Show>
    </div>
  );
};

export default DatePicker;
