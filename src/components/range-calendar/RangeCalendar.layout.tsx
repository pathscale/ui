import "./RangeCalendar.css";
import type { JSX } from "@solidjs/web";
import { createMemo, omit } from "solid-js";
import {
  type ControlledDateRangeValue,
  useRangeSelection,
} from "../../hooks/date";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import Calendar, { type CalendarWeekdayFormat } from "../calendar";
import type { State, UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./RangeCalendar.recipe";

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
  state?: State;
  disabled?: boolean;
  onDaySelect?: (date: Date) => void;
  onDayHover?: (date?: Date) => void;
};

export type RangeCalendarProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange" | "children"
> &
  UIBaseProps &
  RangeCalendarBaseProps;

const RangeCalendar: Layout<
  typeof componentRecipe,
  RangeCalendarProps
> = () => {
  const others = omit(
    props,
    "class",
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
    "state",
    "disabled",
    "onDaySelect",
    "onDayHover",
  );

  const isDisabled = createMemo(
    () => Boolean(props.state === "disabled") || Boolean(props.disabled),
  );

  const rangeSelection = useRangeSelection({
    value: () => props.value,
    defaultValue: () => props.defaultValue,
    onChange: () => props.onChange,
  });

  const handleDaySelect = (date: Date) => {
    props.onDaySelect?.(date);
    rangeSelection.selectDate(date);
  };

  const handleDayHover = (date?: Date) => {
    props.onDayHover?.(date);
    rangeSelection.setHoverDate(date);
  };

  return (
    <div
      {...others}
      ref={(node) => {
        if (typeof props.ref === "function") props.ref(node);
      }}
      data-slot="range-calendar"
      data-disabled={isDisabled() ? "true" : "false"}
      data-theme={props.dataTheme}
      style={props.style}
      aria-disabled={isDisabled() ? "true" : undefined}
      {...{
        class: twMerge(
          CLASSES.Root.base,
          isDisabled() && CLASSES.Root.flag.disabled,
          props.class,
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
        locale={props.locale}
        weekdayFormat={props.weekdayFormat}
        minValue={props.minValue}
        maxValue={props.maxValue}
        isDateUnavailable={props.isDateUnavailable}
        showOutsideDays={props.showOutsideDays}
        state={isDisabled() ? "disabled" : undefined}
        onDaySelect={handleDaySelect}
        onDayHover={handleDayHover}
      />
    </div>
  );
};

export default RangeCalendar;
