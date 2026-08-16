import "./DateRangePicker.css";
import type { JSX } from "@solidjs/web";
import {Show, createEffect, createMemo, createUniqueId, omit} from "solid-js";
import { twMerge } from "../../lib/twMerge";

import {
  formatDate,
  toISODate,
  usePickerOpenState,
  useRangeSelection,
  type ControlledDateRangeValue,
} from "../../hooks/date";
import Calendar, { type CalendarWeekdayFormat } from "../calendar";
import type { UIBaseProps, State } from "../vocabulary";
import { CLASSES } from "./DateRangePicker.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./DateRangePicker.recipe";

export type DateRangeValue = ControlledDateRangeValue;

type DateRangePickerBaseProps = {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  open?: boolean;
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
  state?: State;
  disabled?: boolean;
};

export type DateRangePickerProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange" | "children"
> &
  UIBaseProps &
  DateRangePickerBaseProps;

const DateRangePicker: Layout<typeof componentRecipe, DateRangePickerProps> = () => {
  const others = omit(
    props,
    "class",
    "dataTheme",
    "style",
    "ref",
    "value",
    "defaultValue",
    "onChange",
    "open",
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
    "state",
    "disabled",
  );

  const isDisabled = createMemo(() => Boolean((props.state === "disabled")) || Boolean(props.disabled));

  const rangeSelection = useRangeSelection({
    value: () => props.value,
    defaultValue: () => props.defaultValue,
    onChange: () => props.onChange,
  });

  const openState = usePickerOpenState({
    isOpen: () => props.open,
    defaultOpen: () => props.defaultOpen,
    onOpenChange: () => props.onOpenChange,
    isDisabled,
  });

  createEffect(() => {
    if (openState.isOpen()) return;
    rangeSelection.clearPendingSelection();
  });

  const locale = createMemo(() => props.locale ?? "en-US");

  const startValue = createMemo(() => rangeSelection.rangeStart());
  const endValue = createMemo(() => rangeSelection.rangeEnd());
  const focusDate = createMemo(() => rangeSelection.focusDate());

  const startDisplay = createMemo(() => {
    if (!startValue()) return props.startPlaceholder ?? "Start date";
    return formatDate(startValue(), locale());
  });

  const endDisplay = createMemo(() => {
    if (!endValue()) return props.endPlaceholder ?? "End date";
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
        if (typeof props.ref === "function") {
          props.ref(node);
        }
      }}
      {...{ class: twMerge(
        CLASSES.Root.base,
        openState.isOpen() && CLASSES.Root.flag.open,
        isDisabled() && CLASSES.Root.flag.disabled,
        props.class,
      ) }}
      data-slot="date-range-picker"
      data-open={openState.isOpen() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      data-theme={props.dataTheme}
      style={props.style}
      aria-disabled={isDisabled() ? "true" : undefined}
    >
      <Show when={props.startName}>
        <input
          type="hidden"
          name={props.startName}
          value={toISODate(startValue())}
          disabled={isDisabled()}
        />
      </Show>
      <Show when={props.endName}>
        <input
          type="hidden"
          name={props.endName}
          value={toISODate(endValue())}
          disabled={isDisabled()}
        />
      </Show>

      <button
        type="button"
        {...{ class: CLASSES.Trigger.base }}
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
          {...{ class: twMerge(
            CLASSES.TriggerSegment.base,
            !startValue() && CLASSES.TriggerSegment.flag.placeholder,
          ) }}
          data-slot="date-range-picker-start"
        >
          {startDisplay()}
        </span>

        <span {...{ class: CLASSES.RangeSeparator.base }} data-slot="date-range-picker-range-separator" aria-hidden="true">
          -
        </span>

        <span
          {...{ class: twMerge(
            CLASSES.TriggerSegment.base,
            !endValue() && CLASSES.TriggerSegment.flag.placeholder,
          ) }}
          data-slot="date-range-picker-end"
        >
          {endDisplay()}
        </span>

        <span {...{ class: CLASSES.TriggerIndicator.base }} data-slot="date-range-picker-trigger-indicator" aria-hidden="true">
          <svg
            {...{ class: CLASSES.TriggerIcon.base }}
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
          {...{ class: CLASSES.Popover.base }}
          data-slot="date-range-picker-popover"
          role="dialog"
          aria-modal="false"
        >
          <Calendar
            {...{ class: CLASSES.Calendar.base }}
            data-slot="date-range-picker-calendar"
            selectionMode="range"
            value={focusDate() ?? undefined}
            rangeStart={startValue() ?? undefined}
            rangeEnd={endValue() ?? undefined}
            rangePreview={rangeSelection.hoveredDate() ?? undefined}
            onDaySelect={handleDateSelect}
            onDayHover={rangeSelection.setHoverDate}
            locale={locale()}
            weekdayFormat={props.weekdayFormat}
            minValue={props.minValue}
            maxValue={props.maxValue}
            isDateUnavailable={props.isDateUnavailable}
            state={isDisabled() ? "disabled" : undefined}
          />
        </div>
      </Show>
    </div>
  );
};

export default DateRangePicker;
