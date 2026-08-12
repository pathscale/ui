import { recipe } from "solid-layouts";

export const dateRangePicker = recipe({
  component: "date-range-picker",
  element: "div",
  slots: {
    root: { base: "date-range-picker" },
    trigger: { base: "date-range-picker__trigger" },
    triggerSegment: { base: "date-range-picker__trigger-segment" },
    triggerIndicator: { base: "date-range-picker__trigger-indicator" },
    triggerIcon: { base: "date-range-picker__trigger-icon" },
    popover: { base: "date-range-picker__popover" },
    calendar: { base: "date-range-picker__calendar" },
    rangeSeparator: { base: "date-range-picker__range-separator" },
  },
  state: {
    open: { true: "date-range-picker--open" },
    disabled: { true: "date-range-picker--disabled" },
    placeholder: { true: { triggerSegment: "date-range-picker__trigger-segment--placeholder" } },
  },
});
