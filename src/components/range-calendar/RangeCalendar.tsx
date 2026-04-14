import "./RangeCalendar.css";
import { createMemo, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import {
  useRangeSelection,
  type ControlledDateRangeValue,
} from "../../hooks/date";
import Calendar, { type CalendarWeekdayFormat } from "../calendar";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./RangeCalendar.classes";

export type RangeCalendarValue = ControlledDateRangeValue;

type RangeCalendarBaseProps = {
  value?: RangeCalendarValue;
  defaultValue?: RangeCalendarValue;
  onChange?: (value: RangeCalendarValue) => void;
  locale?: string;
  weekdayFormat?: CalendarWeekdayFormat;
  minValue?: Date;
  maxValue?: Date;
  isDateUnavailable?: (date: Date) => boolean;
  showOutsideDays?: boolean;
  isDisabled?: boolean;
  disabled?: boolean;
  onDaySelect?: (date: Date) => void;
  onDayHover?: (date?: Date) => void;
};

export type RangeCalendarProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange" | "children"
> &
  IComponentBaseProps &
  RangeCalendarBaseProps;

const RangeCalendar = (props: RangeCalendarProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
    "ref",
    "value",
    "defaultValue",
    "onChange",
    "locale",
    "weekdayFormat",
    "minValue",
    "maxValue",
    "isDateUnavailable",
    "showOutsideDays",
    "isDisabled",
    "disabled",
    "onDaySelect",
    "onDayHover",
  ]);

  const isDisabled = createMemo(() => Boolean(local.isDisabled) || Boolean(local.disabled));

  const rangeSelection = useRangeSelection({
    value: () => local.value,
    defaultValue: () => local.defaultValue,
    onChange: () => local.onChange,
  });

  const handleDaySelect = (date: Date) => {
    local.onDaySelect?.(date);
    rangeSelection.selectDate(date);
  };

  const handleDayHover = (date?: Date) => {
    local.onDayHover?.(date);
    rangeSelection.setHoverDate(date);
  };

  return (
    <div
      {...others}
      ref={(node) => {
        if (typeof local.ref === "function") local.ref(node);
      }}
      data-slot="range-calendar"
      data-disabled={isDisabled() ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
      aria-disabled={isDisabled() ? "true" : undefined}
      {...{
        class: twMerge(
          CLASSES.Root.base,
          isDisabled() && CLASSES.Root.flag.disabled,
          local.class,
          local.className,
        ),
      }}
    >
      <Calendar
        {...{ class: CLASSES.Calendar.base }}
        selectionMode="range"
        value={rangeSelection.focusDate() ?? undefined}
        rangeStart={rangeSelection.rangeStart() ?? undefined}
        rangeEnd={rangeSelection.rangeEnd() ?? undefined}
        rangePreview={rangeSelection.hoveredDate() ?? undefined}
        locale={local.locale}
        weekdayFormat={local.weekdayFormat}
        minValue={local.minValue}
        maxValue={local.maxValue}
        isDateUnavailable={local.isDateUnavailable}
        showOutsideDays={local.showOutsideDays}
        isDisabled={isDisabled()}
        onDaySelect={handleDaySelect}
        onDayHover={handleDayHover}
      />
    </div>
  );
};

export default RangeCalendar;
