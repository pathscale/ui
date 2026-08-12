import { recipe } from "solid-layouts";

export const rangeCalendar = recipe({
  component: "range-calendar",
  element: "div",
  slots: {
    root: { base: "range-calendar" },
    calendar: { base: "range-calendar__calendar" },
  },
  state: {
    disabled: { true: "range-calendar--disabled" },
  },
});
