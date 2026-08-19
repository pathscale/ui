import "./DatePicker.css";
import type { JSX } from "@solidjs/web";
import {Show, createMemo, createUniqueId, omit} from "solid-js";
import { twMerge } from "../../lib/twMerge";

import {
  formatDate,
  toISODate,
  useDateSelection,
  usePickerOpenState,
} from "../../hooks/date";
import Calendar, { type CalendarWeekdayFormat } from "../calendar";
import type { UIBaseProps, State } from "../vocabulary";
import { CLASSES } from "./DatePicker.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./DatePicker.recipe";

type DatePickerBaseProps = {
  value?: Date;
  defaultValue?: Date;
  onChange?: (value: Date) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  name?: string;
  placeholder?: string;
  locale?: string;
  weekdayFormat?: CalendarWeekdayFormat;
  minValue?: Date;
  maxValue?: Date;
  isDateUnavailable?: (date: Date) => boolean;
  state?: State;
  disabled?: boolean;
};

export type DatePickerProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange" | "children"
> &
  UIBaseProps &
  DatePickerBaseProps;

const DatePicker: Layout<typeof componentRecipe, DatePickerProps> = () => {
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
    "name",
    "placeholder",
    "locale",
    "weekdayFormat",
    "minValue",
    "maxValue",
    "isDateUnavailable",
    "state",
    "disabled",
  );

  const isDisabled = createMemo(() => Boolean((props.state === "disabled")) || Boolean(props.disabled));

  const selection = useDateSelection({
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

  const locale = createMemo(() => props.locale ?? "en-US");

  const displayValue = createMemo(() => {
    const selectedDate = selection.selectedDate();
    if (!selectedDate) return props.placeholder ?? "Select date";

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
      data-slot="date-picker"
      data-open={openState.isOpen() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      data-theme={props.dataTheme}
      style={props.style}
      aria-disabled={isDisabled() ? "true" : undefined}
    >
      <Show when={props.name}>
        <input
          type="hidden"
          name={props.name}
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

export default DatePicker;
