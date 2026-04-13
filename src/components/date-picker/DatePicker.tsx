import "./DatePicker.css";
import { Show, createMemo, createUniqueId, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import {
  formatDate,
  toISODate,
  useDateSelection,
  usePickerOpenState,
} from "../../hooks/date";
import Calendar, { type CalendarWeekdayFormat } from "../calendar";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./DatePicker.classes";

type DatePickerBaseProps = {
  value?: Date;
  defaultValue?: Date;
  onChange?: (value: Date) => void;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  name?: string;
  placeholder?: string;
  locale?: string;
  weekdayFormat?: CalendarWeekdayFormat;
  minValue?: Date;
  maxValue?: Date;
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

  const isDisabled = createMemo(() => Boolean(local.isDisabled) || Boolean(local.disabled));

  const selection = useDateSelection({
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

  const locale = createMemo(() => local.locale ?? "en-US");

  const displayValue = createMemo(() => {
    const selectedDate = selection.selectedDate();
    if (!selectedDate) return local.placeholder ?? "Select date";

    return formatDate(selectedDate, locale());
  });

  const uniqueId = createUniqueId();
  const popoverId = `date-picker-popover-${uniqueId}`;

  const handleDateChange = (date: Date) => {
    selection.setSelectedDate(date);
    openState.setOpen(false);
  };

  return (
    <div
      {...others}
      ref={(node) => {
        openState.setRootRef(node);
        if (typeof local.ref === "function") {
          local.ref(node);
        }
      }}
      {...{ class: twMerge(
        CLASSES.Root.base,
        openState.isOpen() && CLASSES.Root.flag.open,
        isDisabled() && CLASSES.Root.flag.disabled,
        local.class,
        local.className,
      ) }}
      data-slot="date-picker"
      data-open={openState.isOpen() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
      aria-disabled={isDisabled() ? "true" : undefined}
    >
      <Show when={local.name}>
        <input
          type="hidden"
          name={local.name}
          value={toISODate(selection.selectedDate())}
          disabled={isDisabled()}
        />
      </Show>

      <button
        type="button"
        {...{ class: CLASSES.Trigger.base }}
        data-slot="date-picker-trigger"
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
            CLASSES.TriggerValue.base,
            !selection.selectedDate() && CLASSES.TriggerValue.flag.placeholder,
          ) }}
          data-slot="date-picker-trigger-value"
        >
          {displayValue()}
        </span>

        <span {...{ class: CLASSES.TriggerIndicator.base }} data-slot="date-picker-trigger-indicator" aria-hidden="true">
          <svg
            {...{ class: CLASSES.TriggerIcon.base }}
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

      <Show when={openState.isOpen()}>
        <div
          id={popoverId}
          {...{ class: CLASSES.Popover.base }}
          data-slot="date-picker-popover"
          role="dialog"
          aria-modal="false"
        >
          <Calendar
            {...{ class: CLASSES.Calendar.base }}
            data-slot="date-picker-calendar"
            value={selection.selectedDate() ?? undefined}
            onChange={handleDateChange}
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

export default DatePicker;
