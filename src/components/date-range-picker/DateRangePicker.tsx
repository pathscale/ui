import "./DateRangePicker.css";
import { Show, createEffect, createMemo, createUniqueId, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import {
  formatDate,
  toISODate,
  usePickerOpenState,
  useRangeSelection,
  type ControlledDateRangeValue,
} from "../../hooks/date";
import Calendar, { type CalendarWeekdayFormat } from "../calendar";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./DateRangePicker.classes";

export type DateRangeValue = ControlledDateRangeValue;

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
  minValue?: Date;
  maxValue?: Date;
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

  const isDisabled = createMemo(() => Boolean(local.isDisabled) || Boolean(local.disabled));

  const rangeSelection = useRangeSelection({
    value: () => local.value,
    defaultValue: () => local.defaultValue,
    onChange: () => local.onChange,
  });

  const openState = usePickerOpenState({
    isOpen: () => local.isOpen,
    defaultOpen: () => local.defaultOpen,
    onOpenChange: () => local.onOpenChange,
    isDisabled,
  });

  createEffect(() => {
    if (openState.isOpen()) return;
    rangeSelection.clearPendingSelection();
  });

  const locale = createMemo(() => local.locale ?? "en-US");

  const startValue = createMemo(() => rangeSelection.rangeStart());
  const endValue = createMemo(() => rangeSelection.rangeEnd());
  const focusDate = createMemo(() => rangeSelection.focusDate());

  const startDisplay = createMemo(() => {
    if (!startValue()) return local.startPlaceholder ?? "Start date";
    return formatDate(startValue(), locale());
  });

  const endDisplay = createMemo(() => {
    if (!endValue()) return local.endPlaceholder ?? "End date";
    return formatDate(endValue(), locale());
  });

  const handleDateSelect = (date: Date) => {
    const wasSelectingEnd = rangeSelection.isSelectingEnd();
    rangeSelection.selectDate(date);

    if (wasSelectingEnd && !rangeSelection.isSelectingEnd()) {
      openState.setOpen(false);
    }
  };

  const uniqueId = createUniqueId();
  const popoverId = `date-range-picker-popover-${uniqueId}`;

  return (
    <div
      {...others}
      ref={(node) => {
        openState.setRootRef(node);
        if (typeof local.ref === "function") {
          local.ref(node);
        }
      }}
      class={twMerge(
        CLASSES.Root.base,
        openState.isOpen() && CLASSES.Root.flag.open,
        isDisabled() && CLASSES.Root.flag.disabled,
        local.class,
        local.className,
      )}
      data-slot="date-range-picker"
      data-open={openState.isOpen() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
      aria-disabled={isDisabled() ? "true" : undefined}
    >
      <Show when={local.startName}>
        <input
          type="hidden"
          name={local.startName}
          value={toISODate(startValue())}
          disabled={isDisabled()}
        />
      </Show>
      <Show when={local.endName}>
        <input
          type="hidden"
          name={local.endName}
          value={toISODate(endValue())}
          disabled={isDisabled()}
        />
      </Show>

      <button
        type="button"
        class={CLASSES.Trigger.base}
        data-slot="date-range-picker-trigger"
        aria-haspopup="dialog"
        aria-expanded={openState.isOpen() ? "true" : "false"}
        aria-controls={openState.isOpen() ? popoverId : undefined}
        aria-disabled={isDisabled() ? "true" : "false"}
        data-disabled={isDisabled() ? "true" : "false"}
        disabled={isDisabled()}
        onClick={() => openState.toggleOpen()}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openState.setOpen(true);
          }
        }}
      >
        <span
          class={twMerge(
            CLASSES.TriggerSegment.base,
            !startValue() && CLASSES.TriggerSegment.flag.placeholder,
          )}
          data-slot="date-range-picker-start"
        >
          {startDisplay()}
        </span>

        <span class={CLASSES.RangeSeparator.base} data-slot="date-range-picker-range-separator" aria-hidden="true">
          -
        </span>

        <span
          class={twMerge(
            CLASSES.TriggerSegment.base,
            !endValue() && CLASSES.TriggerSegment.flag.placeholder,
          )}
          data-slot="date-range-picker-end"
        >
          {endDisplay()}
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

      <Show when={openState.isOpen()}>
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
            value={focusDate() ?? undefined}
            rangeStart={startValue() ?? undefined}
            rangeEnd={endValue() ?? undefined}
            rangePreview={rangeSelection.hoveredDate() ?? undefined}
            onDaySelect={handleDateSelect}
            onDayHover={rangeSelection.setHoverDate}
            locale={locale()}
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
