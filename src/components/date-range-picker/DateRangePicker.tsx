import "./DateRangePicker.css";
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
import { CLASSES } from "./DateRangePicker.classes";

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

const dateKey = (date: Date) =>
  date.getFullYear() * 10_000 + (date.getMonth() + 1) * 100 + date.getDate();

const compareDay = (left: Date, right: Date) => dateKey(left) - dateKey(right);

export type DateRangeValue = {
  start?: string;
  end?: string;
} | null;

const normalizeRangeValue = (value: DateRangeValue | undefined): DateRangeValue => {
  if (!value) return null;

  const parsedStart = parseISODate(value.start);
  const parsedEnd = parseISODate(value.end);

  if (!parsedStart && !parsedEnd) {
    return null;
  }

  if (parsedStart && !parsedEnd) {
    return { start: value.start };
  }

  if (!parsedStart && parsedEnd) {
    return { start: value.end };
  }

  if (!parsedStart || !parsedEnd) {
    return null;
  }

  if (compareDay(parsedStart, parsedEnd) <= 0) {
    return {
      start: value.start,
      end: value.end,
    };
  }

  return {
    start: value.end,
    end: value.start,
  };
};

type DateRangePickerBaseProps = {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  startName?: string;
  endName?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  locale?: string;
  weekdayFormat?: CalendarWeekdayFormat;
  minValue?: string;
  maxValue?: string;
  isDateUnavailable?: (date: Date) => boolean;
  isDisabled?: boolean;
  disabled?: boolean;
};

export type DateRangePickerProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange" | "children"
> &
  IComponentBaseProps &
  DateRangePickerBaseProps;

const DateRangePicker = (props: DateRangePickerProps): JSX.Element => {
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
    "startName",
    "endName",
    "startPlaceholder",
    "endPlaceholder",
    "locale",
    "weekdayFormat",
    "minValue",
    "maxValue",
    "isDateUnavailable",
    "isDisabled",
    "disabled",
  ]);

  const [internalRange, setInternalRange] = createSignal<DateRangeValue>(
    normalizeRangeValue(local.defaultValue),
  );
  const [internalOpen, setInternalOpen] = createSignal(Boolean(local.defaultOpen));
  const [hoveredDate, setHoveredDate] = createSignal<string | undefined>(undefined);

  const isOpenControlled = createMemo(() => local.isOpen !== undefined);
  const isValueControlled = createMemo(() => local.value !== undefined);
  const rangeValue = createMemo(() =>
    normalizeRangeValue(isValueControlled() ? local.value : internalRange()),
  );
  const isOpen = createMemo(() =>
    isOpenControlled() ? Boolean(local.isOpen) : internalOpen(),
  );
  const isDisabled = createMemo(() => Boolean(local.isDisabled) || Boolean(local.disabled));
  const isSelectingEnd = createMemo(() =>
    Boolean(rangeValue()?.start) && !Boolean(rangeValue()?.end),
  );

  const formatter = createMemo(
    () =>
      new Intl.DateTimeFormat(local.locale ?? "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
  );

  const formatSegment = (value: string | undefined, placeholder: string) => {
    const parsed = parseISODate(value);
    if (!parsed) return placeholder;
    return formatter().format(parsed);
  };

  const setOpen = (nextOpen: boolean) => {
    if (nextOpen && isDisabled()) return;

    const previous = isOpen();
    if (!isOpenControlled()) {
      setInternalOpen(nextOpen);
    }

    if (previous !== nextOpen) {
      local.onOpenChange?.(nextOpen);
    }

    if (!nextOpen) {
      setHoveredDate(undefined);
    }
  };

  const setRangeValue = (nextValue: DateRangeValue) => {
    const normalizedNext = normalizeRangeValue(nextValue);

    if (!isValueControlled()) {
      setInternalRange(normalizedNext);
    }

    local.onChange?.(normalizedNext);
  };

  const handleDaySelect = (nextDateValue: string) => {
    const current = rangeValue();

    if (!current?.start || current.end) {
      setRangeValue({ start: nextDateValue });
      setHoveredDate(undefined);
      return;
    }

    const start = parseISODate(current.start);
    const next = parseISODate(nextDateValue);

    if (!start || !next) {
      setRangeValue({ start: nextDateValue });
      setHoveredDate(undefined);
      return;
    }

    if (compareDay(next, start) < 0) {
      setRangeValue({ start: nextDateValue });
      setHoveredDate(undefined);
      return;
    }

    setRangeValue({ start: current.start, end: nextDateValue });
    setHoveredDate(undefined);
    setOpen(false);
  };

  const handleDayHover = (nextValue: string | undefined) => {
    if (!isSelectingEnd()) {
      setHoveredDate(undefined);
      return;
    }

    setHoveredDate(nextValue);
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

  createEffect(() => {
    if (!isOpen()) {
      setHoveredDate(undefined);
      return;
    }

    if (!isSelectingEnd()) {
      setHoveredDate(undefined);
    }
  });

  const uniqueId = createUniqueId();
  const popoverId = `date-range-picker-popover-${uniqueId}`;

  const startValue = createMemo(() => rangeValue()?.start);
  const endValue = createMemo(() => rangeValue()?.end);
  const calendarFocusValue = createMemo(() => endValue() ?? startValue() ?? "");

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
      data-slot="date-range-picker"
      data-open={isOpen() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
      aria-disabled={isDisabled() ? "true" : undefined}
    >
      <Show when={local.startName}>
        <input type="hidden" name={local.startName} value={startValue() ?? ""} disabled={isDisabled()} />
      </Show>
      <Show when={local.endName}>
        <input type="hidden" name={local.endName} value={endValue() ?? ""} disabled={isDisabled()} />
      </Show>

      <button
        type="button"
        class={CLASSES.Trigger.base}
        data-slot="date-range-picker-trigger"
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
            CLASSES.TriggerSegment.base,
            !parseISODate(startValue()) && CLASSES.TriggerSegment.flag.placeholder,
          )}
          data-slot="date-range-picker-start"
        >
          {formatSegment(startValue(), local.startPlaceholder ?? "Start date")}
        </span>

        <span class={CLASSES.RangeSeparator.base} data-slot="date-range-picker-range-separator" aria-hidden="true">
          -
        </span>

        <span
          class={twMerge(
            CLASSES.TriggerSegment.base,
            !parseISODate(endValue()) && CLASSES.TriggerSegment.flag.placeholder,
          )}
          data-slot="date-range-picker-end"
        >
          {formatSegment(endValue(), local.endPlaceholder ?? "End date")}
        </span>

        <span class={CLASSES.TriggerIndicator.base} data-slot="date-range-picker-trigger-indicator" aria-hidden="true">
          <svg
            class={CLASSES.TriggerIcon.base}
            data-slot="date-range-picker-trigger-icon"
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
          data-slot="date-range-picker-popover"
          role="dialog"
          aria-modal="false"
        >
          <Calendar
            class={CLASSES.Calendar.base}
            data-slot="date-range-picker-calendar"
            selectionMode="range"
            value={calendarFocusValue()}
            rangeStart={startValue()}
            rangeEnd={endValue()}
            rangePreview={hoveredDate()}
            onDaySelect={(nextValue) => handleDaySelect(nextValue)}
            onDayHover={(nextValue) => handleDayHover(nextValue)}
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

export default DateRangePicker;
